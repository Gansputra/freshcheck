import { FruitClass } from '@/types/freshcheck';

export interface SpeciesValidationInfo {
  isValidated: boolean;
  statusLabel: 'Validated' | 'Unverified Coverage';
  notice: string;
}

/**
 * Explicit mapping of scientific dataset validation status for each detected fruit species.
 * Until the freshness classifier's species-level training dataset is formally verified,
 * only confirmed produce types are marked as validated.
 */
export const SPECIES_VALIDATION_MAP: Record<FruitClass, SpeciesValidationInfo> = {
  Apple: {
    isValidated: true,
    statusLabel: 'Validated',
    notice: 'Dataset coverage verified for Apple freshness classification.',
  },
  Banana: {
    isValidated: true,
    statusLabel: 'Validated',
    notice: 'Dataset coverage verified for Banana freshness classification.',
  },
  Orange: {
    isValidated: true,
    statusLabel: 'Validated',
    notice: 'Dataset coverage verified for Citrus/Orange freshness classification.',
  },
  Cherry: {
    isValidated: false,
    statusLabel: 'Unverified Coverage',
    notice:
      'Notice: Freshness classifier has not been scientifically validated for Cherry species. Predictions are experimental.',
  },
  DragonFruit: {
    isValidated: false,
    statusLabel: 'Unverified Coverage',
    notice:
      'Notice: Freshness classifier has not been scientifically validated for DragonFruit species. Predictions are experimental.',
  },
  Fig: {
    isValidated: false,
    statusLabel: 'Unverified Coverage',
    notice:
      'Notice: Freshness classifier has not been scientifically validated for Fig species. Predictions are experimental.',
  },
  Grape: {
    isValidated: false,
    statusLabel: 'Unverified Coverage',
    notice:
      'Notice: Freshness classifier has not been scientifically validated for Grape species. Predictions are experimental.',
  },
  Lemon: {
    isValidated: false,
    statusLabel: 'Unverified Coverage',
    notice:
      'Notice: Freshness classifier has not been scientifically validated for Lemon species. Predictions are experimental.',
  },
  Lime: {
    isValidated: false,
    statusLabel: 'Unverified Coverage',
    notice:
      'Notice: Freshness classifier has not been scientifically validated for Lime species. Predictions are experimental.',
  },
  Lychee: {
    isValidated: false,
    statusLabel: 'Unverified Coverage',
    notice:
      'Notice: Freshness classifier has not been scientifically validated for Lychee species. Predictions are experimental.',
  },
  Mango: {
    isValidated: false,
    statusLabel: 'Unverified Coverage',
    notice:
      'Notice: Freshness classifier has not been scientifically validated for Mango species. Predictions are experimental.',
  },
  Peach: {
    isValidated: false,
    statusLabel: 'Unverified Coverage',
    notice:
      'Notice: Freshness classifier has not been scientifically validated for Peach species. Predictions are experimental.',
  },
  Pineapple: {
    isValidated: false,
    statusLabel: 'Unverified Coverage',
    notice:
      'Notice: Freshness classifier has not been scientifically validated for Pineapple species. Predictions are experimental.',
  },
  Tomato: {
    isValidated: false,
    statusLabel: 'Unverified Coverage',
    notice:
      'Notice: Freshness classifier has not been scientifically validated for Tomato species. Predictions are experimental.',
  },
  Watermelon: {
    isValidated: false,
    statusLabel: 'Unverified Coverage',
    notice:
      'Notice: Freshness classifier has not been scientifically validated for Watermelon species. Predictions are experimental.',
  },
};

/**
 * Configuration for the detection & classification pipeline.
 */
export interface PipelineConfig {
  confidenceThreshold: number; // YOLO confidence filter (0.0 - 1.0)
  iouThreshold: number;        // NMS IoU threshold (0.0 - 1.0)
  excludeUnvalidatedSpecies: boolean; // If true, skips freshness classification on unvalidated species
}

export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  confidenceThreshold: 0.25,
  iouThreshold: 0.45,
  excludeUnvalidatedSpecies: false, // Default false: evaluates with prominent scientific notice
};

/**
 * Returns species validation metadata
 */
export function getSpeciesValidation(fruitClass: FruitClass): SpeciesValidationInfo {
  return (
    SPECIES_VALIDATION_MAP[fruitClass] || {
      isValidated: false,
      statusLabel: 'Unverified Coverage',
      notice: `Notice: Freshness classifier coverage for ${fruitClass} is not scientifically validated.`,
    }
  );
}
