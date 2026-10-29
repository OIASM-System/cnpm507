# HƯỚNG DẪN ĐÓNG GÓI VÀ CHẠY DOCKER COMPOSE

1. CẤU TRÚC CONTAINER DOCKER COMPOSE
Tệp docker-compose.yml khởi tạo và kết nối 5 Dịch vụ chính trong cùng một Docker Network (oism-network):
• postgres: Database PostgreSQL 16 (Port internal 5432).
• backend-api: Web API .NET 8 (Port internal 5000).
• admin-dashboard: Web Admin ReactJS (Port internal 8080).
• pos-pwa: Web POS PWA ReactJS (Port internal 8081).
• nginx-proxy: Nginx Reverse Proxy đóng vai trò Gateway (Port external 80/443).

2. QUY TRÌNH TRIỂN KHAI QUA DOCKER COMPOSE
• Bước 1: Sao chép thư mục dự án lên máy chủ:
  git clone https://github.com/organization/omnichannel-inventory-sales-management-system.git
  cd omnichannel-inventory-sales-management-system

• Bước 2: Khởi tạo tệp cấu hình môi trường từ tệp mẫu:
  cp infrastructure/environments/production.env.example .env

• Bước 3: Đóng gói và khởi chạy toàn bộ cụm Container:
  docker compose -f docker-compose.yml up -d --build

• Bước 4: Kiểm tra trạng thái hoạt động của các Container:
  docker compose ps

• Bước 5: Xem nhật ký hoạt động (Logs) của dịch vụ Backend:
  docker compose logs -f backend-api