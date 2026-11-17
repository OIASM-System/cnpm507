        # 🗄️ Database Design & Data Persistence (PostgreSQL & EF Core) - POS PWA Project

Thư mục này lưu trữ toàn bộ tài liệu thiết kế cơ sở dữ liệu quan hệ, quy chuẩn lập trình truy xuất dữ liệu (**Entity Framework Core**) và các cơ chế kiểm soát đồng thời (**Concurrency Control**) cho hệ thống **POS PWA (Point of Sale Progressive Web App)**. Hệ thống sử dụng **PostgreSQL 16** làm hệ quản trị cơ sở dữ liệu chính nhằm đảm bảo tính toàn vẹn giao dịch (**ACID**), tốc độ truy vấn danh mục sản phẩm cao và triệt tiêu tình trạng bán vượt quá số lượng tồn kho (**Anti-oversell**).

---

## 📂 Cấu trúc thư mục `04-database/`

```text
04-database/
├── README.md                    # Tổng quan kiến trúc lưu trữ dữ liệu & Công nghệ Database
├── postgresql.md                # Cấu hình PostgreSQL 16, kiểu dữ liệu & tối ưu hóa kết nối
├── entity-framework-core.md     # Quy chuẩn cấu hình EF Core 8 (Fluent API, Repositories, Unit of Work)
├── database-design.md           # Lược đồ quan hệ thực thể (ERD) & Từ điển dữ liệu (Data Dictionary)
├── database-indexing.md         # Chiến lược đánh chỉ mục (B-Tree, GIN, Composite Index)
├── database-transactions.md     # Quản lý giao dịch ACID & mức cô lập (Isolation Levels)
├── pessimistic-locking.md       # Khóa bi quan (SELECT ... FOR UPDATE) chống bán quá mức
├── optimistic-locking.md        # Khóa lạc quan (PostgreSQL xmin / Concurrency Token)
└── database-migrations.md       # Quy trình quản lý phiên bản lược đồ (EF Core Migrations & Seeding)
```

---

## 🛠️ Công nghệ & Thành phần cốt lõi (Database Tech Stack)

| Thành phần | Công nghệ / Phiên bản | Vai trò trong dự án POS PWA |
| :--- | :--- | :--- |
| **RDBMS** | **PostgreSQL 16** | Hệ quản trị cơ sở dữ liệu quan hệ chính, hỗ trợ khóa mức dòng (`Row-level Locking`) và MVCC. |
| **ORM** | **Entity Framework Core 8** | Ánh xạ đối tượng - quan hệ, theo dõi thay đổi (Change Tracking) và thực thi truy vấn LINQ. |
| **Database Provider** | **Npgsql.EntityFrameworkCore.PostgreSQL** | Trình điều khiển (Driver) hiệu năng cao kết nối trực tiếp .NET 8 với PostgreSQL. |
| **Naming Convention** | **EFCore.NamingConventions** | Tự động chuyển đổi tên bảng/cột từ `PascalCase` (C#) sang chuẩn `snake_case` (PostgreSQL). |
| **Migration Tool** | **dotnet ef migrations** | Quản lý lịch sử thay đổi cấu trúc bảng và khởi tạo dữ liệu mẫu (Data Seeding) nhất quán. |

---

## 🎯 Nguyên tắc thiết kế dữ liệu trọng tâm

1. **Đảm bảo tính toàn vẹn ACID tuyệt đối:** Mọi giao dịch chốt đơn tại quầy bao gồm tạo hóa đơn (`orders`), lưu chi tiết món (`order_details`), ghi nhận thanh toán (`payments`) và cập nhật tồn kho (`products`) phải thành công đồng bộ hoặc hoàn tác (`Rollback`) toàn bộ khi xảy ra lỗi.
2. **Triệt tiêu lỗi âm kho (Anti-Oversell Guarantee):** Kết hợp khóa dữ liệu ở mức cơ sở dữ liệu (`Pessimistic Locking` với `FOR UPDATE` hoặc `Optimistic Locking` với cột hệ thống `xmin`) cùng ràng buộc toàn vẹn `CHECK (stock_quantity >= 0)` trực tiếp trên bảng `products`.
3. **Tối ưu tốc độ phản hồi tại quầy ($< 50\text{ms}$):** Thiết kế chỉ mục (`Index`) chuyên biệt cho các thao tác diễn ra liên tục của thu ngân như quét mã vạch (`code`), tìm kiếm tên món (`name`), lọc theo danh mục (`category_id`) và tra cứu hóa đơn (`order_number`).

---
