import { ClassProbability, FreshnessClass, PredictionResult } from '@/types/freshcheck';

/**
 * Numerically stable Softmax calculation.
 */
export function softmax(logits: number[]): number[] {
  if (logits.length === 0) return [];
  const max = Math.max(...logits);
  const expValues = logits.map((val) => Math.exp(val - max));
  const sumExp = expValues.reduce((acc, curr) => acc + curr, 0);
  return expValues.map((val) => val / sumExp);
}

const EXPLANATIONS: Record<FreshnessClass, string> = {
  Fresh: 'The model classifies this sample as Fresh.',
  'Semi-Fresh': 'The model classifies this sample as Semi-Fresh.',
  Rotten: 'The model classifies this sample as Rotten.',
};

/**
 * Transforms raw ONNX output logits into a typed PredictionResult
 */
export function postprocessLogits(
  rawLogits: number[],
  classes: FreshnessClass[],
  inferenceTimeMs: number
): PredictionResult {
  const probabilities = softmax(rawLogits);

  const classProbabilities: ClassProbability[] = classes.map((className, index) => {
    const prob = probabilities[index] ?? 0;
    return {
      className,
      probability: prob,
      percentage: Math.round(prob * 1000) / 10, // 1 decimal place, e.g. 92.4%
      logit: rawLogits[index] ?? 0,
    };
  });

  // Find class with highest probability
  let topItem = classProbabilities[0];
  for (let i = 1; i < classProbabilities.length; i++) {
    if (classProbabilities[i].probability > topItem.probability) {
      topItem = classProbabilities[i];
    }
  }

  const now = new Date();
  const timestamp = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });

  return {
    topClass: topItem.className,
    confidence: topItem.probability,
    confidencePercentage: topItem.percentage,
    probabilities: classProbabilities,
    rawLogits: [...rawLogits],
    inferenceTimeMs: Math.round(inferenceTimeMs),
    timestamp,
    explanation: EXPLANATIONS[topItem.className] || `The model classifies this sample as ${topItem.className}.`,
  };
}

