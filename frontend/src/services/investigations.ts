import { request } from './api';
import type { IncidentInvestigationRequest } from '../types/incident';
import type { InvestigationResult } from '../types/investigation';

export async function runInvestigation(payload: IncidentInvestigationRequest): Promise<InvestigationResult> {
  return request<InvestigationResult>('/api/investigations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
