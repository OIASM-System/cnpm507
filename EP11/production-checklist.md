# DANH MỤC KIỂM TRA TRƯỚC KHU LÊN PRODUCTION (PRODUCTION CHECKLIST)

1. MỤC TIÊU
Danh mục này bắt buộc phải được nghiệm thu 100% trước khi chính thức mở cổng truy cập dịch vụ cho người dùng cuối.

2. DANH SÁCH MỤC KIỂM TRA (CHECKLIST)

Bảo mật & Phân quyền:
• Thay đổi toàn bộ Mật khẩu mặc định (PostgreSQL, JWT Secret Key, Admin User, Hangfire).
• Kích hoạt Chứng chỉ SSL/TLS (HTTPS) trên Nginx cho tất cả tên miền API, Admin và POS PWA.
• Kiểm tra cấu hình CORS chỉ cho phép các Domain hợp lệ truy cập API.
• Đảm bảo EF Core Global Query Filters được bật để cô lập dữ liệu Multi-tenant.

Cơ sở dữ liệu & Dữ liệu:
• Chạy hoàn tất toàn bộ các bản Migration cơ sở dữ liệu (EF Core Migrations).
• Đã chạy script Seed dữ liệu vai trò mặc định (Default Roles) và tài khoản Quản trị hệ thống.
• Lập lịch tự động Sao lưu (Backup) cơ sở dữ liệu hàng ngày.

Hiệu năng & Vận hành:
• Bật cơ chế Caching cho các API danh mục sản phẩm và SKU.
• Kiểm tra giới hạn Tải tệp lên và Rate Limiting chống tấn công DDoS.
• Đảm bảo các chỉ mục (Indexes) trên bảng InventoryLedger và Orders đã được khởi tạo đầy đủ.