import { useState, useRef, useCallback, useEffect } from 'react';
import {
  DualModelStatus,
  PipelineProgress,
  PipelineResult,
} from '@/types/freshcheck';
import { getYoloSession } from '@/lib/onnx/yolo';
import { getInferenceSession } from '@/lib/onnx/session';
import { runFruitDetectionPipeline } from '@/lib/onnx/pipeline';
import { DEFAULT_PIPELINE_CONFIG, PipelineConfig } from '@/lib/config/species';

interface UsePipelineOptions {
  inferenceIntervalMs?: number; // Default 800ms
  initialConfig?: Partial<PipelineConfig>;
}

export function useFruitDetectionPipeline(options: UsePipelineOptions = {}) {
  const { inferenceIntervalMs = 800, initialConfig = {} } = options;

  const [pipelineConfig, setPipelineConfig] = useState<PipelineConfig>({
    ...DEFAULT_PIPELINE_CONFIG,
    ...initialConfig,
  });

  const [modelStatus, setModelStatus] = useState<DualModelStatus>({
    yolo: 'uninitialized',
    mobilenet: 'uninitialized',
    overall: 'uninitialized',
    errorMessage: null,
  });

  const [progress, setProgress] = useState<PipelineProgress>({
    stage: 'idle',
    currentCrop: 0,
    totalCrops: 0,
    message: '',
  });

  const [result, setResult] = useState<PipelineResult | null>(null);
  const [isInferring, setIsInferring] = useState(false);

  // Concurrency guard to strictly avoid overlapping inference runs
  const isInferringRef = useRef(false);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const configRef = useRef(pipelineConfig);
  configRef.current = pipelineConfig;
  const modelStatusRef = useRef(modelStatus);
  modelStatusRef.current = modelStatus;
  const initPromiseRef = useRef<Promise<void> | null>(null);

  // Initialize both ONNX models on demand (lazy singleton pattern)
  const initModels = useCallback(async () => {
    if (modelStatusRef.current.overall === 'ready') {
      return;
    }
    if (initPromiseRef.current) {
      return await initPromiseRef.current;
    }

    setModelStatus((prev) => ({
      ...prev,
      overall: 'loading',
      yolo: prev.yolo === 'ready' ? 'ready' : 'loading',
      mobilenet: prev.mobilenet === 'ready' ? 'ready' : 'loading',
      errorMessage: null,
    }));
    setProgress({
      stage: 'loading_models',
      currentCrop: 0,
      totalCrops: 0,
      message: 'Loading YOLOv8s and MobileNetV3 models...',
    });

    initPromiseRef.current = (async () => {
      try {
        // 1. Initialize YOLO
        await getYoloSession();
        setModelStatus((prev) => ({ ...prev, yolo: 'ready' }));

        // 2. Initialize MobileNetV3
        await getInferenceSession();
        setModelStatus((prev) => ({
          ...prev,
          mobilenet: 'ready',
          overall: 'ready',
          errorMessage: null,
        }));

        setProgress({
          stage: 'idle',
          currentCrop: 0,
          totalCrops: 0,
          message: 'Models loaded and ready for scanning.',
        });
      } catch (err: unknown) {
        const error = err as Error;
        console.error('Model initialization error:', error);
        setModelStatus({
          yolo: 'error',
          mobilenet: 'error',
          overall: 'error',
          errorMessage:
            error.message ||
            'Failed to load ONNX models. Please verify freshcheck_v21_yolov8s.onnx and freshcheck_mobilenetv3.onnx in public/models/.',
        });
        setProgress({
          stage: 'error',
          currentCrop: 0,
          totalCrops: 0,
          message: 'Error loading models.',
        });
        throw error;
      } finally {
        initPromiseRef.current = null;
      }
    })();

    return await initPromiseRef.current;
  }, []);

  // Execute pipeline on a single image or video frame
  const inferSource = useCallback(
    async (
      source: CanvasImageSource,
      width: number,
      height: number
    ): Promise<PipelineResult | null> => {
      if (isInferringRef.current) {
        return null;
      }

      try {
        isInferringRef.current = true;
        setIsInferring(true);

        // Ensure models are initialized on demand
        if (modelStatusRef.current.overall !== 'ready') {
          await initModels();
        }

        const pipelineRes = await runFruitDetectionPipeline(
          source,
          width,
          height,
          configRef.current,
          (prog) => setProgress(prog)
        );

        setResult(pipelineRes);
        return pipelineRes;
      } catch (err: unknown) {
        const error = err as Error;
        console.error('Pipeline execution error:', error);
        setProgress({
          stage: 'error',
          currentCrop: 0,
          totalCrops: 0,
          message: error.message || 'Pipeline error during inference.',
        });
        return null;
      } finally {
        isInferringRef.current = false;
        setIsInferring(false);
      }
    },
    []
  );

  // Start continuous loop for live camera feed
  const startContinuousInference = useCallback(
    (videoEl: HTMLVideoElement) => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }

      intervalIdRef.current = setInterval(async () => {
        if (
          !videoEl ||
          videoEl.paused ||
          videoEl.ended ||
          videoEl.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
          videoEl.videoWidth === 0 ||
          videoEl.videoHeight === 0
        ) {
          return;
        }

        if (!isInferringRef.current) {
          await inferSource(videoEl, videoEl.videoWidth, videoEl.videoHeight);
        }
      }, inferenceIntervalMs);
    },
    [inferSource, inferenceIntervalMs]
  );

  const stopContinuousInference = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    setProgress({
      stage: 'idle',
      currentCrop: 0,
      totalCrops: 0,
      message: 'Scanner stopped.',
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  return {
    modelStatus,
    progress,
    result,
    isInferring,
    pipelineConfig,
    setPipelineConfig,
    initModels,
    inferSource,
    startContinuousInference,
    stopContinuousInference,
    clearResult: () => setResult(null),
  };
}

