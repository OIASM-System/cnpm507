
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_BRANCH_ID = '11111111-1111-1111-1111-111111111111';

// 1. CẤU HÌNH API
export const apiBase = (
  import.meta.env.VITE_API_BASE_URL || '/backend'
).replace(/\/$/, '');

export const tenantId =
  import.meta.env.VITE_TENANT_ID || DEFAULT_TENANT_ID;

export const branchId =
  import.meta.env.VITE_BRANCH_ID || DEFAULT_BRANCH_ID;

// 2. KIỂM TRA GUID
export const isGuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

// 3. QUẢN LÝ TOKEN
export const getToken = () =>
  localStorage.getItem('oism.accessToken');

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('oism.accessToken', token);
  } else {
    localStorage.removeItem('oism.accessToken');
  }
}

// 4. TẠO HEADER CHO REQUEST
function buildHeaders(init: RequestInit = {}): Headers {
  const headers = new Headers(init.headers);

  headers.set('Accept', 'application/json, text/plain, */*');
  headers.set('X-Tenant-Id', tenantId);

  if (
    typeof init.body === 'string' &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

// 5. HÀM GỌI API DÙNG CHUNG
export async function api<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  const response = await fetch(`${apiBase}${cleanPath}`, {
    ...init,
    headers: buildHeaders(init),
  });

  const contentType = response.headers.get('content-type') || '';

  // Kiểm tra trường hợp nhận nhầm HTML từ Vite
  if (contentType.includes('text/html')) {
    throw new Error(
      'API đang trả về HTML thay vì dữ liệu. Hãy kiểm tra cấu hình Proxy và Backend.'
    );
  }

  // Xử lý lỗi HTTP
  if (!response.ok) {
    const errorData = contentType.includes('json')
      ? await response.json().catch(() => ({}))
      : {};

    throw new Error(
      errorData.message ||
      errorData.detail ||
      errorData.title ||
      `Lỗi HTTP ${response.status}`
    );
  }

  // HTTP 204: Không có nội dung trả về
  if (response.status === 204) {
    return undefined as T;
  }

  // Nhận dữ liệu JSON
  if (contentType.includes('json')) {
    return response.json() as Promise<T>;
  }

  // Nhận dữ liệu dạng text
  return (await response.text()) as unknown as T;
}

// 6. KIỂM TRA KẾT NỐI BACKEND
export async function checkBackend(): Promise<string> {
  const rows = await getBranchInventory();

  return `Kết nối thành công! Nhận được ${rows.length} dòng tồn kho.`;
}

// ========================================
// INVENTORY - QUẢN LÝ TỒN KHO
// ========================================

export type InventoryItem = {
  productId: string;
  sku: string;
  name: string;
  onHand: number;
  reserved: number;
  available: number;
};

// Lấy toàn bộ tồn kho của một chi nhánh
export function getBranchInventory(
  customBranchId = branchId
): Promise<InventoryItem[]> {
  const params = new URLSearchParams({
    branchId: customBranchId,
  });

  return api<InventoryItem[]>(
    `/api/inventory/all?${params}`
  );
}

// Lấy tồn kho của một sản phẩm
export function getProductInventory(
  productId: string,
  customBranchId = branchId
): Promise<InventoryItem> {
  const params = new URLSearchParams({
    branchId: customBranchId,
    productId,
  });

  return api<InventoryItem>(
    `/api/inventory?${params}`
  );
}

// Điều chỉnh số lượng tồn kho
export function adjustInventory(
  productId: string,
  newOnHand: number,
  customBranchId = branchId
): Promise<void> {
  return api<void>('/api/inventory/adjust', {
    method: 'PUT',
    body: JSON.stringify({
      branchId: customBranchId,
      productId,
      newOnHand,
    }),
  });
}

// ========================================
// INVENTORY LEDGER - LỊCH SỬ KHO
// ========================================

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

// Lấy lịch sử biến động kho
export function getLedger(filters?: {
  branchId?: string;
  productId?: string;
  orderId?: string;
}): Promise<LedgerEntry[]> {
  const params = new URLSearchParams({
    branchId: filters?.branchId || branchId,
  });

  if (filters?.productId) {
    params.set('productId', filters.productId);
  }

  if (filters?.orderId) {
    params.set('orderId', filters.orderId);
  }

  return api<LedgerEntry[]>(
    `/api/inventory/ledger?${params}`
  );
}

// ========================================
// ORDERS - QUẢN LÝ ĐƠN HÀNG
// ========================================

const ORDER_STATUS = [
  'Draft',
  'Pending',
  'Confirmed',
  'Cancelled',
  'Rejected',
];

export const statusName = (status: number | string) =>
  typeof status === 'number'
    ? ORDER_STATUS[status] ?? String(status)
    : status;

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
  items: {
    productId: string;
    quantity: number;
  }[];
};

// Tạo đơn hàng
export function createOrder(
  payload: CreateOrderPayload
): Promise<OrderDto> {
  return api<OrderDto>('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      branchId: payload.branchId || branchId,
    }),
  });
}

// Lấy thông tin đơn hàng
export function getOrder(
  orderId: string
): Promise<OrderDto> {
  return api<OrderDto>(`/api/orders/${orderId}`);
}

// Xác nhận đơn hàng
export function confirmOrder(
  orderId: string
): Promise<void> {
  return api<void>(
    `/api/orders/${orderId}/confirm`,
    { method: 'POST' }
  );
}

// Hủy đơn hàng
export function cancelOrder(
  orderId: string
): Promise<void> {
  return api<void>(
    `/api/orders/${orderId}/cancel`,
    { method: 'POST' }
  );
}

// ========================================
// LOCAL STORAGE - LƯU TẠM TRÊN TRÌNH DUYỆT
// ========================================

// Lưu ý: Đây không phải dữ liệu PostgreSQL.

export const loadOrders = (): OrderDto[] => {
  try {
    return JSON.parse(
      localStorage.getItem('oism.orders') || '[]'
    );
  } catch {
    return [];
  }
};

export const saveOrders = (orders: OrderDto[]) => {
  localStorage.setItem(
    'oism.orders',
    JSON.stringify(orders.slice(0, 100))
  );
};

export const loadPrices = (): Record<string, number> => {
  try {
    return JSON.parse(
      localStorage.getItem('oism.prices') || '{}'
    );
  } catch {
    return {};
  }
};

export const savePrice = (sku: string, price: number) => {
  const prices = loadPrices();

  prices[sku.toLowerCase()] = price;

  localStorage.setItem(
    'oism.prices',
    JSON.stringify(prices)
  );
};