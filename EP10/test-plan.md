# KẾ HOẠCH KIỂM THỬ TỔNG THỂ (TEST PLAN)

1. MỤC TIÊU VÀ PHẠM VI KIỂM THỬ
Tài liệu Kế hoạch kiểm thử này xác định chiến lược, tài nguyên, lịch trình và quy trình kiểm thử chất lượng cho Hệ thống Quản lý Bán hàng và Tồn kho Đa kênh (OISM).

Mục tiêu chính:
• Đảm bảo tính chính xác 100% của Sổ cái tồn kho chỉ ghi thêm (Append-Only Inventory Ledger).
• Xác minh cơ chế chống bán vượt (Anti-Oversell) hoạt động tuyệt đối trong kịch bản xử lý đồng thời cao (Flash Sale).
• Kiểm tra tính chính xác của thuật toán tính Giá vốn bình quân gia quyền (Weighted Average Cost - WAC).
• Đảm bảo khả năng cô lập dữ liệu giữa các khách hàng (Multi-tenant Data Isolation).

2. CÁC CẤP ĐỘ KIỂM THỬ (TESTING LEVELS)
• Unit Testing: Kiểm thử mức đơn vị cho logic cốt lõi trong tầng Domain và Application (.NET 8 xUnit).
• Integration Testing: Kiểm thử tích hợp giữa Application, EF Core, PostgreSQL Database và SignalR/Hangfire.
• API Testing: Kiểm thử các Endpoints Web API thông qua Postman và REST Client.
• UI & E2E Testing: Kiểm thử giao diện Admin Dashboard (ReactJS) và ứng dụng PWA POS bằng Playwright.
• Concurrency & Performance Testing: Kiểm thử xử lý đồng thời Flash Sale và đo độ trễ API bằng k6/JMeter.

3. NGUYÊN TẮC VÀ ĐIỀU KIỆN CHẤP NHẬN (ENTRY & EXIT CRITERIA)
• Điều kiện bắt đầu (Entry Criteria):
  - Mã nguồn Backend và Frontend đã vượt qua vòng Build CI/CD tự động.
  - Môi trường Staging/Testing đã được khởi tạo thành công với Docker Compose.
  - Dữ liệu mẫu (Demo/Seed Data) đã được nạp đầy đủ.

• Điều kiện kết thúc (Exit Criteria):
  - 100% các ca kiểm thử mức Critical và High đạt trạng thái PASSED.
  - Độ bao phủ mã nguồn (Code Coverage) cho các module cốt lõi (Inventory Ledger, Reserve, COGS) đạt tối thiểu 80%.
  - Không còn tồn tại lỗi mức độ Blocker hoặc Critical chưa được xử lý.