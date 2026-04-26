export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  category: CategoryKey;
  explanation: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  caseStudy?: { video: string; questions: string[] };
  imageRef?: string; // SVG sign reference
}

export interface FlashCard {
  id: string;
  front: string;
  back: string;
  category: CategoryKey;
  imageRef?: string;
}

export interface HazardScenario {
  id: string;
  title: string;
  description: string;
  hazards: HazardEvent[];
  duration: number; // seconds simulated
}

export interface HazardEvent {
  timestamp: number; // seconds into clip
  description: string;
  points: number; // max 5
}

export interface StudySession {
  date: string;
  duration: number; // minutes
  questionsAnswered: number;
  correct: number;
  categories: Record<string, { correct: number; total: number }>;
}

export interface CardReview {
  cardId: string;
  difficulty: 1 | 2 | 3 | 4 | 5; // 1=easy, 5=hard
  timestamp: number;
}

export interface SpacedRepState {
  cardId: string;
  stage: number; // 0-7 FSRS stages
  dueDate: number; // timestamp
  stability: number;
  difficulty: number;
  lastReviewed: number;
  reviewCount: number;
}

export type CategoryKey =
  | 'alertness' | 'attitude' | 'safety' | 'roadSigns' | 'rules'
  | 'documents' | 'accidents' | 'motorway' | 'hazard' | 'vehicle'
  | 'margins' | 'handling' | 'loading' | 'vulnerable';

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  alertness: 'Alertness',
  attitude: 'Attitude',
  safety: 'Safety & Your Vehicle',
  roadSigns: 'Road & Traffic Signs',
  rules: 'Rules of the Road',
  documents: 'Documents',
  accidents: 'Accidents',
  motorway: 'Motorway Rules',
  hazard: 'Hazard Awareness',
  vehicle: 'Safety Margins',
  margins: 'Vehicle Handling',
  handling: 'Vehicle Loading',
  loading: 'Other Types of Vehicle',
  vulnerable: 'Vulnerable Road Users',
};
