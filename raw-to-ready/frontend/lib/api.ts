import { getAccessToken } from "./supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function authHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error: ${res.status}`);
  }
  return res.json();
}

// Projects
export const api = {
  createProject: (name: string, description?: string) =>
    apiFetch<any>("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    }),

  listProjects: () => apiFetch<any[]>("/api/projects"),

  getProject: (id: string) => apiFetch<any>(`/api/projects/${encodeURIComponent(id)}`),

  // Tools
  submitTool: (toolName: string, data: Record<string, any>) =>
    apiFetch<any>(`/api/tools/${encodeURIComponent(toolName)}/submit`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getToolData: (toolName: string, projectId: string) =>
    apiFetch<any[]>(`/api/tools/${encodeURIComponent(toolName)}/${encodeURIComponent(projectId)}`),

  deleteToolInstance: (toolName: string, instanceId: string) =>
    apiFetch<any>(`/api/tools/${encodeURIComponent(toolName)}/${encodeURIComponent(instanceId)}`, {
      method: "DELETE",
    }),

  // Recommendations
  getRecommendations: (projectId: string) =>
    apiFetch<any>(`/api/recommendations/${encodeURIComponent(projectId)}`),
};
