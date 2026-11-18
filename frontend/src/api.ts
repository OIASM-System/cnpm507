const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_BRANCH_ID = '11111111-1111-1111-1111-111111111111';

export const apiBase = (import.meta.env.VITE_API_BASE_URL || '/backend').replace(/\/$/, '');
export const tenantId = import.meta.env.VITE_TENANT_ID || DEFAULT_TENANT_ID;
export const branchId = import.meta.env.VITE_BRANCH_ID || DEFAULT_BRANCH_ID;

export const isGuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

export const getToken = () => localStorage.getItem('oism.accessToken');
export function setToken(token: string | null) {
  if (token) localStorage.setItem('oism.accessToken', token);
  else localStorage.removeItem('oism.accessToken');
}

function buildHeaders(init: RequestInit = {}): Headers {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json, text/plain, */*');
  headers.set('X-Tenant-Id', tenantId);

  if (typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`${apiBase}${cleanPath}`, {
    ...init,
    headers: buildHeaders(init),
  });

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('text/html')) {
    throw new Error(
      'Vite đang trả về HTML thay vì gọi sang C#. Hãy tắt Terminal (Ctrl+C) và chạy lại npm run dev.'
    );
  }

  if (!response.ok) {
    const errBody = contentType.includes('json')
      ? await response.json().catch(() => ({}))
      : {};
    throw new Error(
      errBody.message || errBody.detail || errBody.title || `Lỗi HTTP ${response.status}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (contentType.includes('json')) {
    return response.json() as Promise<T>;
  }

  return (await response.text()) as unknown as T;
}

/* ---------- Kiểm tra kết nối ---------- */
export async function checkBackend(): Promise<string> {
  const rows = await getBranchInventory();
  return `Kết nối thành công! Nhận được ${rows.length} dòng tồn kho.`;
}

/* ---------- Inventory (InventoryController) ---------- */
export type InventoryItem = {
  productId: string;
  sku: string;
  name: string;
  onHand: number;
  reserved: number;
  available: number;
};

// GET /api/inventory/all?branchId=...
export function getBranchInventory(customBranchId = branchId): Promise<InventoryItem[]> {
  const params = new URLSearchParams({ branchId: customBranchId });
  return api<InventoryItem[]>(`/api/inventory/all?${params}`);
}

// GET /api/inventory?branchId=...&productId=...
export function getProductInventory(
  productId: string,
  customBranchId = branchId
): Promise<InventoryItem> {
  const params = new URLSearchParams({ branchId: customBranchId, productId });
  return api<InventoryItem>(`/api/inventory?${params}`);
}

// PUT /api/inventory/adjust
export function adjustInventory(
  productId: string,
  newOnHand: number,
  customBranchId = branchId
): Promise<void> {
  return api<void>('/api/inventory/adjust', {
    method: 'PUT',
    body: JSON.stringify({ branchId: customBranchId, productId, newOnHand }),
  });
}

/* ---------- Inventory Ledger (InventoryLedgerController) ---------- */
export type LedgerEntry = {
  id: string;
  productId: string;
  orderId: string | null;
  movementType: string;
  quantity: number;
  onHandAfter: number;
  reservedAfter: number;
  createdAt: string;
};

// GET /api/inventory/ledger?branchId=...&productId=...&orderId=...
export function getLedger(filters?: {
  branchId?: string;
  productId?: string;
  orderId?: string;
}): Promise<LedgerEntry[]> {
  const params = new URLSearchParams({ branchId: filters?.branchId || branchId });
  if (filters?.productId) params.set('productId', filters.productId);
  if (filters?.orderId) params.set('orderId', filters.orderId);
  return api<LedgerEntry[]>(`/api/inventory/ledger?${params}`);
}

/* ---------- Orders (OrdersController) ---------- */
const ORDER_STATUS = ['Draft', 'Pending', 'Confirmed', 'Cancelled', 'Rejected'];
export const statusName = (s: number | string) =>
  typeof s === 'number' ? ORDER_STATUS[s] ?? String(s) : s;

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
  status: number | string;
  totalAmount: number;
  createdAt: string;
  items: OrderItemDto[];
};

export type CreateOrderPayload = {
  branchId?: string;
  source: string;
  items: { productId: string; quantity: number }[];
};

// POST /api/orders
export function createOrder(payload: CreateOrderPayload): Promise<OrderDto> {
  return api<OrderDto>('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      branchId: payload.branchId || branchId,
    }),
  });
}

// GET /api/orders/{orderId}
export function getOrder(orderId: string): Promise<OrderDto> {
  return api<OrderDto>(`/api/orders/${orderId}`);
}

// POST /api/orders/{orderId}/confirm
export function confirmOrder(orderId: string): Promise<void> {
  return api<void>(`/api/orders/${orderId}/confirm`, { method: 'POST' });
}

// POST /api/orders/{orderId}/cancel
export function cancelOrder(orderId: string): Promise<void> {
  return api<void>(`/api/orders/${orderId}/cancel`, { method: 'POST' });
}

/* ---------- Lưu tạm ở LocalStorage ---------- */
export const loadOrders = (): OrderDto[] => {
  try {
    return JSON.parse(localStorage.getItem('oism.orders') || '[]');
  } catch {
    return [];
  }
};

export const saveOrders = (orders: OrderDto[]) =>
  localStorage.setItem('oism.orders', JSON.stringify(orders.slice(0, 100)));

export const loadPrices = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem('oism.prices') || '{}');
  } catch {
    return {};
  }
};

export const savePrice = (sku: string, price: number) => {
  const m = loadPrices();
  m[sku.toLowerCase()] = price;
  localStorage.setItem('oism.prices', JSON.stringify(m));
};