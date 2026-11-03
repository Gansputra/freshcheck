import * as ort from 'onnxruntime-web';
import { ModelConfig, PredictionResult } from '@/types/freshcheck';
import { fetchModelConfig, MODEL_URL } from './config';
import { preprocessImage } from './preprocess';
import { postprocessLogits } from './postprocess';

// Global singleton inference session reference
let sessionInstance: ort.InferenceSession | null = null;
let cachedConfig: ModelConfig | null = null;
let initPromise: Promise<ort.InferenceSession> | null = null;

/**
 * Configure ONNX WebAssembly environment
 */
export function configureOnnxEnv(): void {
  if (typeof window === 'undefined') return;

  // Point to local WASM binaries in public/ort-wasm/
  ort.env.wasm.wasmPaths = '/ort-wasm/';
  
  // Use 1 thread to avoid SharedArrayBuffer issues on browsers with strict COOP/COEP policies
  ort.env.wasm.numThreads = 1;
}

/**
 * Initializes and caches the ONNX Inference Session (Singleton).
 * Uses fetch() to read ArrayBuffer directly, providing robust error reporting.
 */
export async function getInferenceSession(): Promise<{
  session: ort.InferenceSession;
  config: ModelConfig;
}> {
  if (sessionInstance && cachedConfig) {
    return { session: sessionInstance, config: cachedConfig };
  }

  if (initPromise) {
    const session = await initPromise;
    return { session, config: cachedConfig! };
  }

  configureOnnxEnv();

  initPromise = (async () => {
    try {
      // 1. Fetch config
      const config = await fetchModelConfig();
      cachedConfig = config;

      // 2. Fetch model as ArrayBuffer
      console.log(`[FreshCheck] Fetching MobileNetV3 model from ${MODEL_URL}...`);
      const res = await fetch(MODEL_URL, {
        headers: {
          'Bypass-Tunnel-Reminder': 'true',
        },
      });

      if (!res.ok) {
        throw new Error(
          `Gagal mengunduh file ${MODEL_URL} (HTTP ${res.status}: ${res.statusText}).`
        );
      }

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error(
          'File model mengembalikan halaman HTML. Jika menggunakan Localtunnel, silakan selesaikan halaman verifikasi Localtunnel terlebih dahulu.'
        );
      }

      const buffer = await res.arrayBuffer();
      console.log(`[FreshCheck] MobileNetV3 downloaded (${buffer.byteLength} bytes). Creating session...`);

      // 3. Create Inference Session with WebAssembly execution provider
      const session = await ort.InferenceSession.create(buffer, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      });

      console.log('[FreshCheck] MobileNetV3 inference session created successfully.');
      sessionInstance = session;
      return session;
    } catch (err: unknown) {
      console.error('[FreshCheck] Error initializing MobileNetV3 model:', err);
      initPromise = null;
      sessionInstance = null;
      throw err;
    }
  })();

  const session = await initPromise;
  return { session, config: cachedConfig! };
}

/**
 * Executes a single inference pass on an image source
 */
export async function runInferenceOnSource(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number
): Promise<PredictionResult> {
  const { session, config } = await getInferenceSession();

  // 1. Preprocess into [1, 3, 224, 224] tensor
  const tensor = preprocessImage(source, sourceWidth, sourceHeight, config);

  // 2. Prepare feed map matching model's expected input name
  const inputName = session.inputNames[0] || 'image';
  const feeds: Record<string, ort.Tensor> = {
    [inputName]: tensor,
  };

  // 3. Measure inference execution duration
  const startTime = performance.now();
  const outputs = await session.run(feeds);
  const durationMs = performance.now() - startTime;

  // 4. Extract output logits
  const outputName = session.outputNames[0] || 'logits';
  const outputTensor = outputs[outputName];
  if (!outputTensor) {
    throw new Error(`Output '${outputName}' not found in ONNX session outputs`);
  }

  const logits = Array.from(outputTensor.data as Float32Array);

  // 5. Apply Softmax and construct result
  return postprocessLogits(logits, config.classes, durationMs);
}
