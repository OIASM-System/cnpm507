# Yêu cầu Giao diện Người dùng (UI Requirements) - POS PWA

## 1. Yêu cầu chung về Giao diện
* **Tính trực quan và tối ưu thao tác:** Giao diện được thiết kế chuyên biệt cho nhân viên thu ngân thao tác nhanh trên màn hình cảm ứng (Touchscreen) hoặc máy POS tại quầy, giảm thiểu số lần chạm/click.
* **Hỗ trợ ngoại tuyến (Offline-First):** Giao diện phải thông báo trực quan trạng thái kết nối mạng (Online/Offline) trên thanh tiêu đề để thu ngân nắm bắt tình hình đồng bộ dữ liệu.
* **Hiệu năng phản hồi:** Thời gian phản hồi giao diện khi thêm sản phẩm vào giỏ hàng hoặc quét mã vạch phải dưới 200ms.

## 2. Phân hệ màn hình cốt lõi
* **Màn hình Đăng nhập (Login):** Hỗ trợ nhập mã PIN bảo mật bằng bàn phím số ảo, chống lộ mật khẩu và tối ưu tốc độ đổi ca.
* **Màn hình Bán hàng chính (Main Register):** 
  * Khu vực tìm kiếm sản phẩm nhanh và quét mã vạch SKU.
  * Danh mục phân loại sản phẩm trực quan bằng các nút bấm lớn.
  * Bảng giỏ hàng hiển thị rõ tên sản phẩm, số lượng, đơn giá, tổng tiền và các thao tác tăng/giảm/xóa nhanh.
* **Màn hình Thanh toán (Checkout):** Cung cấp các phương thức thanh toán linh hoạt (Tiền mặt, Chuyển khoản QR, Thẻ), tự động tính tiền thối lại cho khách.S