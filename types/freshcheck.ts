export type FreshnessClass = 'Fresh' | 'Semi-Fresh' | 'Rotten';

export type FruitClass =
  | 'Apple'
  | 'Banana'
  | 'Grape'
  | 'Orange'
  | 'Pineapple'
  | 'Watermelon';

export const FRUIT_CLASSES: readonly FruitClass[] = [
  'Apple',
  'Banana',
  'Grape',
  'Orange',
  'Pineapple',
  'Watermelon',
] as const;

export interface ModelConfig {
  model: string;
  input_size: [number, number];
  input_channels: number;
  color_order: 'RGB' | 'BGR';
  normalization: {
    mean: [number, number, number];
    std: [number, number, number];
  };
  classes: FreshnessClass[];
}

export interface ClassProbability {
  className: FreshnessClass;
  probability: number; // 0.0 - 1.0
  percentage: number;  // 0.0 - 100.0
  logit: number;
}

export interface PredictionResult {
  topClass: FreshnessClass;
  confidence: number; // 0.0 - 1.0
  confidencePercentage: number; // 0.0 - 100.0
  probabilities: ClassProbability[];
  rawLogits: number[];
  inferenceTimeMs: number;
  timestamp: string;
  explanation: string;
}

/**
 * Single detected fruit object with bounding box and freshness evaluation
 */
export interface DetectedFruit {
  id: string;
  fruitClass: FruitClass;
  classIndex: number;
  detectionScore: number; // 0.0 - 1.0
  detectionConfidencePercentage: number; // 0.0 - 100.0
  // Absolute bounding box in original image pixels: [x1, y1, x2, y2]
  box: [number, number, number, number];
  // Normalized bounding box in range [0..1]: [rx1, ry1, rx2, ry2]
  relativeBox: [number, number, number, number];
  // Thumbnail data URL extracted from ORIGINAL image
  cropDataUrl?: string;
  // Freshness classification result from MobileNetV3
  freshnessResult?: PredictionResult;
  // Scientific validation status
  isSpeciesValidated: boolean;
  validationNotice?: string;
}

export type PipelineStage =
  | 'idle'
  | 'loading_models'
  | 'detecting_fruits'
  | 'classifying_crops'
  | 'complete'
  | 'error';

export interface PipelineProgress {
  stage: PipelineStage;
  currentCrop: number;
  totalCrops: number;
  message: string;
}

export interface PipelineResult {
  detectedFruits: DetectedFruit[];
  yoloInferenceTimeMs: number;
  freshnessInferenceTimeMs: number;
  totalTimeMs: number;
  timestamp: string;
  imageWidth: number;
  imageHeight: number;
  noFruitsDetected: boolean;
}

export interface DualModelStatus {
  yolo: ModelStatus;
  mobilenet: ModelStatus;
  overall: ModelStatus;
  errorMessage: string | null;
}

export type ModelStatus = 'uninitialized' | 'loading' | 'ready' | 'error';

export type CameraStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'error' | 'unsupported';
