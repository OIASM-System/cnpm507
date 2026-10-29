# CÁC CA KIỂM THỬ BẢO MẬT & PHÂN QUYỀN (SECURITY TEST CASES)

1. TỔNG QUAN BẢO MẬT
Kiểm thử các ràng buộc bảo mật theo chuẩn OWASP Top 10, xác thực JWT Token, phân quyền theo vai trò (RBAC) và cơ chế cô lập dữ liệu SaaS đa khách hàng.

2. DANH SÁCH CA KIỂM THỬ BẢO MẬT

Mã ca kiểm thử: SEC-TENANT-01
Kiểm thử tấn công rò rỉ dữ liệu chéo giữa các Tenant (NFR-TENANT-01)
• Kịch bản: Bẻ khóa URL bằng cách thay đổi TenantId trên Header API hoặc Query String sang Tenant khác.
• Các bước thực hiện:
  1. Đăng nhập tài khoản Tenant-A để lấy JWT Token.
  2. Dùng Token này gửi Request lấy dữ liệu đơn hàng của Tenant-B: GET /api/v1/orders?tenantId=tenant-beta-id.
• Kết quả kỳ vọng:
  - Bộ lọc EF Core Global Query Filter tự động đè TenantId từ JWT Token.
  - Kết quả trả về danh sách rỗng (200 OK) hoặc 403 Forbidden. Tuyệt đối không trả về dữ liệu của Tenant-B.

Mã ca kiểm thử: SEC-PWD-01
Kiểm thử Mã hóa mật khẩu an toàn (NFR-SEC-01)
• Kiểm tra trực tiếp bảng Users trong Cơ sở dữ liệu PostgreSQL.
• Kết quả kỳ vọng: Mật khẩu người dùng được băm (hash) bằng thuật toán BCrypt / Argon2, tuyệt đối không lưu mật khẩu dạng Plaintext.