const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/backend').replace(/\/$/, '');

export const apiBase = API_BASE;
export const tenantId = import.meta.env.VITE_TENANT_ID || '';
export const branchId = import.meta.env.VITE_BRANCH_ID || '';

export const getToken = () => localStorage.getItem('oism.accessToken');
export function setToken(token: string | null) {
  if (token) localStorage.setItem('oism.accessToken', token);
  else localStorage.removeItem('oism.accessToken');
}

function buildHeaders(init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json, text/plain, */*');
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (tenantId) headers.set('X-Tenant-Id', tenantId);
  return headers;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    headers: buildHeaders(init),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || body.detail || body.title || `API trả về HTTP ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function checkBackend(): Promise<string> {
  const response = await fetch(`${API_BASE}/`, { headers: buildHeaders() });
  if (!response.ok) throw new Error(`Backend trả về HTTP ${response.status}`);
  return response.text();
}

export type InventoryItem = {
  productId: string;
  sku: string;
  name: string;
  onHand: number;
  reserved: number;
  available: number;
};

export async function getBranchInventory(): Promise<InventoryItem[]> {
  if (!tenantId) throw new Error('Thiếu VITE_TENANT_ID trong file .env.');
  if (!branchId) throw new Error('Thiếu VITE_BRANCH_ID trong file .env.');
  const query = new URLSearchParams({ branchId });
  return api<InventoryItem[]>(`/api/inventory/all?${query.toString()}`);
}

export type CreateOrderPayload = {
  branchId: string;
  source: string;
  items: { productId: string; quantity: number }[];
};

export function createOrder(payload: CreateOrderPayload) {
  return api('/api/orders', { method: 'POST', body: JSON.stringify(payload) });
}
