# HƯỚNG DẪN SỬ DỤNG GIAO DIỆN QUẢN TRỊ WEB (ADMIN DASHBOARD)

1. TỔNG QUAN GIAO DIỆN ADMIN
Giao diện Admin Dashboard xây dựng bằng ReactJS, dành cho Chủ cửa hàng và Quản lý để vận hành toàn bộ hệ thống bán hàng đa kênh.

2. QUẢN LÝ DANH MỤC SẢN PHẨM & BIẾN THỂ SKU
• Cấu trúc phân cấp: Danh mục -> Thương hiệu -> Sản phẩm -> Biến thể (SKU).
• Tạo sản phẩm có biến thể (Màu sắc, Kích cỡ):
  - Vào menu Sản phẩm -> Thêm sản phẩm mới.
  - Chọn Danh mục và Thương hiệu.
  - Định nghĩa thuộc tính (ví dụ: Màu: Đỏ, Xanh; Size: S, M, L).
  - Hệ thống tự động tổ hợp thành các mã SKU riêng biệt. Mỗi SKU chứa: Mã SKUId, Mã vạch Barcode, Giá bán lẻ, Giá bán sỉ và Ngưỡng cảnh báo tồn kho.

3. TRUNG TÂM TIẾP NHẬN ĐƠN HÀNG (ORDER INGESTION HUB)
• Tất cả đơn hàng từ các kênh (POS, Admin tạo thủ công, Webhook Shopee/TikTok/Lazada) được chuẩn hóa về Canonical Order Model.
• Quản lý máy trạng thái đơn hàng (Order State Machine):
  - Draft: Đơn hàng khởi tạo.
  - Reserved: Đã thực thi giữ hàng chống bán vượt thành công.
  - Confirmed: Nhân viên duyệt đơn -> Hệ thống xuất kho thực tế, lưu snapshot giá vốn (Cost Price).
  - Completed: Giao hàng thành công.
  - Cancelled: Hủy đơn -> Giải phóng lượng hàng giữ về lại tồn kho khả dụng.

4. TRÌNH GIẢ LẬP WEBHOOK TMĐT (WEBHOOK SIMULATOR)
• Công cụ dành cho kiểm thử viên/quản trị viên để giả lập luồng đơn hàng từ Shopee/TikTok/Lazada.
• Cho phép bắn đồng thời các payload đơn hàng để test tính năng chịu tải (High-Concurrency) và cơ chế khóa giữ hàng chống bán vượt.

5. BÁO CÁO DOANH THU & LỢI NHUẬN GỘP
• Công thức: Lợi nhuận gộp = Doanh thu thuần - Tổng COGS.
• Báo cáo phân tích chi tiết theo thời gian, chi nhánh, SKU bán chạy và danh mục mang lại lợi nhuận cao nhất.