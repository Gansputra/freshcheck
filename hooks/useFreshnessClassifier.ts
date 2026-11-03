import { useState, useRef, useCallback, useEffect } from 'react';
import { ModelStatus, PredictionResult } from '@/types/freshcheck';
import { getInferenceSession, runInferenceOnSource } from '@/lib/onnx/session';

interface UseFreshnessClassifierOptions {
  inferenceIntervalMs?: number; // Default 650ms (between 500-800ms)
}

export function useFreshnessClassifier(options: UseFreshnessClassifierOptions = {}) {
  const { inferenceIntervalMs = 650 } = options;

  const [modelStatus, setModelStatus] = useState<ModelStatus>('uninitialized');
  const [modelError, setModelError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isInferring, setIsInferring] = useState(false);

  // Concurrency guard to strictly prevent overlapping inference calls
  const isInferringRef = useRef(false);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize ONNX Model Session once
  const initModel = useCallback(async () => {
    try {
      setModelStatus('loading');
      setModelError(null);
      await getInferenceSession();
      setModelStatus('ready');
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Failed to initialize ONNX model:', error);
      setModelStatus('error');
      setModelError(error.message || 'Failed to load ONNX model. Please verify public/models/ exists.');
    }
  }, []);

  // Run single inference pass on an image/video source
  const inferSource = useCallback(
    async (
      source: CanvasImageSource,
      width: number,
      height: number
    ): Promise<PredictionResult | null> => {
      if (isInferringRef.current) {
        return null; // Skip if previous inference is still processing
      }

      try {
        isInferringRef.current = true;
        setIsInferring(true);

        const result = await runInferenceOnSource(source, width, height);
        setPrediction(result);
        return result;
      } catch (err: unknown) {
        const error = err as Error;
        console.error('Inference error:', error);
        return null;
      } finally {
        isInferringRef.current = false;
        setIsInferring(false);
      }
    },
    []
  );

  // Start continuous loop on video element
  const startContinuousInference = useCallback(
    (videoEl: HTMLVideoElement) => {
      // Clear any prior interval
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }

      intervalIdRef.current = setInterval(async () => {
        // Guard: check video readiness and non-zero dimensions
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

        // Only run if not currently inferring
        if (!isInferringRef.current) {
          await inferSource(videoEl, videoEl.videoWidth, videoEl.videoHeight);
        }
      }, inferenceIntervalMs);
    },
    [inferSource, inferenceIntervalMs]
  );

  // Stop continuous loop
  const stopContinuousInference = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
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
    modelError,
    prediction,
    isInferring,
    initModel,
    inferSource,
    startContinuousInference,
    stopContinuousInference,
    clearPrediction: () => setPrediction(null),
  };
}

