import { ModelConfig } from '@/types/freshcheck';

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  model: 'MobileNetV3-Large',
  input_size: [224, 224],
  input_channels: 3,
  color_order: 'RGB',
  normalization: {
    mean: [0.485, 0.456, 0.406],
    std: [0.229, 0.224, 0.225],
  },
  classes: ['Fresh', 'Semi-Fresh', 'Rotten'],
};

export const MODEL_URL = '/models/freshcheck_mobilenetv3.onnx';
export const CONFIG_URL = '/models/freshcheck_config.json';

export async function fetchModelConfig(): Promise<ModelConfig> {
  try {
    const res = await fetch(CONFIG_URL, { cache: 'no-store' });
    if (!res.ok) {
      console.warn(`Could not load config from ${CONFIG_URL}, using defaults.`);
      return DEFAULT_MODEL_CONFIG;
    }
    const data = await res.json();
    return {
      model: data.model || DEFAULT_MODEL_CONFIG.model,
      input_size: data.input_size || DEFAULT_MODEL_CONFIG.input_size,
      input_channels: data.input_channels || DEFAULT_MODEL_CONFIG.input_channels,
      color_order: data.color_order || DEFAULT_MODEL_CONFIG.color_order,
      normalization: {
        mean: data.normalization?.mean || DEFAULT_MODEL_CONFIG.normalization.mean,
        std: data.normalization?.std || DEFAULT_MODEL_CONFIG.normalization.std,
      },
      classes: data.classes || DEFAULT_MODEL_CONFIG.classes,
    };
  } catch (err) {
    console.warn('Failed to parse config json, using default config:', err);
    return DEFAULT_MODEL_CONFIG;
  }
}

