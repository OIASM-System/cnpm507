# Hệ thống Thiết kế Chuẩn (Design System)

## 1. Bảng màu (Color Palette)
* **Màu chủ đạo (Primary):** Xanh dương đậm (`#1E3A8A` hoặc `#2563EB`) – Tạo cảm giác tin cậy, chuyên nghiệp cho hệ thống tài chính/bán hàng.
* **Màu phụ trợ (Secondary/Accent):** Xanh lá cây (`#10B981`) – Dùng cho các nút hành động thành công, xác nhận thanh toán, hoàn tất đơn hàng.
* **Màu cảnh báo (Warning/Danger):** Đỏ (`#EF4444`) – Dùng cho thông báo lỗi, hủy đơn, hoặc cảnh báo tồn kho thấp.
* **Màu nền (Background):** Xám nhạt (`#F3F4F6` hoặc `#F9FAFB`) để làm nổi bật các thẻ nội dung (Card).

## 2. Kiểu chữ (Typography)
* **Phông chữ chính:** Inter hoặc Roboto (Hỗ trợ hiển thị tiếng Việt có dấu sắc nét, rõ ràng trên mọi kích thước màn hình).
* **Cỡ chữ chuẩn:**
  * Tiêu đề lớn (H1): 24px - Bold (Dùng cho tên màn hình, trang chính).
  * Tiêu đề phụ (H2, H3): 18px / 16px - Semi-bold.
  * Văn bản nội dung (Body): 14px - Regular (Dùng cho danh sách sản phẩm, bảng giá).
  * Chữ số tiền / Nút bấm: 16px - Bold để thu ngân dễ nhìn.

## 3. Thành phần giao diện (Components)
* **Buttons (Nút bấm):** Kích thước tối thiểu 44x44px để thao tác chạm ngón tay không bị nhầm lẫn. Bo góc nhẹ (Border-radius: 8px).
* **Inputs (Ô nhập liệu):** Viền xám rõ ràng, đổi màu viền sang xanh dương khi người dùng click vào nhập liệu (Focus state).