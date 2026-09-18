/**
 * Centralized API client for Darukaa Biosphere backend.
 * Falls back to mock data when backend is unavailable.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { timeout = 8000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// --- Assessment ---

export async function analyzeAssessment(data: Record<string, unknown>) {
  return apiFetch('/api/assessment/analyze', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listAssessments() {
  return apiFetch('/api/assessments');
}

export async function getAssessment(id: string) {
  return apiFetch(`/api/assessments/${id}`);
}

// --- Evidence ---

export async function listEvidence(filters?: {
  category?: string;
  topic?: string;
  variable?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters?.topic) params.set('topic', filters.topic);
  if (filters?.variable) params.set('variable', filters.variable);

  const query = params.toString();
  return apiFetch(`/api/evidence${query ? '?' + query : ''}`);
}

export async function getEvidence(id: string) {
  return apiFetch(`/api/evidence/${id}`);
}

// --- Conversation ---

export async function sendConversationMessage(data: {
  conversation_id?: string;
  message: string;
  assessment_id?: string;
}) {
  return apiFetch('/api/conversation/message', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// --- Scenario ---

export async function analyzeScenario(data: {
  assessment_id: string;
  parameters: Record<string, number>;
}) {
  return apiFetch('/api/scenario/analyze', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// --- Health check ---

export async function checkBackendHealth(): Promise<boolean> {
  try {
    await apiFetch('/health', { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}
