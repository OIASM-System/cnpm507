TỔNG QUAN CƠ SỞ DỮ LIỆU HỆ THỐNG POS PWA
Giới thiệu kiến trúc
Hệ thống POS PWA được thiết kế theo mô hình Multi-Tenant phục vụ nhiều doanh nghiệp F và B, hỗ trợ vận hành đa chi nhánh theo thời gian thực.
Cơ sở dữ liệu sử dụng PostgreSQL, tối ưu hóa cho việc xử lý giao dịch bán hàng OLTP và đồng bộ dữ liệu ngoại tuyến Offline-First.
Các phân hệ dữ liệu chính
Phân hệ Quản trị thuê bao và chi nhánh: Quản lý thông tin doanh nghiệp Tenant và các chi nhánh trực thuộc Branch.
Phân hệ Người dùng và Phân quyền: Quản lý tài khoản thu ngân, vai trò Role, quyền hạn Permission và ghi nhận thông báo.
Phân hệ Danh mục sản phẩm và giá: Quản lý danh mục Category, thương hiệu Brand, sản phẩm Product, biến thể SKU và giá bán Product Price theo chi nhánh.
Phân hệ Kho vận và Chuỗi cung ứng: Quản lý tồn kho Inventory Balance, giao dịch kho Inventory Transaction, phiếu nhập hàng Goods Receipt, đặt hàng trước Stock Reservation, chuyển kho Stock Transfer và kiểm kê Stocktake.
Phân hệ Bán hàng và Thanh toán: Quản lý đơn hàng Order, chi tiết đơn hàng Order Item, thông tin thanh toán Payment qua tiền mặt, chuyển khoản hoặc thẻ.
