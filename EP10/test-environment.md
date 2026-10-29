# CẤU HÌNH MÔI TRƯỜNG KIỂM THỬ (TEST ENVIRONMENT)

1. TỔNG QUAN MÔI TRƯỜNG
Môi trường kiểm thử được đóng gói hoàn toàn bằng Docker Container nhằm đảm bảo tính đồng nhất giữa môi trường phát triển của lập trình viên và môi trường kiểm thử CI/CD.

2. CẤU HÌNH HẠ TẦNG DOCKER COMPOSE TEST
• Database Server: PostgreSQL 16
  - Cấu hình: Cô lập Schema theo TenantId, áp dụng EF Core Global Query Filters.
  - Kết nối: Host localhost, Port 5433, Database `OISM_TestDb`.
• Backend API Server: .NET 8 Web API
  - Môi trường: ASPNETCORE_ENVIRONMENT=Testing.
  - Dịch vụ đi kèm: SignalR Hub cho thông báo thời gian thực, Hangfire Server cho tác vụ ngầm.
• Frontend Admin Dashboard: ReactJS + Vite (Port 3001).
• Frontend POS PWA: ReactJS + Service Worker PWA (Port 3002).

3. QUY TRÌNH KÍCH HOẠT MÔI TRƯỜNG KIỂM THỬ
• Bước 1: Di chuyển vào thư mục gốc dự án.
• Bước 2: Chạy script khởi tạo môi trường: bash scripts/setup-development.sh
• Bước 3: Nạp dữ liệu kiểm thử mẫu: bash scripts/seed-demo-data.sh
• Bước 4: Kiểm tra trạng thái Health Check API tại địa chỉ http://localhost:5000/health.