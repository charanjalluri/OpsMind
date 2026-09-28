export type IncidentSeverity = 'SEV-1' | 'SEV-2' | 'SEV-3';
export type IncidentStatus = 'Investigating' | 'Mitigated' | 'Resolved';

export interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  type?: 'detection' | 'investigation' | 'memory' | 'diagnosis' | 'action' | 'recovery' | 'postmortem' | 'retention';
}

export interface ActiveIncident {
  incident_id: string;
  service: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  environment: string;
  deployment_version?: string | null;
  symptoms: string[];
  description?: string | null;
  started_at: string;
  affected_endpoints?: string[];
  resolved_at?: string | null;
  root_cause?: string | null;
  resolution?: string | null;
  outcome?: string | null;
  retained_memory_id?: string | null;
  timeline_events?: TimelineEvent[];
}

export interface IncidentInvestigationRequest {
  incident_id: string;
  service: string;
  environment: string;
  symptoms: string[];
  deployment_version?: string | null;
  description?: string | null;
}

export interface IncidentResolutionRequest {
  incident_id: string;
  service: string;
  environment?: string;
  severity?: string;
  deployment_version?: string | null;
  symptoms?: string[];
  root_cause: string;
  resolution: string;
  outcome: string;
  lessons_learned?: string | string[];
  successful_actions?: string[];
  failed_actions?: string[];
  warnings?: string[];
  investigation_steps?: string[];
  actions_taken?: string[];
}

export interface IncidentResolutionResponse {
  success: boolean;
  incident_id: string;
  status: string;
  resolved_at: string;
  retained_memory: {
    success: boolean;
    incident_id?: string | null;
    bank_id: string;
    items_count: number;
    message: string;
  };
  message: string;
}

export interface DashboardStats {
  active_incidents: number;
  critical_incidents: number;
  historical_incidents: number;
  engineering_memories: number;
  memory_signal: {
    relevant_experiences: number;
    previous_incidents: number;
    engineering_decisions: number;
    lessons_learned: number;
    last_memory_retained: string;
    bank_id: string;
    status: string;
  };
}
