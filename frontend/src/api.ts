const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/backend').replace(/\/$/, '');
export const getToken = () => localStorage.getItem('oism.accessToken');
export function setToken(token: string | null) { token ? localStorage.setItem('oism.accessToken', token) : localStorage.removeItem('oism.accessToken'); }
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const token = getToken(); if (token) headers.set('Authorization', `Bearer ${token}`);
  const tenantId = import.meta.env.VITE_TENANT_ID; if (tenantId) headers.set('X-Tenant-Id', tenantId);
  const response = await fetch(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`, { ...init, headers });
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.detail || body.title || `API error ${response.status}`); }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export const apiBase = API_BASE;
