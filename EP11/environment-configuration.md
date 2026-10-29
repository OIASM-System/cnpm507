# CẤU HÌNH BIẾN MÔI TRƯỜNG (ENVIRONMENT CONFIGURATION)

1. TỔNG QUAN
Tất cả các thông số cấu hình nhạy cảm và thông số phụ thuộc môi trường được lưu trữ trong tệp .env tại thư mục gốc và không được Commit lên kho mã nguồn Git.

2. DANH SÁCH BIẾN MÔI TRƯỜNG CHUẨN (.ENV)

Cấu hình chung hệ thống:
• ENVIRONMENT=Production
• SYSTEM_TIMEZONE=Asia/Ho_Chi_Minh

Cấu hình Cơ sở dữ liệu PostgreSQL:
• POSTGRES_DB=oism_db
• POSTGRES_USER=oism_admin
• POSTGRES_PASSWORD=SecurePassword_ChangeMe2026!
• POSTGRES_PORT=5432
• DB_CONNECTION_STRING=Host=postgres;Port=5432;Database=oism_db;Username=oism_admin;Password=SecurePassword_ChangeMe2026!;

Cấu hình Xác thực JWT & Security:
• JWT_SECRET_KEY=SuperSecretKeyForOISMJWTAuthentication2026_MinLength64Chars!
• JWT_ISSUER=OISM_Identity
• JWT_AUDIENCE=OISM_Clients
• JWT_EXPIRATION_MINUTES=60
• REFRESH_TOKEN_EXPIRATION_DAYS=7

Cấu hình Tác vụ ngầm & SignalR:
• HANGFIRE_DASHBOARD_USER=admin
• HANGFIRE_DASHBOARD_PASS=HangfirePass2026!

Cấu hình CORS & Domain Allowed:
• ALLOWED_ORIGINS=https://admin.oism.com,https://pos.oism.com