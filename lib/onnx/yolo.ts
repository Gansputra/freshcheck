import * as ort from 'onnxruntime-web';
import { FRUIT_CLASSES, FruitClass } from '@/types/freshcheck';
import { configureOnnxEnv } from './session';

export const YOLO_MODEL_URL = '/models/yolov8s_best.onnx';

let yoloSessionInstance: ort.InferenceSession | null = null;
let yoloInitPromise: Promise<ort.InferenceSession> | null = null;

let yoloCanvas: HTMLCanvasElement | null = null;
let yoloCtx: CanvasRenderingContext2D | null = null;

function getYoloCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  if (!yoloCanvas) {
    yoloCanvas = document.createElement('canvas');
    yoloCanvas.width = 640;
    yoloCanvas.height = 640;
    yoloCtx = yoloCanvas.getContext('2d', {
      willReadFrequently: true,
      alpha: false,
    });
  }
  if (!yoloCtx) {
    throw new Error('Unable to initialize 2D canvas context for YOLO preprocessing');
  }
  return { canvas: yoloCanvas, ctx: yoloCtx };
}

/**
 * Initializes and caches the YOLOv8 ONNX session (Singleton).
 * Uses fetch() to read ArrayBuffer directly, providing robust error reporting.
 */
export async function getYoloSession(): Promise<ort.InferenceSession> {
  if (yoloSessionInstance) {
    return yoloSessionInstance;
  }

  if (yoloInitPromise) {
    return await yoloInitPromise;
  }

  configureOnnxEnv();

  yoloInitPromise = (async () => {
    try {
      console.log(`[FreshCheck] Fetching YOLOv8 model from ${YOLO_MODEL_URL}...`);
      const res = await fetch(YOLO_MODEL_URL, {
        headers: {
          'Bypass-Tunnel-Reminder': 'true',
        },
      });

      if (!res.ok) {
        throw new Error(
          `Gagal mengunduh file ${YOLO_MODEL_URL} (HTTP ${res.status}: ${res.statusText}).`
        );
      }

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error(
          'File model mengembalikan halaman HTML. Jika menggunakan Localtunnel, silakan selesaikan halaman verifikasi Localtunnel terlebih dahulu.'
        );
      }

      const buffer = await res.arrayBuffer();
      console.log(`[FreshCheck] YOLOv8 model downloaded (${buffer.byteLength} bytes). Creating inference session...`);

      const session = await ort.InferenceSession.create(buffer, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      });

      console.log('[FreshCheck] YOLOv8 inference session created successfully.');
      yoloSessionInstance = session;
      return session;
    } catch (err: unknown) {
      console.error('[FreshCheck] Error initializing YOLO model:', err);
      yoloInitPromise = null;
      yoloSessionInstance = null;
      throw err;
    }
  })();

  return await yoloInitPromise;
}

export interface YoloLetterbox {
  scale: number;
  padX: number;
  padY: number;
  tensor: ort.Tensor;
}

/**
 * Preprocesses an image source to a 640x640 letterboxed RGB tensor [1, 3, 640, 640].
 * Maintains aspect ratio with gray (114, 114, 114) letterbox padding.
 */
export function preprocessYolo(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number
): YoloLetterbox {
  const { canvas, ctx } = getYoloCanvas();

  const targetSize = 640;
  const scale = Math.min(targetSize / sourceWidth, targetSize / sourceHeight);
  const newW = Math.round(sourceWidth * scale);
  const newH = Math.round(sourceHeight * scale);
  const padX = (targetSize - newW) / 2;
  const padY = (targetSize - newH) / 2;

  // 1. Fill gray padding (114, 114, 114 standard Ultralytics YOLOv8 letterbox color)
  ctx.fillStyle = '#727272';
  ctx.fillRect(0, 0, targetSize, targetSize);

  // 2. High quality bilinear resize
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 3. Draw scaled image centered
  ctx.drawImage(source, padX, padY, newW, newH);

  // 4. Read pixel data
  const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
  const rgba = imageData.data;
  const numPixels = targetSize * targetSize;
  const tensorData = new Float32Array(3 * numPixels);

  const channelOffsetR = 0;
  const channelOffsetG = numPixels;
  const channelOffsetB = numPixels * 2;

  for (let i = 0; i < numPixels; i++) {
    const rgbaIdx = i * 4;
    // Normalize to [0.0, 1.0]
    tensorData[channelOffsetR + i] = rgba[rgbaIdx] / 255.0;
    tensorData[channelOffsetG + i] = rgba[rgbaIdx + 1] / 255.0;
    tensorData[channelOffsetB + i] = rgba[rgbaIdx + 2] / 255.0;
  }

  const tensor = new ort.Tensor('float32', tensorData, [1, 3, targetSize, targetSize]);

  return { scale, padX, padY, tensor };
}

