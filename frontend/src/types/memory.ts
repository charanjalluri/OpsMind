export interface MemoryRecallResultItem {
  id?: string | null;
  text: string;
  type?: string | null;
  context?: string | null;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface MemoryRecallResponse {
  query: string;
  bank_id: string;
  count: number;
  results: MemoryRecallResultItem[];
  prompt_representation?: string | null;
}

export interface MemoryRetainRequest {
  incident_id?: string | null;
  memory_type?: string;
  title?: string | null;
  service: string;
  environment?: string;
  severity?: string | null;
  deployment_version?: string | null;
  symptoms?: string[];
  suspected_cause?: string | null;
  root_cause?: string | null;
  confirmed_root_cause?: string | null;
  investigation_steps?: string[];
  actions_taken?: string[];
  resolution: string;
  outcome?: string;
  impact?: string | null;
  duration?: string | null;
  successful_actions?: string[];
  successful_approaches?: string[];
  failed_actions?: string[];
  failed_approaches?: string[];
  engineering_decisions?: string[];
  warnings?: string[];
  lessons_learned?: string | string[];
  tags?: string[];
}

export interface MemoryRetainResponse {
  success: boolean;
  incident_id?: string | null;
  bank_id: string;
  items_count: number;
  message: string;
}

export interface SeedEngineeringMemory {
  incident_id?: string | null;
  memory_type: 'incident' | 'decision' | 'incident_postmortem';
  title?: string | null;
  service: string;
  environment: string;
  severity?: string | null;
  deployment_version?: string | null;
  symptoms: string[];
  suspected_cause?: string | null;
  confirmed_root_cause?: string | null;
  investigation_steps: string[];
  actions_taken: string[];
  resolution: string;
  outcome: string;
  impact?: string | null;
  duration?: string | null;
  failed_approaches: string[];
  successful_approaches: string[];
  engineering_decisions: string[];
  warnings: string[];
  lessons_learned: string[];
  tags: string[];
  retained_at?: string;
}

export interface MemoryKnowledgeBase {
  bank_id: string;
  total_memories: number;
  categories: {
    incidents: number;
    decisions: number;
    lessons: number;
    warnings: number;
  };
  memories: SeedEngineeringMemory[];
}
