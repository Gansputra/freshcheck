import * as ort from 'onnxruntime-web';
import { ModelConfig } from '@/types/freshcheck';

let offscreenCanvas: HTMLCanvasElement | null = null;
let offscreenCtx: CanvasRenderingContext2D | null = null;

function getCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  if (!offscreenCanvas) {
    offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 224;
    offscreenCanvas.height = 224;
    offscreenCtx = offscreenCanvas.getContext('2d', {
      willReadFrequently: true,
      alpha: false,
    });
  }
  if (!offscreenCtx) {
    throw new Error('Unable to initialize 2D canvas context for preprocessing');
  }
  return { canvas: offscreenCanvas, ctx: offscreenCtx };
}

/**
 * Preprocesses an image source (HTMLVideoElement, HTMLImageElement, HTMLCanvasElement)
 * to an ONNX Tensor of shape [1, 3, 224, 224] conforming strictly to:
 * - 224x224 Bilinear scaling
 * - Center crop aspect-ratio preserving
 * - RGB color channels [0, 1]
 * - Mean normalization: [0.485, 0.456, 0.406]
 * - Std normalization: [0.229, 0.224, 0.225]
 * - NCHW layout: [batch=1, channels=3, height=224, width=224]
 */
export function preprocessImage(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  config: ModelConfig
): ort.Tensor {
  const [targetWidth, targetHeight] = config.input_size;
  const { canvas, ctx } = getCanvas();

  // Reset dimensions if config changes
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  // High quality bilinear / bicubic interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Compute square center-crop coordinates from source to preserve aspect ratio
  const minDim = Math.min(sourceWidth, sourceHeight);
  const srcX = Math.max(0, (sourceWidth - minDim) / 2);
  const srcY = Math.max(0, (sourceHeight - minDim) / 2);

  // Draw square region onto 224x224 canvas
  ctx.drawImage(
    source,
    srcX,
    srcY,
    minDim,
    minDim,
    0,
    0,
    targetWidth,
    targetHeight
  );

  // Read raw RGBA pixel buffer
  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const rgbaData = imageData.data; // Uint8ClampedArray [R, G, B, A, R, G, B, A, ...]

  const numPixels = targetWidth * targetHeight;
  const tensorBuffer = new Float32Array(3 * numPixels);

  const mean = config.normalization.mean;
  const std = config.normalization.std;

  // Planar NCHW format:
  // Channel 0 (R): 0 to numPixels - 1
  // Channel 1 (G): numPixels to 2*numPixels - 1
  // Channel 2 (B): 2*numPixels to 3*numPixels - 1
  const channelOffsetR = 0;
  const channelOffsetG = numPixels;
  const channelOffsetB = numPixels * 2;

  for (let i = 0; i < numPixels; i++) {
    const rgbaIndex = i * 4;
    const r = rgbaData[rgbaIndex];
    const g = rgbaData[rgbaIndex + 1];
    const b = rgbaData[rgbaIndex + 2];

    // 1. Scale pixel values to [0, 1]
    // 2. Normalize each channel: (val - mean) / std
    tensorBuffer[channelOffsetR + i] = (r / 255.0 - mean[0]) / std[0];
    tensorBuffer[channelOffsetG + i] = (g / 255.0 - mean[1]) / std[1];
    tensorBuffer[channelOffsetB + i] = (b / 255.0 - mean[2]) / std[2];
  }

  return new ort.Tensor('float32', tensorBuffer, [1, 3, targetHeight, targetWidth]);
}

