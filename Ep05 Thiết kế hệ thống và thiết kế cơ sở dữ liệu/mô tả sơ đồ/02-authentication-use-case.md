# Mô tả sơ đồ Use Case – Authentication & Security

## 1. Mục đích
Sơ đồ mô tả các chức năng xác thực, quản lý tài khoản và kiểm soát quyền truy cập trong OISM.

## 2. System Boundary
Ranh giới được đặt tên **Authentication & Security Subsystem**.

## 3. Actors
- **Account:** người dùng tài khoản của hệ thống.
- **Store Owner / Admin:** chủ cửa hàng hoặc quản trị viên, thực hiện đăng ký tenant, quản lý người dùng/vai trò và quản lý chi nhánh/cửa hàng.

## 4. Các Use Case
- **UC-AUTH-01: Register Tenant Space:** đăng ký không gian tenant riêng cho cửa hàng/doanh nghiệp.
- **UC-AUTH-02: Login / Logout (JWT):** đăng nhập và đăng xuất bằng cơ chế xác thực JWT.
- **View Profile & Change Password:** xem thông tin hồ sơ và đổi mật khẩu.
- **Refresh JWT Token:** làm mới JWT token khi đáp ứng chính sách phiên đăng nhập.
- **UC-AUTH-03: Manage Users & Roles:** quản lý người dùng và vai trò.
- **UC-AUTH-04: Manage Branches & Stores:** quản lý cửa hàng/chi nhánh.

## 5. Quan hệ
- `Login / Logout (JWT)` **include** `Refresh JWT Token` theo quan hệ được thể hiện trong sơ đồ. Nhóm cần xác nhận chiều và ý nghĩa quan hệ: nếu refresh token chỉ xảy ra khi access token sắp hết hạn, việc mô hình hóa thành `include` bắt buộc có thể chưa phản ánh đúng điều kiện thực tế; có thể cân nhắc `extend` nếu phù hợp với quy ước của nhóm.

## 6. Quy tắc nghiệp vụ cần bảo đảm
- Chức năng quản trị người dùng và chi nhánh phải yêu cầu quyền phù hợp.
- Danh tính người dùng và tenant cần được xác định từ ngữ cảnh xác thực đáng tin cậy.
- JWT/refresh token cần được xử lý theo chính sách bảo mật của hệ thống; không lưu token hoặc mật khẩu dạng rõ trong log.

## 7. Kết quả
Sơ đồ xác định phạm vi xác thực và quản trị truy cập. Các luồng đăng nhập thất bại, khóa tài khoản, hết hạn token và phân quyền chi tiết nên được mô tả trong đặc tả Use Case riêng.