export interface RawDetection {
  classIndex: number;
  fruitClass: FruitClass;
  score: number;
  box: [number, number, number, number]; // [x1, y1, x2, y2] in original image coordinates
  relativeBox: [number, number, number, number]; // [rx1, ry1, rx2, ry2] in 0..1 range
}

/**
 * Calculates Intersection over Union (IoU) between two boxes [x1, y1, x2, y2]
 */
function computeIoU(
  boxA: [number, number, number, number],
  boxB: [number, number, number, number]
): number {
  const xA = Math.max(boxA[0], boxB[0]);
  const yA = Math.max(boxA[1], boxB[1]);
  const xB = Math.min(boxA[2], boxB[2]);
  const yB = Math.min(boxA[3], boxB[3]);

  const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
  const areaA = Math.max(0, boxA[2] - boxA[0]) * Math.max(0, boxA[3] - boxA[1]);
  const areaB = Math.max(0, boxB[2] - boxB[0]) * Math.max(0, boxB[3] - boxB[1]);

  const unionArea = areaA + areaB - interArea;
  if (unionArea <= 0) return 0;
  return interArea / unionArea;
}

/**
 * Applies Non-Maximum Suppression (NMS) to eliminate duplicate overlapping boxes
 */
export function applyNMS(
  detections: RawDetection[],
  iouThreshold = 0.45
): RawDetection[] {
  detections.sort((a, b) => b.score - a.score);

  const selected: RawDetection[] = [];

  for (const candidate of detections) {
    let shouldKeep = true;

    for (const chosen of selected) {
      const iou = computeIoU(candidate.box, chosen.box);
      if (iou > iouThreshold) {
        shouldKeep = false;
        break;
      }
    }

    if (shouldKeep) {
      selected.push(candidate);
    }
  }

  return selected;
}

/**
 * Decodes YOLO output tensor [1, 10, 8400] into coordinate-mapped detections.
 * 10 rows: [cx, cy, w, h, class0, class1, class2, class3, class4, class5]
 */
export function decodeYoloOutput(
  outputData: Float32Array,
  scale: number,
  padX: number,
  padY: number,
  origWidth: number,
  origHeight: number,
  confThreshold = 0.35,
  iouThreshold = 0.45
): RawDetection[] {
  const numAnchors = 8400;
  const numClasses = FRUIT_CLASSES.length; // 6
  const candidates: RawDetection[] = [];

  for (let i = 0; i < numAnchors; i++) {
    // 1. Find highest class score among the 6 classes
    let maxScore = 0;
    let bestClassIdx = 0;

    for (let c = 0; c < numClasses; c++) {
      const score = outputData[(4 + c) * numAnchors + i];
      if (score > maxScore) {
        maxScore = score;
        bestClassIdx = c;
      }
    }

    if (maxScore < confThreshold) {
      continue;
    }

    // 2. Extract bounding box coordinates in 640x640 space
    const cx = outputData[0 * numAnchors + i];
    const cy = outputData[1 * numAnchors + i];
    const w = outputData[2 * numAnchors + i];
    const h = outputData[3 * numAnchors + i];

    const boxX1 = cx - w / 2;
    const boxY1 = cy - h / 2;
    const boxX2 = cx + w / 2;
    const boxY2 = cy + h / 2;

    // 3. Unpad and map back to original image coordinates
    const origX1 = Math.max(0, Math.min(origWidth, (boxX1 - padX) / scale));
    const origY1 = Math.max(0, Math.min(origHeight, (boxY1 - padY) / scale));
    const origX2 = Math.max(0, Math.min(origWidth, (boxX2 - padX) / scale));
    const origY2 = Math.max(0, Math.min(origHeight, (boxY2 - padY) / scale));

    const boxW = origX2 - origX1;
    const boxH = origY2 - origY1;

    if (boxW < 8 || boxH < 8) {
      continue;
    }

    const rx1 = origX1 / origWidth;
    const ry1 = origY1 / origHeight;
    const rx2 = origX2 / origWidth;
    const ry2 = origY2 / origHeight;

    candidates.push({
      classIndex: bestClassIdx,
      fruitClass: FRUIT_CLASSES[bestClassIdx],
      score: maxScore,
      box: [origX1, origY1, origX2, origY2],
      relativeBox: [rx1, ry1, rx2, ry2],
    });
  }

  return applyNMS(candidates, iouThreshold);
}
