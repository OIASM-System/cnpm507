# KẾ HOẠCH TRIỂN KHAI HỆ THỐNG (DEPLOYMENT PLAN)

1. TỔNG QUAN TRIỂN KHAI
Tài liệu Kế hoạch triển khai quy định chiến lược, quy trình, hạ tầng và lịch trình phát hành hệ thống OISM lên các môi trường Development, Staging và Production.

2. MÔ HÌNH HẠ TẦNG TRIỂN KHAI (DEPLOYMENT ARCHITECTURE)
Hệ thống OISM được thiết kế để triển khai dưới dạng các Container hóa độc lập qua Docker:
• Web API Backend: ASP.NET Core (.NET 8) chạy trên Kestrel Server, cấu hình Reverse Proxy qua Nginx.
• Admin Dashboard: Single Page Application (ReactJS) được đóng gói và phục vụ bởi Nginx.
• POS PWA: Progressive Web App (ReactJS + Service Worker) phục vụ bởi Nginx hỗ trợ HTTPS.
• Database Server: PostgreSQL 16 tích hợp Volume lưu trữ dữ liệu bền vững.
• Realtime & Background Services: SignalR WebSockets cho thông báo thời gian thực và Hangfire Server xử lý tác vụ ngầm.

3. CHIẾN LƯỢC TRIỂN KHAI (DEPLOYMENT STRATEGY)
• Mô hình Blue-Green Deployment: Đảm bảo khả năng cập nhật phiên bản mới không gây gián đoạn dịch vụ (Zero-Downtime Deployment).
• Tự động hóa qua GitHub Actions CI/CD: Mọi bản xác nhận mã nguồn (Commit/PR) vào nhánh main sẽ tự động trigger quy trình Kiểm thử -> Build Image -> Push Registry -> Deploy Staging.
• Lịch trình phát hành: Thực hiện nâng cấp phiên bản ngoài giờ cao điểm vận hành (23:00 - 02:00 UTC+7).