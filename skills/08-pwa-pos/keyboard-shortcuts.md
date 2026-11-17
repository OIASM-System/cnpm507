# ⌨️ POS Keyboard Shortcuts & Zero-Mouse Workflow - POS PWA Project

Tài liệu này quy định hệ thống **Phím tắt Tốc độ cao (Keyboard Shortcuts)** cho giao diện bán hàng trong hệ thống **POS PWA (Point of Sale Progressive Web App)**. Tại các siêu thị mini, cửa hàng tạp hóa hoặc quán cà phê giờ cao điểm, việc thu ngân phải di chuyển chuột liên tục giữa ô tìm kiếm, danh sách sản phẩm và nút thanh toán làm giảm tốc độ phục vụ. Hệ thống phím tắt cho phép thu ngân vận hành **100% bằng bàn phím (Zero-Mouse Operation)**, rút ngắn thời gian hoàn tất một hóa đơn xuống dưới **5 giây**.

---

## 🗺️ 1. Bản đồ Phím tắt Chuẩn Toàn hệ thống (Shortcut Keymap)

| Phím tắt | Ngữ cảnh áp dụng | Hành động thực thi | Trải nghiệm thực tế tại quầy |
| :--- | :--- | :--- | :--- |
| **`F2`** | Màn hình bán hàng POS | Focus ngay vào ô **Tìm kiếm sản phẩm (Tên / Mã SKU)** và bôi đen từ khóa cũ. | Thu ngân gõ nhanh tên món không có mã vạch mà không cần chạm chuột. |
| **`F3`** | Màn hình bán hàng POS | Mở cửa sổ **Quét mã vạch bằng Camera** (nếu dùng laptop/tablet có webcam). | Thay thế nhanh khi máy quét cầm tay hết pin. |
| **`F4`** | Khi giỏ hàng có $\ge 1$ món | **Tạm lưu đơn chờ (`Hold Order`)** và mở giỏ hàng trống mới. | Xử lý nhanh tình huống khách quên ví, nhường quầy cho khách sau thanh toán trước. |
| **`F8`** | Khi giỏ hàng có $\ge 1$ món | Focus trực tiếp vào ô **Nhập chiết khấu / Giảm giá đơn hàng**. | Áp dụng nhanh khuyến mãi hoặc giảm giá cho khách thân thiết. |
| **`F9`** hoặc **`F12`** | Khi giỏ hàng có $\ge 1$ món | Mở hộp thoại **Thanh toán (`CheckoutModal`)** và focus sẵn vào ô *Tiền khách đưa*. | Chuyển sang bước thu tiền chỉ với 1 phím bấm. |
| **`Enter`** | Bên trong `CheckoutModal` | **Xác nhận hoàn tất thanh toán** & kích hoạt lệnh in hóa đơn nhiệt. | Hoàn tất toàn bộ quy trình bán hàng. |
| **`+` / `-`** | Khi chọn 1 dòng món trong giỏ | Tăng hoặc giảm `1` đơn vị số lượng của sản phẩm đang chọn. | Điều chỉnh nhanh số lượng khi khách mua nhiều món giống nhau. |
| **`Delete`** | Khi chọn 1 dòng món trong giỏ | Xóa sản phẩm đang chọn khỏi giỏ hàng hiện tại. | Loại bỏ nhanh món khách đổi ý không lấy nữa. |
| **`Esc`** | Mọi hộp thoại (`Modal`) | Đóng hộp thoại hiện tại hoặc xóa từ khóa tìm kiếm đang nhập. | Quay lại màn hình chính tức thì. |

---

## 💻 2. Triển khai Hook Quản lý Phím tắt Tập trung (`usePosShortcuts.ts`)

Để tránh xung đột với các phím tắt mặc định của trình duyệt (như `F3` mở thanh tìm kiếm của Chrome hoặc `F12` mở DevTools) và ngăn phím tắt kích hoạt nhầm khi nhân viên đang gõ văn bản:

```typescript
import { useEffect } from 'react';

export interface PosShortcutHandlers {
  onFocusSearch?: () => void;
  onHoldOrder?: () => void;
  onFocusDiscount?: () => void;
  onOpenCheckout?: () => void;
  onEscape?: () => void;
}

export function usePosShortcuts(handlers: PosShortcutHandlers, isModalOpen: boolean) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Nếu đang mở Modal (VD: CheckoutModal), chỉ cho phép phím Esc hoạt động ở tầng toàn cục
      if (isModalOpen) {
        if (event.key === 'Escape' && handlers.onEscape) {
          event.preventDefault();
          handlers.onEscape();
        }
        return;
      }

      switch (event.key) {
        case 'F2':
          event.preventDefault();
          handlers.onFocusSearch?.();
          break;

        case 'F4':
          event.preventDefault();
          handlers.onHoldOrder?.();
          break;

        case 'F8':
          event.preventDefault();
          handlers.onFocusDiscount?.();
          break;

        case 'F9':
        case 'F12':
          event.preventDefault();
          handlers.onOpenCheckout?.();
          break;

        case 'Escape':
          handlers.onEscape?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers, isModalOpen]);
}
```

---

## 🧭 3. Chỉ dẫn Trực quan trên Giao diện (Discoverable UI Hints)

Để thu ngân mới nhận việc có thể làm quen và ghi nhớ phím tắt tự nhiên mà không cần đọc sách hướng dẫn:
* Các nút thao tác chính trên màn hình POS hiển thị kèm nhãn phím tắt nhỏ gọn (`Keycap Badge`):
  * Ô tìm kiếm hiển thị placeholder: *"Tìm tên món hoặc quét mã vạch... `[F2]`"*.
  * Nút tạm lưu đơn hiển thị: *"Giữ đơn `[F4]`"*.
  * Nút thanh toán chính ở đáy giỏ hàng hiển thị: *"THANH TOÁN `[F9]`"*.
* Trên thiết bị cảm ứng thuần túy (iPad / Điện thoại không gắn bàn phím rời), hệ thống tự động ẩn các nhãn `[F2]`, `[F9]` thông qua media query `@media (hover: hover) and (pointer: fine)` để giao diện luôn gọn gàng.

---
