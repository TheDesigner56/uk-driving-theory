// FSRS-inspired spaced repetition algorithm
// Simplified implementation based on the FSRS-5 paper

import { SpacedRepState } from '../types';

const STAGE_INTERVALS = [
  0,     // stage 0: just introduced
  4,     // stage 1: 4 hours
  24,    // stage 2: 1 day
  72,    // stage 3: 3 days
  168,   // stage 4: 7 days
  336,   // stage 5: 14 days
  720,   // stage 6: 30 days
  2160,  // stage 7: 90 days
];

const STABILITY_MULTIPLIERS = {
  1: 2.5,   // easy
  2: 1.8,
  3: 1.0,   // medium
  4: 0.5,
  5: 0.3,   // hard (almost reset)
};

export function createInitialState(cardId: string): SpacedRepState {
  return {
    cardId,
    stage: 0,
    dueDate: Date.now(),
    stability: 1,
    difficulty: 3,
    lastReviewed: 0,
    reviewCount: 0,
  };
}

export function calculateNextReview(
  state: SpacedRepState,
  difficulty: 1 | 2 | 3 | 4 | 5
): SpacedRepState {
  const mult = STABILITY_MULTIPLIERS[difficulty] || 1.0;
  const newStability = state.stability * mult;
  const newStage = difficulty <= 2
    ? Math.min(state.stage + 1, 7)
    : difficulty === 3
      ? state.stage
      : Math.max(state.stage - 1, 0);

  const intervalHours = STAGE_INTERVALS[newStage] * Math.max(1, newStability / state.stability);
  const dueDate = Date.now() + intervalHours * 3600 * 1000;

  return {
    ...state,
    stage: newStage,
    dueDate,
    stability: newStability,
    difficulty: difficulty as any,
    lastReviewed: Date.now(),
    reviewCount: state.reviewCount + 1,
  };
}

export function getDueCards(states: SpacedRepState[]): SpacedRepState[] {
  const now = Date.now();
  return states.filter(s => s.dueDate <= now);
}

export function getWeakCategories(states: SpacedRepState[], cardCategories: Record<string, string>): Record<string, number> {
  const weakness: Record<string, { total: number; score: number }> = {};
  for (const state of states) {
    const cat = cardCategories[state.cardId] || 'unknown';
    if (!weakness[cat]) weakness[cat] = { total: 0, score: 0 };
    weakness[cat].total++;
    weakness[cat].score += (6 - state.difficulty); // lower difficulty = higher score
  }
  const result: Record<string, number> = {};
  for (const [cat, data] of Object.entries(weakness)) {
    result[cat] = Math.round((data.score / (data.total * 5)) * 100);
  }
  return result;
}
