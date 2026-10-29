# HƯỚNG DẪN CHẨN ĐOÁN & XỬ LÝ SỰ CỐ HẠ TẦNG (TROUBLESHOOTING)

1. CÁC SỰ CỐ HẠ TẦNG THƯỜNG GẶP

Sự cố 1: Container backend-api liên tục bị Restart (CrashLoopBackOff)
• Chẩn đoán:
  - Xem nhật ký lỗi của Container: docker compose logs --tail=100 backend-api
  - Nguyên nhân phổ biến: Chuỗi kết nối Database sai, Mật khẩu PostgreSQL không đúng hoặc chưa chạy xong Migration.
• Biện pháp xử lý:
  - Kiểm tra tệp .env xem DB_CONNECTION_STRING đã khớp với thông số của Container postgres chưa.
  - Thử kết nối trực tiếp vào DB: docker compose exec postgres psql -U oism_admin -d oism_db.

Sự cố 2: Lỗi CORS khi POS PWA hoặc Admin Dashboard gọi API
• Chẩn đoán: Trình duyệt báo lỗi "Access to XMLHttpRequest at API from origin has been blocked by CORS policy".
• Biện pháp xử lý: Cập nhật biến môi trường ALLOWED_ORIGINS trong tệp .env chứa đúng URL gốc của Frontend (bao gồm cả Port) -> Restart Container backend-api.

Sự cố 3: Đơn hàng SignalR không nhận được thông báo thời gian thực
• Chẩn đoán: Kết nối WebSocket bị ngắt hoặc rơi về Long-Polling.
• Biện pháp xử lý: Kiểm tra cấu hình Nginx Reverse Proxy xem đã có các Header hỗ trợ Upgrade WebSocket:
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "Upgrade";