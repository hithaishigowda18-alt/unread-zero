export type UrgencyLevel = 'High' | 'Medium' | 'Low';

export interface ActionItem {
  task: string;
  assignee: string;
  deadline: string;
  completed?: boolean;
}

export interface ChatAnalysisResult {
  summary: string;
  key_decisions: string[];
  action_items: ActionItem[];
  mentions: string[];
  urgency: UrgencyLevel;
  rawResponse?: string;
  processingTimeMs?: number;
  modelUsed?: string;
}

export interface ModelOption {
  id: string;
  name: string;
  tag: string;
  size: string;
  vram: string;
  description: string;
  isSimulated?: boolean;
}

export type EngineState = 
  | 'idle' 
  | 'initializing' 
  | 'downloading' 
  | 'ready' 
  | 'analyzing' 
  | 'completed' 
  | 'error';

export interface EngineProgress {
  state: EngineState;
  progress: number; // 0 to 100
  text: string;
  error?: string;
}
