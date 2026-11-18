const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_BRANCH_ID = '11111111-1111-1111-1111-111111111111';

const env = import.meta.env;

export const apiBase = (env.VITE_API_BASE_URL || '/backend').replace(/\/$/, '');
export const tenantId = env.VITE_TENANT_ID || DEFAULT_TENANT_ID;
export const branchId = env.VITE_BRANCH_ID || DEFAULT_BRANCH_ID;

export type InventoryItem = {
  productId: string;
  sku: string;
  name: string;
  onHand: number;
  reserved: number;
  available: number;
};

export type LedgerEntry = {
  id: string;
  branchId: string;
  productId: string;
  orderId: string | null;
  movementType: string;
  quantity: number;
  onHandAfter: number;
  reservedAfter: number;
  createdAt: string;
};

export type OrderItemDto = {
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderDto = {
  id: string;
  orderNumber: string;
  branchId: string;
  source: string;
  status: number;
  totalAmount: number;
  createdAt: string;
  items: OrderItemDto[];
};

function buildHeaders(init: RequestInit = {}): Headers {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  headers.set('X-Tenant-Id', tenantId);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = localStorage.getItem('oism.accessToken');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  let response: Response;
  try {
    response = await fetch(`${apiBase}${cleanPath}`, {
      ...init,
      headers: buildHeaders(init),
    });
  } catch {
    throw new Error('Không thể kết nối Backend. Hãy kiểm tra Backend đang chạy tại http://localhost:5185.');
  }

  const contentType = response.headers.get('content-type') || '';
  const raw = response.status === 204 ? '' : await response.text();

  if (contentType.includes('text/html') || raw.trimStart().startsWith('<!doctype html')) {
    throw new Error('Proxy đang trả về trang HTML thay vì API. Kiểm tra vite.config.ts và khởi động lại Vite.');
  }

  if (!response.ok) {
    let message = raw || `HTTP ${response.status}`;
    if (contentType.includes('json') && raw) {
      try {
        const body = JSON.parse(raw);
        message = body.message || body.detail || body.title || message;
      } catch {
        // Giữ nguyên nội dung lỗi gốc.
      }
    }
    throw new Error(message);
  }

  if (response.status === 204 || !raw) return undefined as T;
  if (contentType.includes('json')) return JSON.parse(raw) as T;
  return raw as T;
}

export function getBranchInventory(customBranchId = branchId) {
  const params = new URLSearchParams({ branchId: customBranchId });
  return api<InventoryItem[]>(`/api/inventory/all?${params}`);
}

export function adjustInventory(productId: string, newOnHand: number, customBranchId = branchId) {
  return api<void>('/api/inventory/adjust', {
    method: 'PUT',
    body: JSON.stringify({ branchId: customBranchId, productId, newOnHand }),
  });
}

export function getLedger(filters: { branchId?: string; productId?: string; orderId?: string } = {}) {
  const params = new URLSearchParams({ branchId: filters.branchId || branchId });
  if (filters.productId) params.set('productId', filters.productId);
  if (filters.orderId) params.set('orderId', filters.orderId);
  return api<LedgerEntry[]>(`/api/inventory/ledger?${params}`);
}

export function createOrder(payload: { source: string; items: { productId: string; quantity: number }[] }) {
  return api<OrderDto>('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ branchId, ...payload }),
  });
}

export function getOrder(orderId: string) {
  return api<OrderDto>(`/api/orders/${encodeURIComponent(orderId)}`);
}

export function confirmOrder(orderId: string) {
  return api<void>(`/api/orders/${encodeURIComponent(orderId)}/confirm`, { method: 'POST' });
}

export function cancelOrder(orderId: string) {
  return api<void>(`/api/orders/${encodeURIComponent(orderId)}/cancel`, { method: 'POST' });
}

export function statusName(status: number) {
  return ['Draft', 'Pending', 'Confirmed', 'Cancelled', 'Rejected'][status] || `Status ${status}`;
}
