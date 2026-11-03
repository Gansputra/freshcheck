import {
  DetectedFruit,
  PipelineProgress,
  PipelineResult,
} from '@/types/freshcheck';
import { getYoloSession, preprocessYolo, decodeYoloOutput } from './yolo';
import { getInferenceSession } from './session';
import { preprocessImage } from './preprocess';
import { postprocessLogits } from './postprocess';
import {
  DEFAULT_PIPELINE_CONFIG,
  getSpeciesValidation,
  PipelineConfig,
} from '../config/species';

let cropCanvas: HTMLCanvasElement | null = null;
let cropCtx: CanvasRenderingContext2D | null = null;

function getCropCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  if (!cropCanvas) {
    cropCanvas = document.createElement('canvas');
    cropCtx = cropCanvas.getContext('2d', {
      willReadFrequently: true,
    });
  }
  if (!cropCtx) {
    throw new Error('Unable to initialize crop canvas context');
  }
  return { canvas: cropCanvas, ctx: cropCtx };
}

/**
 * Extracts a cropped region from the ORIGINAL image source as a new HTMLCanvasElement and data URL.
 * Guarantees that crops come from the clean original frame, not an annotated overlay.
 */
export function extractOriginalCrop(
  source: CanvasImageSource,
  box: [number, number, number, number]
): { canvas: HTMLCanvasElement; dataUrl: string } {
  const [x1, y1, x2, y2] = box;
  const width = Math.max(16, Math.round(x2 - x1));
  const height = Math.max(16, Math.round(y2 - y1));

  const { canvas, ctx } = getCropCanvas();
  canvas.width = width;
  canvas.height = height;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw ONLY the exact cropped region from original source
  ctx.drawImage(
    source,
    Math.round(x1),
    Math.round(y1),
    width,
    height,
    0,
    0,
    width,
    height
  );

  const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
  return { canvas, dataUrl };
}

/**
 * Executes the complete two-stage AI pipeline:
 * Stage 1: YOLOv8s multi-object fruit detection
 * Stage 2: MobileNetV3 freshness classification on each individual fruit crop
 */
export async function runFruitDetectionPipeline(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  config: PipelineConfig = DEFAULT_PIPELINE_CONFIG,
  onProgress?: (progress: PipelineProgress) => void
): Promise<PipelineResult> {
  const totalStartTime = performance.now();

  // 1. Load both ONNX sessions (reused singleton instances)
  onProgress?.({
    stage: 'loading_models',
    currentCrop: 0,
    totalCrops: 0,
    message: 'Loading YOLOv8s and MobileNetV3 ONNX sessions...',
  });

  const [yoloSession, { session: mobilenetSession, config: mobilenetConfig }] =
    await Promise.all([getYoloSession(), getInferenceSession()]);

  // 2. Stage 1: YOLOv8s Fruit Detection
  onProgress?.({
    stage: 'detecting_fruits',
    currentCrop: 0,
    totalCrops: 0,
    message: 'Detecting fruits in frame with YOLOv8s...',
  });

  const yoloStartTime = performance.now();
  const { scale, padX, padY, tensor: yoloTensor } = preprocessYolo(
    source,
    sourceWidth,
    sourceHeight
  );

  const yoloInputName = yoloSession.inputNames[0] || 'images';
  const yoloOutputs = await yoloSession.run({ [yoloInputName]: yoloTensor });
  const yoloOutputName = yoloSession.outputNames[0] || 'output0';
  const yoloOutputTensor = yoloOutputs[yoloOutputName];

  if (!yoloOutputTensor) {
    throw new Error(`YOLO output tensor '${yoloOutputName}' was not returned by model.`);
  }

  const rawYoloData = yoloOutputTensor.data as Float32Array;
  const rawDetections = decodeYoloOutput(
    rawYoloData,
    scale,
    padX,
    padY,
    sourceWidth,
    sourceHeight,
    config.confidenceThreshold,
    config.iouThreshold
  );

  const yoloTimeMs = Math.round(performance.now() - yoloStartTime);

  // If no fruit detected, return early with empty state
  if (rawDetections.length === 0) {
    const totalTimeMs = Math.round(performance.now() - totalStartTime);
    onProgress?.({
      stage: 'complete',
      currentCrop: 0,
      totalCrops: 0,
      message: 'No fruit detected in frame.',
    });

    return {
      detectedFruits: [],
      yoloInferenceTimeMs: yoloTimeMs,
      freshnessInferenceTimeMs: 0,
      totalTimeMs,
      timestamp: new Date().toLocaleTimeString(),
      imageWidth: sourceWidth,
      imageHeight: sourceHeight,
      noFruitsDetected: true,
    };
  }

  // 3. Stage 2: MobileNetV3 Freshness Classification on each crop
  const freshnessStartTime = performance.now();
  const detectedFruits: DetectedFruit[] = [];

  for (let idx = 0; idx < rawDetections.length; idx++) {
    const det = rawDetections[idx];
    const validation = getSpeciesValidation(det.fruitClass);

    onProgress?.({
      stage: 'classifying_crops',
      currentCrop: idx + 1,
      totalCrops: rawDetections.length,
      message: `Analyzing freshness for ${det.fruitClass} (${idx + 1}/${rawDetections.length})...`,
    });

    // Extract clean crop from the ORIGINAL image
    const { canvas: cropEl, dataUrl } = extractOriginalCrop(source, det.box);

    let freshnessResult = undefined;

    // Check if unvalidated species should be excluded
    const shouldSkipFreshness =
      config.excludeUnvalidatedSpecies && !validation.isValidated;

    if (!shouldSkipFreshness) {
      // Preprocess crop to 224x224 RGB ImageNet normalized tensor
      const cropTensor = preprocessImage(
        cropEl,
        cropEl.width,
        cropEl.height,
        mobilenetConfig
      );

      const mbInputName = mobilenetSession.inputNames[0] || 'image';
      const cropStartTime = performance.now();
      const mbOutputs = await mobilenetSession.run({ [mbInputName]: cropTensor });
      const cropDuration = performance.now() - cropStartTime;

      const mbOutputName = mobilenetSession.outputNames[0] || 'logits';
      const mbLogitsTensor = mbOutputs[mbOutputName];
      if (mbLogitsTensor) {
        const logits = Array.from(mbLogitsTensor.data as Float32Array);
        freshnessResult = postprocessLogits(
          logits,
          mobilenetConfig.classes,
          cropDuration
        );
      }
    }

    detectedFruits.push({
      id: `fruit_${Date.now()}_${idx}_${det.fruitClass}`,
      fruitClass: det.fruitClass,
      classIndex: det.classIndex,
      detectionScore: det.score,
      detectionConfidencePercentage: Math.round(det.score * 1000) / 10,
      box: det.box,
      relativeBox: det.relativeBox,
      cropDataUrl: dataUrl,
      freshnessResult,
      isSpeciesValidated: validation.isValidated,
      validationNotice: validation.notice,
    });
  }

  const freshnessTimeMs = Math.round(performance.now() - freshnessStartTime);
  const totalTimeMs = Math.round(performance.now() - totalStartTime);

  onProgress?.({
    stage: 'complete',
    currentCrop: rawDetections.length,
    totalCrops: rawDetections.length,
    message: `Detection complete: ${detectedFruits.length} fruit(s) identified.`,
  });

  return {
    detectedFruits,
    yoloInferenceTimeMs: yoloTimeMs,
    freshnessInferenceTimeMs: freshnessTimeMs,
    totalTimeMs,
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    }),
    imageWidth: sourceWidth,
    imageHeight: sourceHeight,
    noFruitsDetected: false,
  };
}

