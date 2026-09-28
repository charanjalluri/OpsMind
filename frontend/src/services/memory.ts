import { request } from './api';
import type {
  MemoryRecallResponse,
  MemoryKnowledgeBase,
  MemoryRetainRequest,
  MemoryRetainResponse,
} from '../types/memory';

export async function recallMemories(
  query: string,
  bankId?: string,
  maxTokens = 4096
): Promise<MemoryRecallResponse> {
  return request<MemoryRecallResponse>('/api/memory/recall', {
    method: 'POST',
    body: JSON.stringify({
      query,
      bank_id: bankId || undefined,
      max_tokens: maxTokens,
    }),
  });
}

export async function retainMemory(data: MemoryRetainRequest): Promise<MemoryRetainResponse> {
  return request<MemoryRetainResponse>('/api/memory/retain', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchKnowledgeBase(): Promise<MemoryKnowledgeBase> {
  return request<MemoryKnowledgeBase>('/api/memory/knowledge');
}
