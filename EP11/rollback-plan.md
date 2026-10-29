# KẾ HOẠCH KHÔI PHỤC SỰ CỐ (ROLLBACK PLAN)

1. TỔNG QUAN
Kế hoạch Rollback định nghĩa các bước hành động khẩn cấp để đưa hệ thống quay trở lại phiên bản ổn định gần nhất khi xảy ra sự cố nghiêm trọng sau khi triển khai phiên bản mới.

2. KỊCH BẢN KÍCH HOẠT ROLLBACK
Khôi phục khẩn cấp được kích hoạt ngay lập tức nếu phát sinh một trong các điều kiện:
• Tỷ lệ lỗi API HTTP 5xx vượt quá 5% trong 10 phút liên tục.
• Xảy ra lỗi hỏng dữ liệu hoặc sai lệch Sổ cái tồn kho nghiêm trọng.
• Cơ sở dữ liệu bị mất kết nối hoặc treo không thể khôi phục tự động.

3. QUY TRÌNH THỰC HIỆN ROLLBACK (STEP-BY-STEP)
• Bước 1: Ngắt kết nối truy cập từ bên ngoài bằng cách chuyển Nginx sang màn hình Bảo trì (Maintenance Mode):
  docker compose exec nginx-proxy cp /etc/nginx/maintenance.conf /etc/nginx/conf.d/default.conf
  docker compose exec nginx-proxy nginx -s reload

• Bước 2: Khôi phục Docker Image phiên bản cũ gần nhất:
  docker compose pull backend-api:v1.0.0-stable
  docker compose up -d --no-deps backend-api

• Bước 3: Khôi phục dữ liệu từ bản Sao lưu (Backup) gần nhất nếu có sai lệch Schema/Data:
  bash infrastructure/scripts/restore-database.sh /backups/oism_db_before_deploy.sql

• Bước 4: Kiểm tra Health Check Backend -> Tắt màn hình Bảo trì và mở lại cổng Nginx.