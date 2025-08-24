export type Game = number[];

export interface Node {
  id: number;
  frequency: number;
  normalizedFrequency: number;
}

export interface Edge {
  source: number;
  target: number;
  frequency: number;
  normalizedFrequency: number;
}

export interface AnalysisResult {
  nodes: Node[];
  edges: Edge[];
  totalGames: number;
  minNodeFrequency: number;
  maxNodeFrequency: number;
  minEdgeFrequency: number;
  maxEdgeFrequency: number;
}

export interface GenerationOptions {
  avoidExistingGames: boolean;
  avoidSequences: boolean;
  minNodeStrength: number;
  minEdgeStrength: number;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}
