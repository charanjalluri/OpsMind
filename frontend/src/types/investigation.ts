export interface HistoricalEvidenceItem {
  incident_id?: string | null;
  service?: string | null;
  summary: string;
  relevance_to_current: string;
  past_root_cause?: string | null;
  effective_actions?: string[];
  dangerous_actions?: string[];
  lessons_learned?: string[];
}

export interface InvestigationResult {
  incident_id: string;
  service: string;
  incident_summary: string;
  historical_evidence: HistoricalEvidenceItem[];
  possible_root_causes: string[];
  recommended_steps: string[];
  warnings: string[];
  confidence: string;
  memory_used: boolean;
  memory_bank_id?: string | null;
  raw_evidence_count: number;
}
