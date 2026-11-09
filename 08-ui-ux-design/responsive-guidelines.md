# Quy tắc Thiết kế Đáp ứng (Responsive Guidelines)

Ứng dụng POS PWA được thiết kế theo định hướng **Desktop-First & Tablet-Optimized** (Ưu tiên tối ưu cho máy POS màn hình lớn và máy tính bảng tại quầy), đồng thời đảm bảo linh hoạt trên các thiết bị khác:

## 1. Phân chia bố cục theo kích thước màn hình
* **Màn hình lớn / Máy POS quầy thanh toán (Width $\ge$ 1024px):**
  * Hiển thị đầy đủ 3 cột: Cột danh mục/sản phẩm bên trái, cột giỏ hàng/thanh toán ở giữa, và thông tin chi tiết/phím tắt chức năng bên phải.
* **Máy tính bảng / Tablet thu ngân (768px $\le$ Width $<$ 1024px):**
  * Bố cục 2 cột linh hoạt. Giỏ hàng có thể thu gọn thành dạng ngăn kéo (Drawer) trượt ra khi cần xem nhanh để tiết kiệm không gian.
* **Thiết bị di động / Smartphone quản lý (Width $<$ 768px):**
  * Chuyển đổi sang giao diện xếp dọc (Single Column). Các thao tác chuyển đổi giữa màn hình chọn sản phẩm và giỏ hàng sử dụng các thẻ tab hoặc nút bấm chuyển trang linh hoạt.

## 2. Quy chuẩn chạm và tương tác
* Đảm bảo mọi khoảng cách giữa các nút bấm (Spacing) tối thiểu là 8px để tránh việc thu ngân bấm nhầm sản phẩm hoặc số lượng trong giờ cao điểm.