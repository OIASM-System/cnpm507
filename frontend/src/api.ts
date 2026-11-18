const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/backend').replace(/\/$/, '');

export const apiBase = API_BASE;
export const tenantId = import.meta.env.VITE_TENANT_ID || '';
export const branchId = import.meta.env.VITE_BRANCH_ID || '';
export const isGuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

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

function requireConfig() {
  if (!tenantId) throw new Error('Thiếu VITE_TENANT_ID trong file .env.');
  if (!branchId) throw new Error('Thiếu VITE_BRANCH_ID trong file .env.');
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    headers: buildHeaders(init),
  });
  const type = response.headers.get('content-type') || '';
  if (!response.ok) {
    const body = type.includes('json') ? await response.json().catch(() => ({})) : {};
    throw new Error(body.message || body.detail || body.title || `API trả về HTTP ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  if (!type.includes('json')) {
    throw new Error('Phản hồi không phải JSON. Kiểm tra proxy /backend trong vite.config.ts và backend đang chạy ở http://localhost:5185.');
  }
  return response.json() as Promise<T>;
}

export async function checkBackend(): Promise<string> {
  const response = await fetch(
    `${API_BASE}/api/inventory/all?branchId=${encodeURIComponent(branchId)}`,
    {
      method: 'GET',
      headers: buildHeaders()
    }
  );

  if (!response.ok) {
    throw new Error(`Backend trả về HTTP ${response.status}`);
  }

  const rows = await response.json();

  if (!Array.isArray(rows)) {
    throw new Error('Dữ liệu API không đúng định dạng.');
  }

  return `Kết nối thành công! Nhận được ${rows.length} dòng tồn kho.`;
}

/* ---------- Inventory ---------- */
export type InventoryItem = { productId: string; sku: string; name: string; onHand: number; reserved: number; available: number };

export async function getBranchInventory(): Promise<InventoryItem[]> {
  requireConfig();
  return api<InventoryItem[]>(`/api/inventory/all?${new URLSearchParams({ branchId })}`);
}

export const adjustInventory = (productId: string, newOnHand: number) => {
  requireConfig();
  return api<void>('/api/inventory/adjust', { method: 'PUT', body: JSON.stringify({ branchId, productId, newOnHand }) });
};

export type LedgerEntry = {
  id: string; productId: string; orderId: string | null; movementType: string;
  quantity: number; onHandAfter: number; reservedAfter: number; createdAt: string;
};

export function getLedger(): Promise<LedgerEntry[]> {
  requireConfig();
  return api<LedgerEntry[]>(`/api/inventory/ledger?${new URLSearchParams({ branchId })}`);
}

/* ---------- Orders ---------- */
const ORDER_STATUS = ['Draft', 'Pending', 'Confirmed', 'Cancelled', 'Rejected'];
// Backend trả enum dạng số (0..4) vì chưa bật JsonStringEnumConverter.
export const statusName = (s: number | string) => (typeof s === 'number' ? ORDER_STATUS[s] ?? String(s) : s);

export type OrderItemDto = { productId: string; sku: string; productName: string; quantity: number; unitPrice: number; lineTotal: number };
export type OrderDto = {
  id: string; orderNumber: string; branchId: string; source: string;
  status: number | string; totalAmount: number; createdAt: string; items: OrderItemDto[];
};
export type CreateOrderPayload = { branchId: string; source: string; items: { productId: string; quantity: number }[] };

export const createOrder = (payload: CreateOrderPayload) => api<OrderDto>('/api/orders', { method: 'POST', body: JSON.stringify(payload) });
export const getOrder = (id: string) => api<OrderDto>(`/api/orders/${id}`);
export const confirmOrder = (id: string) => api<void>(`/api/orders/${id}/confirm`, { method: 'POST' });
export const cancelOrder = (id: string) => api<void>(`/api/orders/${id}/cancel`, { method: 'POST' });

/* ---------- Lưu cục bộ (backend chưa có API danh sách đơn / giá sản phẩm) ---------- */
export const loadOrders = (): OrderDto[] => { try { return JSON.parse(localStorage.getItem('oism.orders') || '[]'); } catch { return []; } };
export const saveOrders = (orders: OrderDto[]) => localStorage.setItem('oism.orders', JSON.stringify(orders.slice(0, 100)));
export const loadPrices = (): Record<string, number> => { try { return JSON.parse(localStorage.getItem('oism.prices') || '{}'); } catch { return {}; } };
export const savePrice = (sku: string, price: number) => { const m = loadPrices(); m[sku.toLowerCase()] = price; localStorage.setItem('oism.prices', JSON.stringify(m)); };
