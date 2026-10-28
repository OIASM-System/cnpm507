# HƯỚNG DẪN SỬ DỤNG DÀNH CHO CHỦ CỬA HÀNG (STORE OWNER / TENANT ADMIN)

1. GIỚI THIỆU
Tài liệu này hướng dẫn Chủ cửa hàng (Store Owner / Tenant Admin) thiết lập, cấu hình và quản trị toàn bộ không gian làm việc đa khách hàng (Tenant) trên Hệ thống Quản lý Bán hàng và Tồn kho Đa kênh (OISM).

2. QUẢN LÝ TENANT & KHÔNG GIAN DỮ LIỆU
• Khởi tạo Tenant Space: Mỗi doanh nghiệp khi đăng ký sẽ được cấp một TenantId duy nhất. Dữ liệu giữa các Tenant được cô lập tuyệt đối ở cấp cơ sở dữ liệu (EF Core Global Query Filters).
• Cấu hình thông tin doanh nghiệp:
  - Truy cập Cài đặt hệ thống -> Thông tin Tenant.
  - Cập nhật Tên doanh nghiệp, Mã số thuế, Email quản trị và Số điện thoại liên hệ.
  - Cấu hình tiền tệ mặc định (VND) và múi giờ vận hành (UTC+7).

3. QUẢN LÝ CHI NHÁNH & KHO HÀNG (BRANCHES & WAREHOUSES)
• Tạo mới chi nhánh cửa hàng:
  - Vào menu Quản lý Chi nhánh -> Thêm chi nhánh.
  - Nhập Mã chi nhánh, Tên chi nhánh, Địa chỉ và Số điện thoại.
  - Bật/Tắt trạng thái hoạt động của chi nhánh.
• Gán kho hàng cho chi nhánh: Mỗi chi nhánh có thể liên kết với một hoặc nhiều kho vật lý để theo dõi tồn kho theo vị trí.

4. PHÂN QUYỀN NGƯỜI DÙNG THEO VAI TRÒ (RBAC)
Hệ thống OISM cung cấp 3 vai trò mặc định:
• Owner (Chủ cửa hàng): Toàn quyền truy cập tất cả API, cấu hình hệ thống, xem báo cáo doanh thu/lợi nhuận gộp và quản lý tài khoản.
• Staff (Quản lý kho / Đơn hàng): Quản lý danh mục sản phẩm, lập phiếu nhập kho, chuyển kho, kiểm kê và xử lý đơn hàng đa kênh.
• Cashier (Thu ngân): Chỉ có quyền truy cập vào giao diện bán hàng tại quầy (PWA POS).

Quy trình tạo tài khoản nhân viên:
  - Vào Quản lý Tài khoản -> Thêm tài khoản.
  - Nhập Email, Họ tên, Số điện thoại và Mật khẩu khởi tạo.
  - Chọn Vai trò (Staff hoặc Cashier) và Gán chi nhánh làm việc cố định.

5. QUẢN LÝ BẢNG GIÁ NIÊM YẾT
• Giá Bán Lẻ (Retail Price): Áp dụng mặc định cho các đơn hàng bán tại quầy POS và đơn hàng TMĐT.
• Giá Bán Sỉ (Wholesale Price): Áp dụng cho các đối tác/khách hàng mua số lượng lớn.
*Lưu ý: Giá niêm yết được quản lý tách biệt hoàn toàn với Giá vốn hàng bán (COGS).*

6. THEO DÕI BÁO CÁO CẤP CAO & CẢNH BÁO AI
• Báo cáo Doanh thu & Lợi nhuận gộp: Lọc theo khoảng thời gian, chi nhánh, kênh bán (POS, Shopee, TikTok, Lazada) và SKU.
• Cảnh báo Đặt hàng lại (AI Reorder Alerts): Xem danh sách các mặt hàng chạm ngưỡng tồn kho tối thiểu và nhận gợi ý số lượng cần đặt hàng lại từ mô hình dự báo AI.