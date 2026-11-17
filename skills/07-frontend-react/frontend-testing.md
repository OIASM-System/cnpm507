# 🧪 Frontend Testing Strategy (Vitest, RTL & Playwright) - POS PWA Project

Tài liệu này quy định chiến lược kiểm thử tự động phía khách hàng (**Frontend Automated Testing**) cho ứng dụng **React PWA** trong hệ thống **POS PWA (Point of Sale Progressive Web App)**. Mục tiêu là đảm bảo tính chính xác tuyệt đối của các phép tính tiền tệ trong giỏ hàng, khả năng hoạt động bền bỉ của cơ chế bán hàng ngoại tuyến (**Offline PWA Queue**) và luồng thanh toán đầu cuối (**End-to-End Checkout**) trước mỗi lần triển khai.

---

## 🔺 1. Kim tự tháp Kiểm thử Frontend (Frontend Testing Pyramid)

| Cấp độ kiểm thử | Công cụ sử dụng | Phạm vi & Mục tiêu kiểm thử | Tốc độ thực thi |
| :--- | :--- | :--- | :---: |
| **1. Unit Tests** | **Vitest** | Kiểm thử logic thuần túy: tính tổng tiền giỏ hàng (`useCartStore`), tính tiền thối lại, Zod Validation Schemas, bộ đệm máy quét mã vạch (`useBarcodeScanner`), định dạng tiền tệ VND. | **Siêu nhanh ($< 1\text{s}$)** |
| **2. Component & Integration Tests** | **Vitest + React Testing Library + MSW** | Kiểm thử tương tác giữa các thành phần UI (`ProductGrid`, `CartPanel`, `CheckoutModal`), giả lập phản hồi API bằng **Mock Service Worker (MSW)** (bao gồm lỗi `401 Refresh Token` và `409 Hết hàng`). | **Nhanh ($2–5\text{s}$)** |
| **3. End-to-End (E2E) & Offline PWA Tests** | **Playwright** | Chạy trên trình duyệt Chromium thực tế: kiểm thử trọn vẹn luồng Đăng nhập $\rightarrow$ Quét món $\rightarrow$ Thanh toán; giả lập ngắt mạng (`context.setOffline(true)`), tạo đơn Offline và bật lại mạng kiểm tra tự động đồng bộ. | **Toàn diện ($15–30\text{s}$)** |

---

## 💻 2. Triển khai Unit Test cho Giỏ hàng (`useCartStore.test.ts`)

Đặt cạnh mã nguồn theo quy ước Co-location (`src/stores/__tests__/useCartStore.test.ts`) để kiểm soát chặt chẽ các quy tắc chống vượt tồn kho khả dụng trên giỏ hàng:

```typescript
import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore } from '../useCartStore';
import type { ProductDto } from '@/types/product.types';

const sampleCoffee: ProductDto = {
  id: 'prod-01',
  categoryId: 'cat-01',
  categoryName: 'Cà phê',
  code: 'CF01',
  name: 'Cà phê Sữa Đá',
  price: 29000,
  stockQuantity: 3,
  reservedQuantity: 1,
  availableQuantity: 2, // Chỉ còn 2 ly khả dụng
  isActive: true,
  rowVersion: 1,
};

describe('useCartStore - Nghiệp vụ Giỏ hàng POS', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('Cộng dồn số lượng khi thêm cùng một sản phẩm nhiều lần', () => {
    const store = useCartStore.getState();
    store.addItem(sampleCoffee);
    store.addItem(sampleCoffee);

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0]?.quantity).toBe(2);
  });

  it('Không cho phép thêm vượt quá số lượng tồn kho khả dụng (availableQuantity)', () => {
    const store = useCartStore.getState();
    store.addItem(sampleCoffee);
    store.addItem(sampleCoffee);
    store.addItem(sampleCoffee); // Lần thứ 3 vượt quá availableQuantity = 2

    const items = useCartStore.getState().items;
    expect(items[0]?.quantity).toBe(2);
  });

  it('Không cho phép thêm sản phẩm đã hết hàng (availableQuantity = 0)', () => {
    const soldOutItem: ProductDto = { ...sampleCoffee, id: 'prod-02', availableQuantity: 0 };
    useCartStore.getState().addItem(soldOutItem);

    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
```

---

## 🌐 3. Kiểm thử Luồng Ngoại tuyến (Offline-First E2E Test với Playwright)

Bài kiểm thử quan trọng nhất của một ứng dụng **POS PWA** là chứng minh quầy thu ngân không bị gián đoạn khi mất kết nối Internet:

```typescript
import { expect, test } from '@playwright/test';

test('Thu ngân vẫn chốt được đơn khi mất mạng và tự động đồng bộ khi có mạng lại', async ({
  page,
  context,
}) => {
  // 1. Đăng nhập và tải danh mục sản phẩm lúc đang có mạng
  await page.goto('/login');
  await page.fill('input[name="tenantCode"]', 'uth-coffee');
  await page.fill('input[name="username"]', 'cashier01');
  await page.fill('input[name="password"]', 'Cashier@123');
  await page.click('button[type="submit"]');

  await expect(page.getByText('Cà phê Sữa Đá')).toBeVisible();

  // 2. Ngắt kết nối mạng của trình duyệt (Giả lập rớt mạng tại cửa hàng)
  await context.setOffline(true);
  await expect(page.getByText('Chế độ Ngoại tuyến')).toBeVisible();

  // 3. Thêm món vào giỏ và thanh toán tiền mặt
  await page.click('text=Cà phê Sữa Đá');
  await page.click('button:has-text("Thanh toán")');
  await page.click('button:has-text("Xác nhận thu tiền")');

  // Xác nhận hóa đơn được lưu thành công vào hàng đợi Offline IndexedDB
  await expect(page.getByText('Đã lưu đơn ngoại tuyến')).toBeVisible();

  // 4. Khôi phục kết nối mạng và kiểm tra Background Sync đẩy đơn lên Server
  await context.setOffline(false);
  await expect(page.getByText('Đã đồng bộ tất cả đơn hàng')).toBeVisible({ timeout: 10000 });
});
```

---

## 🚦 4. Tiêu chuẩn Cổng chất lượng CI/CD (Quality Gates)

Mọi Pull Request gửi vào nhánh `main` của thư mục Frontend bắt buộc phải vượt qua tự động 4 bước kiểm tra qua GitHub Actions:
1. `npm run typecheck` (`tsc --noEmit` — 0 lỗi kiểu dữ liệu TypeScript).
2. `npm run lint` (`eslint` — Tuân thủ chuẩn React Hooks và quy tắc sạch mã nguồn).
3. `npm run test:unit` (`vitest run` — Độ bao phủ tối thiểu **80%** cho tầng `stores/`, `utils/` và `schemas/`).
4. `npm run build` (`vite build` — Đóng gói thành công kèm Service Worker manifest).

---
