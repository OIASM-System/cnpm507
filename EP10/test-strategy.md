# CHIẾN LƯỢC KIỂM THỬ PHẦN MỀM (TEST STRATEGY)

1. TỔNG QUAN CHIẾN LƯỢC
Tài liệu này quy định phương pháp luận, công cụ, ma trận môi trường và chiến lược kiểm thử tự động áp dụng cho dự án OISM nhằm đảm bảo tính toàn vẹn dữ liệu, hiệu năng cao và bảo mật đa khách hàng.

2. PHƯƠNG PHÁP VÀ CÔNG CỤ KIỂM THỬ (TESTING APPROACH & TOOLS)
• Kiểm thử Đơn vị (Unit Testing): 
  - Công cụ: xUnit, Moq, FluentAssertions (.NET 8).
  - Phạm vi: Tầng Domain (Logic tính COGS WAC, Rules chống bán vượt, Order State Machine) và Tầng Application (Commands, Queries).
• Kiểm thử Tích hợp (Integration Testing):
  - Công cụ: Testcontainers, Respawn, EF Core In-Memory / PostgreSQL Docker.
  - Phạm vi: Tương tác giữa EF Core với Database PostgreSQL, Interceptor ghi Sổ cái Append-Only, SignalR Hub và Hangfire Background Jobs.
• Kiểm thử Web API (API Testing):
  - Công cụ: Postman Collection, REST Client, Swagger / OpenAPI.
  - Phạm vi: Xác thực JWT Token, phân quyền RBAC, validate DTOs và xử lý mã lỗi HTTP chuẩn.
• Kiểm thử Giao diện & E2E (UI/UX Testing):
  - Công cụ: Playwright, Vitest, React Testing Library.
  - Phạm vi: Luồng bán hàng quầy PWA POS, quét mã vạch, in hóa đơn và Admin Dashboard.
• Kiểm thử Xử lý Đồng thời & Hiệu năng (Concurrency & Performance Testing):
  - Công cụ: k6, JMeter, NBomber.
  - Phạm vi: Kịch bản Flash Sale 50 đơn hàng đồng thời nhắm vào 1 SKU còn lại, quét mã vạch POS độ trễ dưới 200ms.

3. CHIẾN LƯỢC QUẢN LÝ DỮ LIỆU KIỂM THỬ
• Tách biệt tuyệt đối giữa cơ sở dữ liệu Test và Production.
• Sử dụng script Seed Data tự động khởi tạo dữ liệu mẫu cho Demo Tenant, Danh mục sản phẩm, Biến thể SKU và Mã vạch EAN-13.
• Tự động dọn dẹp (Reset) trạng thái cơ sở dữ liệu giữa các ca kiểm thử tích hợp bằng Respawn để tránh phụ thuộc dữ liệu.