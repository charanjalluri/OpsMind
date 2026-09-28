import { request } from './api';
import type {
  ActiveIncident,
  DashboardStats,
  IncidentResolutionRequest,
  IncidentResolutionResponse,
} from '../types/incident';

export async function fetchIncidents(): Promise<ActiveIncident[]> {
  return request<ActiveIncident[]>('/api/incidents');
}

export async function fetchIncidentById(incidentId: string): Promise<ActiveIncident> {
  return request<ActiveIncident>(`/api/incidents/${incidentId}`);
}

export async function resolveIncident(
  incidentId: string,
  data: IncidentResolutionRequest
): Promise<IncidentResolutionResponse> {
  return request<IncidentResolutionResponse>(`/api/incidents/${incidentId}/resolve`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>('/api/dashboard/stats');
}

export async function fetchHealth(): Promise<{ status: string; service: string }> {
  return request<{ status: string; service: string }>('/health');
}
