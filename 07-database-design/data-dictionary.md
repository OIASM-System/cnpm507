Từ điển dữ liệu (Data Dictionary) - Hệ thống POS Đa chi nhánh

Tài liệu này liệt kê tổng quan toàn bộ các bảng dữ liệu được sử dụng trong hệ thống POS đa chi nhánh, được phân chia theo từng phân hệ nghiệp vụ cụ thể.

1. Phân hệ Hệ thống & Phân quyền (System & RBAC)
- tenant: Quản lý thông tin các tổ chức/doanh nghiệp sử dụng hệ thống (Mô hình Multi-Tenant).
- branch: Quản lý các chi nhánh/cửa hàng trực thuộc của từng Tenant.
- app_user: Quản lý thông tin tài khoản người dùng/nhân viên hệ thống.
- role: Quản lý danh sách các vai trò phân quyền (VD: Quản lý, Thu ngân, Kho...).
- permission: Danh sách các quyền hạn chi tiết trong hệ thống.
- role_permission: Bảng trung gian phân quyền cho từng vai trò (Many-to-Many).

2. Phân hệ Sản phẩm & Giá (Product & Pricing)
- category: Danh mục phân loại sản phẩm đa cấp.
- brand: Thương hiệu/Nhãn hiệu của sản phẩm.
- product: Sản phẩm gốc (chứa thông tin chung).
- sku: Biến thể cụ thể của sản phẩm (theo màu sắc, kích thước, mã vạch).
- product_price: Thiết lập giá bán linh hoạt của SKU theo từng chi nhánh.

3. Phân hệ Kho hàng & Logistics (Inventory & Warehouse)
- supplier: Thông tin nhà cung cấp hàng hóa.
- inventory_balance: Số lượng tồn kho hiện tại của SKU tại mỗi chi nhánh.
- inventory_transaction: Nhật ký lịch sử biến động kho (xuất/nhập/bán/hủy).
- stock_reservation: Giữ chỗ tồn kho tạm thời khi khách tạo đơn hàng.
- goods_receipt: Phiếu nhập kho hàng hóa từ nhà cung cấp.
- stock_transfer: Phiếu điều chuyển hàng hóa giữa các chi nhánh.
- stocktake: Phiếu kiểm kê kho định kỳ.

4. Phân hệ Bán hàng & Thanh toán (Sales & Orders)
- customer: Quản lý thông tin khách hàng mua sắm/tích điểm.
- order: Hóa đơn bán hàng tổng quan tại quầy POS.
- order_item: Chi tiết các mặt hàng có trong hóa đơn.
- payment: Lịch sử giao dịch thanh toán (Tiền mặt, Chuyển khoản, Thẻ...).

5. Phân hệ Tiện ích (Utilities)
- notification: Hệ thống thông báo đẩy cho người dùng.