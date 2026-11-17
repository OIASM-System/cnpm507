# 📘 TypeScript Standards & Type Safety - POS PWA Project

Tài liệu này quy định các tiêu chuẩn lập trình **TypeScript 5.x** cho ứng dụng **React PWA** trong hệ thống **POS PWA (Point of Sale Progressive Web App)**. Trong phần mềm bán hàng liên quan trực tiếp đến dòng tiền, chiết khấu và tồn kho, việc bật chế độ kiểm tra kiểu nghiêm ngặt (**Strict Mode**) giúp phát hiện lỗi sai cấu trúc dữ liệu ngay tại thời điểm biên dịch (**Compile-Time**) thay vì để xảy ra lỗi màn hình trắng (`Runtime Crash`) ngay lúc thu ngân đang thanh toán cho khách.

---

## ⚙️ 1. Cấu hình `tsconfig.json` chuẩn (Strict Mode)

Toàn bộ dự án Frontend bắt buộc kích hoạt cờ `"strict": true` cùng các quy tắc kiểm tra bổ sung để triệt tiêu lỗi `null`/`undefined` ngầm và biến dư thừa:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Quy tắc Type Safety nghiêm ngặt bắt buộc */
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "forceConsistentCasingInFileNames": true,

    /* Path Aliases đồng bộ với Vite */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

---

## 📏 2. Quy chuẩn định nghĩa kiểu dữ liệu (Type Conventions)

| Quy tắc | Chuẩn áp dụng trong POS PWA | Ví dụ minh họa |
| :--- | :--- | :--- |
| **Cấm sử dụng `any`** | Tuyệt đối cấm `any`. Sử dụng `unknown` kèm **Type Guard** hoặc Zod Schema khi nhận dữ liệu chưa xác định (ví dụ: payload từ sự kiện SignalR hoặc `IndexedDB`). | `function parseSyncPayload(raw: unknown): OfflineOrderPayload` |
| **Ưu tiên Union Types thay vì `enum` truyền thống** | Sử dụng `as const` object + Union Type để đồng bộ 1:1 với chuỗi Enum trả về từ ASP.NET Core 8 (`JsonStringEnumConverter`) mà không sinh mã thừa lúc runtime. | `export const OrderStatus = { Draft: 'Draft', Completed: 'Completed', Refunded: 'Refunded' } as const;` |
| **`interface` vs `type`** | Dùng `interface` cho props của React Component và hợp đồng đối tượng mở rộng; dùng `type` cho Union Types, Utility Types (`Pick`, `Omit`) và kiểu suy diễn từ Zod (`z.infer`). | `export type CreateOrderRequest = z.infer<typeof createOrderSchema>;` |
| **Tiền tệ & Định danh** | `Guid` từ .NET 8 ánh xạ sang `string`; `decimal` ánh xạ sang `number` và bắt buộc đi qua hàm định dạng `formatCurrencyVND()` khi hiển thị. | `id: string; unitPrice: number;` |

---

## 🔗 3. Đồng bộ Hợp đồng Dữ liệu (API DTO Contracts)

Các định nghĩa kiểu dữ liệu tại `src/types/` phải khớp chính xác từng trường (**camelCase**) và kiểu dữ liệu với các DTO của tầng `PosPwa.Application` (.NET 8):

### 3.1. `src/types/product.types.ts`
```typescript
export interface ProductDto {
  id: string;
  categoryId: string;
  categoryName: string;
  code: string;
  name: string;
  price: number;
  stockQuantity: number;      // Tồn kho vật lý (OnHand)
  reservedQuantity: number;   // Tồn kho đang giữ chỗ (Active Reservations)
  availableQuantity: number;  // Số lượng khả dụng được phép bán
  isActive: boolean;
  rowVersion: number;         // Optimistic Concurrency Token (xmin)
}
```

### 3.2. `src/types/order.types.ts`
```typescript
export const OrderStatus = {
  Draft: 'Draft',
  PendingPayment: 'PendingPayment',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
  Refunded: 'Refunded',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentMethod = {
  Cash: 'Cash',
  BankTransferQr: 'BankTransferQr',
  Card: 'Card',
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export interface OrderItemDto {
  id: string;
  productId: string;
  productCodeSnapshot: string;
  productNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderReceiptDto {
  id: string;
  orderNumber: string;
  clientOfflineId: string | null;
  status: OrderStatus;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  requiresInventoryReconciliation: boolean;
  createdAt: string; // ISO-8601 UTC string từ .NET 8
  completedAt: string | null;
  items: OrderItemDto[];
}
```

---

## 🛡️ 4. Discriminated Unions cho Trạng thái Bất đồng bộ & Đồng bộ Offline

Sử dụng **Discriminated Unions** để ép buộc lập trình viên xử lý đầy đủ mọi trạng thái của quá trình đồng bộ đơn hàng ngoại tuyến (`Offline Sync`), tránh bỏ sót trường hợp lỗi xung đột tồn kho:

```typescript
export type SyncItemState =
  | { status: 'pending'; queuedAt: string; retryCount: number }
  | { status: 'syncing' }
  | { status: 'synced'; serverOrderNumber: string; syncedAt: string }
  | { status: 'conflict'; serverOrderNumber: string; warningMessage: string }
  | { status: 'failed'; errorMessage: string };
```

---
