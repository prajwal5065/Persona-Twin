export interface User {
  id: number;
  email: string;
  full_name: string | null;
  personality_profile?: PersonalityProfile;
}

export interface PersonalityProfile {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  summary: string;
  coreValues?: string[];
  cognitiveStyle?: string[];
  energyProfile?: {
    sources: string[];
    drains: string[];
  };
}

export interface Note {
  id: number;
  content: string;
  user_id: number;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface InsightResponse {
  patterns: {
    most_active_period: string;
    activity_distribution: Record<string, number>;
    frequency: string;
  };
  trends: string[];
  summary: string;
}

export interface ReasoningFactor {
  label: string;
  score: number;
  note: string;
}

export interface SimulationResponse {
  predicted_decision: string;
  confidence: number;
  reasoning: ReasoningFactor[];
  alternatives: string[];
}
