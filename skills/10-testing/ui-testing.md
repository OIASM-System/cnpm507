# 🎭 End-to-End UI & Offline PWA Testing (Playwright) - POS PWA Project

Tài liệu này quy định kiến trúc **Kiểm thử Giao diện Đầu cuối (End-to-End UI Testing)** bằng **Playwright** cho ứng dụng **React PWA** trong hệ thống **POS PWA (Point of Sale Progressive Web App)**. Các kịch bản kiểm thử mô phỏng chính xác hành vi thực tế của thu ngân và quản lý trên trình duyệt **Chromium (Desktop 1366×768)** và **Tablet Viewport (iPad 1024×768)**, bao gồm thao tác quét mã vạch bằng bàn phím, tính toán giỏ hàng, in biên lai nhiệt và đặc biệt là khả năng vận hành bền bỉ khi ngắt kết nối mạng (**Offline Mode Simulation**).

---

## 🗺️ 1. Danh mục Luồng Kiểm thử E2E Trọng yếu (Critical User Journeys)

| Mã luồng | Tên kịch bản kiểm thử | Thiết bị / Trạng thái mạng | Các bước xác minh tự động |
| :--- | :--- | :--- | :--- |
| **`E2E-01`** | **Bán hàng & Thanh toán tiền mặt tốc độ cao** | Desktop `1366×768` (`Online`) | Đăng nhập $\rightarrow$ Quét 2 mã vạch bằng bàn phím $\rightarrow$ Bấm `F9` mở thanh toán $\rightarrow$ Chọn mệnh giá tiền mặt $\rightarrow$ Kiểm tra tiền thối lại & gọi `window.print()`. |
| **`E2E-02`** | **Bán hàng Ngoại tuyến & Tự động Đồng bộ** | Tablet `1024×768` (`Offline` $\rightarrow$ `Online`) | Tải danh mục $\rightarrow$ Ngắt mạng (`setOffline(true)`) $\rightarrow$ Tạo 2 đơn hàng lưu vào `IndexedDB` $\rightarrow$ Bật mạng (`setOffline(false)`) $\rightarrow$ Xác nhận badge đồng bộ về `0`. |
| **`E2E-03`** | **Thanh toán VietQR Động & SignalR Push** | Desktop (`Online`) | Chọn thanh toán VietQR $\rightarrow$ Hiển thị mã QR động $\rightarrow$ Gửi gói tin Webhook giả lập tới Backend $\rightarrow$ Xác nhận hộp thoại QR tự đóng ngay lập tức qua SignalR. |
| **`E2E-04`** | **Nhập kho (WAC) & Kiểm soát Thẻ kho** | Desktop (`Manager Role`) | Quản lý nhập thêm lô hàng với giá nhập mới $\rightarrow$ Kiểm tra giá vốn WAC cập nhật đúng và thẻ kho ghi nhận bút toán `PurchaseReceipt`. |

---

## 💻 2. Triển khai Mẫu Kiểm thử Playwright (`e2e/pos-checkout-and-barcode.spec.ts`)

```typescript
import { expect, test } from '@playwright/test';

test.describe('Quầy thu ngân POS - Quét mã vạch & Thanh toán', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="tenantCode"]', 'uth-coffee');
    await page.fill('input[name="username"]', 'cashier01');
    await page.fill('input[name="password"]', 'Cashier@123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/pos/);
  });

  test('Quét mã vạch liên tiếp bằng phím và thanh toán bằng phím tắt F9', async ({ page }) => {
    // Chặn hàm window.print() của trình duyệt để không làm treo tiến trình test tự động
    await page.evaluate(() => {
      (window as unknown as { __printCalled: boolean }).__printCalled = false;
      window.print = () => {
        (window as unknown as { __printCalled: boolean }).__printCalled = true;
      };
    });

    // 1. Giả lập máy quét mã vạch HID gõ nhanh chuỗi "CF01" + Enter
    await page.keyboard.type('CF01', { delay: 10 });
    await page.keyboard.press('Enter');

    // Xác nhận sản phẩm đã xuất hiện trong giỏ hàng
    const cartPanel = page.getByTestId('pos-cart-panel');
    await expect(cartPanel).toContainText('Cà phê Sữa Đá');

    // 2. Nhấn phím tắt F9 để mở hộp thoại Thanh toán
    await page.keyboard.press('F9');
    const checkoutModal = page.getByRole('dialog');
    await expect(checkoutModal).toBeVisible();

    // 3. Nhập số tiền khách đưa và bấm Enter xác nhận thu tiền
    await page.fill('input[name="amountPaid"]', '50000');
    await page.keyboard.press('Enter');

    // 4. Xác nhận thông báo thành công, giỏ hàng được làm trống và lệnh in được kích hoạt
    await expect(page.getByText('Thanh toán thành công')).toBeVisible();
    await expect(cartPanel).toContainText('Giỏ hàng trống');

    const wasPrinted = await page.evaluate(
      () => (window as unknown as { __printCalled: boolean }).__printCalled
    );
    expect(wasPrinted).toBe(true);
  });
});
```

---

## 📸 3. Cấu hình Lưu Vết Lỗi Tự động (`playwright.config.ts`)

Để dễ dàng chẩn đoán khi một bài kiểm thử UI thất bại trên môi trường CI/CD:
* **`trace: 'on-first-retry'`:** Tự động ghi lại toàn bộ dòng thời gian DOM Snapshot, Network Requests và Console Logs dưới dạng file `trace.zip`.
* **`screenshot: 'only-on-failure'` & `video: 'retain-on-failure'`:** Chụp ảnh màn hình và lưu video khoảnh khắc xảy ra lỗi giao diện.

---
