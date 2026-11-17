# 📱 Responsive POS Layout & Thermal Receipt Print - POS PWA Project

Tài liệu này quy định thiết kế giao diện thích ứng đa thiết bị (**Responsive Design**) và chuẩn định dạng in hóa đơn nhiệt (**Thermal Receipt CSS `@media print`**) cho ứng dụng **React PWA** trong hệ thống **POS PWA (Point of Sale Progressive Web App)**. Hệ thống được xây dựng bằng **Tailwind CSS v3/v4** với triết lý **Touch-First & Multi-Device Adaptive**, vận hành mượt mà trên cả **Màn hình cảm ứng POS cố định (Desktop 1366px+)**, **Máy tính bảng tại quầy (iPad / Android Tablet 768px–1024px)** và **Điện thoại nhân viên (Mobile < 768px)**.

---

## 📐 1. Chiến lược Bố cục theo Điểm ngắt Thiết bị (Breakpoint Strategy)

| Thiết bị mục tiêu | Breakpoint (`Tailwind`) | Bố cục màn hình bán hàng (`PosTerminalPage`) | Tối ưu thao tác người dùng |
| :--- | :--- | :--- | :--- |
| **Desktop / Máy POS cố định** | `lg` (`>= 1024px`) | **Chia 2 cột cố định (Split-Screen 65% / 35%):**<br>• Trái (65%): Thanh danh mục + Lưới sản phẩm 4–5 cột.<br>• Phải (35%): Giỏ hàng cố định (`CartPanel`) + Nút Thanh toán lớn ở đáy. | Không cuộn toàn trang (`h-screen overflow-hidden`), chỉ cuộn độc lập vùng sản phẩm và danh sách món trong giỏ. |
| **Máy tính bảng (Tablet)** | `md` (`768px – 1023px`) | **Chia 2 cột tỷ lệ 60% / 40%:**<br>• Lưới sản phẩm 3 cột với kích thước thẻ rộng rãi. | Kích thước vùng chạm tối thiểu **`44px × 44px`** theo chuẩn Apple HIG / WCAG để thu ngân bấm nhanh không nhầm nút. |
| **Điện thoại (Mobile POS)** | `< 768px` (Default) | **Bố cục 1 cột + Thanh nổi dưới đáy (Bottom Sheet Cart):**<br>• Lưới sản phẩm 2 cột.<br>• Thanh tóm tắt cố định ở đáy màn hình hiển thị tổng số món & tổng tiền; bấm vào sẽ trượt lên (`Drawer`) toàn bộ giỏ hàng. | Cho phép nhân viên phục vụ đứng tại bàn khách gọi món và chốt đơn ngay trên điện thoại. |

---

## 🎨 2. Hệ thống Nhận diện Trạng thái Trực quan (Visual Status Indicators)

Tại quầy thu ngân bận rộn, thu ngân cần nhận biết trạng thái kết nối mạng và đồng bộ chỉ bằng ánh nhìn lướt qua trong **0.5 giây**:

* **Thanh chỉ báo kết nối (`NetworkStatusPill` trên Header):**
  * 🟢 **Trực tuyến & Real-time Active (`Online`):** Chấm xanh lá — SignalR đang kết nối, tồn kho đồng bộ tức thì.
  * 🟡 **Đang đồng bộ đơn Offline (`Syncing 3 orders...`):** Chấm vàng nhấp nháy — Vừa có mạng trở lại, hệ thống đang đẩy hàng đợi từ `IndexedDB` lên máy chủ.
  * 🔴 **Chế độ Ngoại tuyến (`Offline Mode`):** Banner màu hổ phách/đỏ nhẹ — Mất mạng Internet, mọi đơn hàng vẫn thanh toán bình thường và được lưu an toàn vào bộ nhớ máy.

---

## 🖨️ 3. Chuẩn In Hóa Đơn Nhiệt Khổ 58mm / 80mm (`@media print`)

Ứng dụng **POS PWA** hỗ trợ in trực tiếp hóa đơn ra máy in nhiệt phổ thông (**K58 / K80**) thông qua trình duyệt mà không cần cài đặt phần mềm trung gian phức tạp, nhờ bộ quy tắc CSS `@media print`:

### 3.1. Cấu hình CSS In ấn chuyên biệt (`src/styles/print.css`)
```css
@media print {
  /* 1. Ẩn toàn bộ giao diện POS (Sidebar, Lưới sản phẩm, Modal, Nút bấm) */
  body * {
    visibility: hidden;
  }

  /* 2. Chỉ hiển thị vùng mẫu hóa đơn nhiệt */
  #thermal-receipt-area,
  #thermal-receipt-area * {
    visibility: visible;
  }

  /* 3. Căn lề chuẩn khổ giấy cuộn nhiệt 80mm (không giới hạn chiều cao) */
  @page {
    size: 80mm auto;
    margin: 0mm;
  }

  #thermal-receipt-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 72mm; /* Trừ lề an toàn 4mm mỗi bên cho đầu in nhiệt */
    padding: 4mm;
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    line-height: 1.4;
    color: #000000;
    background: #ffffff;
  }
}
```

### 3.2. Cấu trúc thông tin bắt buộc trên Biên lai (`ReceiptPrintTemplate.tsx`)
* Tên cửa hàng (`Tenant.Name`), địa chỉ và số điện thoại hotline.
* Mã hóa đơn (`OrderNumber`), ngày giờ giao dịch, tên thu ngân lập đơn.
* Bảng chi tiết từng món (`ProductNameSnapshot`, `Quantity`, `UnitPriceSnapshot`, `LineTotal`).
* Tổng tiền hàng (`SubTotal`), chiết khấu (`DiscountAmount`), tổng thanh toán (`TotalAmount`), tiền khách đưa, tiền thối lại và phương thức thanh toán.
* Mã QR tra cứu hóa đơn điện tử hoặc lời cảm ơn cuối hóa đơn.

---
