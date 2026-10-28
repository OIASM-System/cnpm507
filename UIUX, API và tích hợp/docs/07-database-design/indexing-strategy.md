Chiến lược chỉ mục và khóa (Indexing Strategy) - Hệ thống POS Đa chi nhánh

Tài liệu này định nghĩa chiến lược đánh chỉ mục (Index) nhằm tối ưu hóa hiệu năng truy vấn cho toàn bộ hệ thống POS đa chi nhánh.

1. Nguyên tắc thiết kế chỉ mục tổng quan
- Bắt buộc tạo Index cho tất cả các cột là khóa chính (Primary Key) và khóa ngoại (Foreign Key) để tối ưu truy vấn JOIN.
- Mọi bảng trong mô hình Multi-Tenant phải có Composite Index kết hợp với tenant_id cho các truy vấn lọc dữ liệu.
- Tránh tạo Index dư thừa trên các cột ít khi tìm kiếm hoặc các bảng có tần suất INSERT/UPDATE quá cao để không làm giảm hiệu năng ghi.

2. Danh sách chỉ mục theo từng phân hệ

Phân hệ Hệ thống & Phân quyền
- Bảng app_user: Index trên cột username và email để tối ưu tốc độ đăng nhập.
- Bảng role_permission: Composite Index trên cặp cột (role_id, permission_id) để kiểm tra quyền truy cập nhanh.

Phân hệ Sản phẩm & Giá
- Bảng sku: Unique Index trên sku_code và barcode để quét mã vạch bán hàng tại quầy POS đạt tốc độ tức thì.
- Bảng product: Index trên cột category_id và name để phục vụ tìm kiếm, lọc sản phẩm theo danh mục.

Phân hệ Kho hàng & Logistics
- Bảng inventory_balance: Composite Index trên (branch_id, sku_id) để tra cứu số lượng tồn kho tức thì khi lập đơn hàng.
- Bảng inventory_transaction: Index trên created_at và branch_id để tối ưu các báo cáo lịch sử xuất nhập kho theo thời gian.

Phân hệ Bán hàng & Thanh toán
- Bảng order: Composite Index trên (tenant_id, branch_id, created_at) để tăng tốc xuất báo cáo doanh thu theo chi nhánh và khoảng thời gian.
- Bảng order_item: Index trên order_id và sku_id để lấy danh sách chi tiết hóa đơn.<!--  -->