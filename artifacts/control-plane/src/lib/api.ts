const API_BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export const api = {
  sourceSystems: {
    list: () => request<{ data: any[]; meta: any }>("/source-systems"),
    get: (id: string) => request<{ data: any }>(`/source-systems/${id}`),
    create: (body: any) => request<{ data: any }>("/source-systems", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<{ data: any }>(`/source-systems/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => request<{ data: any }>(`/source-systems/${id}`, { method: "DELETE" }),
  },
  endpoints: {
    list: (sourceSystemId?: string) => request<{ data: any[]; meta: any }>(`/endpoints${sourceSystemId ? `?source_system_id=${sourceSystemId}` : ""}`),
    get: (id: string) => request<{ data: any }>(`/endpoints/${id}`),
    create: (body: any) => request<{ data: any }>("/endpoints", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<{ data: any }>(`/endpoints/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => request<{ data: any }>(`/endpoints/${id}`, { method: "DELETE" }),
    preview: (id: string, params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
      return request<{ data: any }>(`/endpoints/${id}/preview${qs}`);
    },
  },
  parameters: {
    list: (endpointId: string) => request<{ data: any[]; meta: any }>(`/endpoints/${endpointId}/parameters`),
    create: (endpointId: string, body: any) => request<{ data: any }>(`/endpoints/${endpointId}/parameters`, { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<{ data: any }>(`/parameters/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => request<{ data: any }>(`/parameters/${id}`, { method: "DELETE" }),
  },
  runs: {
    list: (filters?: Record<string, string>) => {
      const qs = filters ? `?${new URLSearchParams(filters).toString()}` : "";
      return request<{ data: any[]; meta: any }>(`/runs${qs}`);
    },
    get: (id: string) => request<{ data: any }>(`/runs/${id}`),
    create: (body: any) => request<{ data: any }>("/runs", { method: "POST", body: JSON.stringify(body) }),
    cancel: (id: string) => request<{ data: any }>(`/runs/${id}/cancel`, { method: "PATCH" }),
    replay: (id: string) => request<{ data: any }>(`/runs/${id}/replay`, { method: "POST", body: JSON.stringify({}) }),
    events: (id: string) => request<{ data: any[]; meta: any }>(`/runs/${id}/events`),
  },
  monitor: {
    contactDailyCounts: (startDate?: string) => {
      const qs = startDate ? `?startDate=${startDate}` : "";
      return request<{ data: any[] }>(`/monitor/contact-daily-counts${qs}`);
    },
  },
};
