# 🐘 PostgreSQL 16 Architecture & Configuration - POS PWA Project

Tài liệu này quy định các tiêu chuẩn thiết kế, cấu hình máy chủ **PostgreSQL 16**, quy ước đặt tên đối tượng cơ sở dữ liệu, chuẩn ánh xạ kiểu dữ liệu với **.NET 8 (C#)** và cơ chế quản lý **Connection Pooling** cho hệ thống **POS PWA (Point of Sale Progressive Web App)**.

---

## 📏 1. Quy ước đặt tên (PostgreSQL Naming Conventions)

Mặc định C# sử dụng `PascalCase` (`OrderDetails`, `StockQuantity`), trong khi PostgreSQL tự động chuyển các định danh không đặt trong ngoặc kép sang chữ thường. Để tránh phải bọc dấu ngoặc kép (`"OrderDetails"`) khi viết truy vấn SQL thủ công (như khóa bi quan `FOR UPDATE`), dự án thống nhất chuẩn **`snake_case` toàn bộ**:

| Đối tượng Database | Quy chuẩn đặt tên | Ví dụ thực tế trong POS PWA |
| :--- | :--- | :--- |
| **Tên bảng (Table)** | `snake_case`, danh từ số nhiều | `users`, `categories`, `products`, `orders`, `order_details`, `payments` |
| **Tên cột (Column)** | `snake_case`, danh từ số ít | `order_number`, `unit_price`, `stock_quantity`, `created_at` |
| **Khóa chính (Primary Key)** | `pk_{table_name}` | `pk_orders`, `pk_products` |
| **Khóa ngoại (Foreign Key)** | `fk_{table}_{referenced_table}` | `fk_orders_users_cashier_id`, `fk_order_details_products_product_id` |
| **Chỉ mục (Index)** | `ix_{table}_{column(s)}` | `ix_products_category_id`, `ix_orders_created_at` |
| **Ràng buộc duy nhất (Unique)** | `ux_{table}_{column(s)}` | `ux_products_code`, `ux_orders_order_number` |
| **Ràng buộc kiểm tra (Check)** | `ck_{table}_{rule_name}` | `ck_products_stock_quantity_non_negative` |

> **Ghi chú kỹ thuật:** Hệ thống sử dụng gói NuGet **`EFCore.NamingConventions`** (`.UseSnakeCaseNamingConvention()`) trong `AppDbContext` để tự động chuyển đổi toàn bộ tên bảng, cột và khóa sang chuẩn `snake_case` nhất quán.

---

## 🧬 2. Chuẩn ánh xạ kiểu dữ liệu (C# .NET 8 $\leftrightarrow$ PostgreSQL 16)

Việc lựa chọn đúng kiểu dữ liệu giúp tối ưu dung lượng lưu trữ, tăng tốc độ quét Index và loại bỏ hoàn toàn sai số làm tròn tài chính tại quầy thu ngân:

| Mục đích sử dụng | Kiểu dữ liệu C# (.NET 8) | Kiểu dữ liệu PostgreSQL | Giải thích & Lưu ý triển khai |
| :--- | :--- | :--- | :--- |
| **Khóa chính / Khóa ngoại** | `Guid` | `uuid` | Khởi tạo từ tầng Application (`Guid.NewGuid()`) giúp hỗ trợ đồng bộ đơn Offline PWA không trùng ID. |
| **Tiền tệ (Giá bán, Tổng tiền)** | `decimal` | `numeric(18, 2)` | **Bắt buộc** dùng `numeric(18, 2)` để tính toán tiền tệ chính xác tuyệt đối, cấm dùng `real` hoặc `double precision`. |
| **Số lượng tồn kho / Mua** | `int` | `integer` (4 bytes) | Đủ lưu trữ lên đến ~2.14 tỷ đơn vị; kết hợp ràng buộc `CHECK (stock_quantity >= 0)`. |
| **Mã SKU / Mã hóa đơn** | `string` | `varchar(50)` | Giới hạn độ dài cố định giúp tối ưu B-Tree Index cho thao tác quét mã vạch. |
| **Tên sản phẩm / Danh mục** | `string` | `varchar(200)` | Hỗ trợ đầy đủ bảng mã tiếng Việt có dấu (`UTF-8`). |
| **Trạng thái / Phương thức** | `enum` | `varchar(30)` | Lưu dạng chuỗi mô tả (`'Completed'`, `'Cash'`) giúp dễ đọc trực tiếp khi truy vấn SQL báo cáo. |
| **Mốc thời gian giao dịch** | `DateTime` (UTC) | `timestamp with time zone` (`timestamptz`) | Lưu trữ chuẩn giờ quốc tế UTC; trình điều khiển Npgsql yêu cầu `DateTime.Kind == DateTimeKind.Utc`. |
| **Dữ liệu mở rộng / Metadata** | `JsonDocument` / `string` | `jsonb` | Lưu trữ phản hồi từ cổng thanh toán VietQR hoặc cấu hình mẫu in nhiệt POS. |
| **Phiên bản đồng thời** | `uint` | `xid` (cột hệ thống `xmin`) | Cột ẩn có sẵn trên mọi bảng PostgreSQL, dùng làm Concurrency Token tự động không tốn thêm dung lượng. |

---

## ⚙️ 3. Tối ưu hóa kết nối & Cấu hình hiệu năng (Connection Pooling)

### 3.1. Chuỗi kết nối chuẩn (Connection String)
Trong tệp `appsettings.json`, chuỗi kết nối Npgsql được tinh chỉnh các tham số **Connection Pooling** để tái sử dụng kết nối vật lý, giảm độ trễ khởi tạo TLS/TCP khi nhiều thu ngân thao tác đồng thời:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=postgres-db;Port=5432;Database=pos_pwa_db;Username=pos_admin;Password=YourStrongPassword!;Pooling=true;Minimum Pool Size=5;Maximum Pool Size=100;Connection Idle Lifetime=300;Timeout=15;Command Timeout=30;"
  }
}
```

* **`Pooling=true`:** Bật tính năng tái sử dụng kết nối trong bộ nhớ của Npgsql.
* **`Minimum Pool Size=5` & `Maximum Pool Size=100`:** Duy trì sẵn 5 kết nối mở để phản hồi tức thì cho giao dịch đầu tiên, và giới hạn tối đa 100 kết nối đồng thời tránh làm quá tải RAM của PostgreSQL Container.
* **`Command Timeout=30`:** Tự động ngắt các câu lệnh truy vấn bị treo quá 30 giây để giải phóng khóa giao dịch (`Row Lock`).

### 3.2. Cấu hình tham số máy chủ PostgreSQL (`postgresql.conf`)
Khi triển khai trên Docker Container cho môi trường Production/Staging, các tham số cốt lõi được tinh chỉnh như sau:
* `timezone = 'UTC'`: Đồng bộ múi giờ máy chủ về chuẩn quốc tế UTC.
* `shared_buffers = '256MB'` (hoặc 25% tổng RAM container): Vùng nhớ đệm chứa các trang dữ liệu của bảng `products` và `orders` thường xuyên truy cập.
* `work_mem = '16MB'`: Tối ưu bộ nhớ cho các truy vấn sắp xếp (`ORDER BY`) và gom nhóm (`GROUP BY`) khi xuất báo cáo doanh thu cuối ngày.
* `deadlock_timeout = '1s'`: Phát hiện sớm tình trạng khóa chéo (Deadlock) nếu hai thu ngân thanh toán cùng giỏ hàng chứa nhiều sản phẩm trùng nhau theo thứ tự ngược nhau.

---

## 🛡️ 4. Ràng buộc toàn vẹn mức cơ sở dữ liệu (Database-Level Constraints)

Ngoài lớp bảo vệ ở tầng `Domain` (C#), PostgreSQL đóng vai trò **chốt chặn bảo vệ cuối cùng** bằng các ràng buộc kiểm tra (`CHECK Constraints`) trực tiếp trên bảng:

```sql
-- Đảm bảo tồn kho không bao giờ âm ngay cả khi có truy vấn SQL trực tiếp
ALTER TABLE products
ADD CONSTRAINT ck_products_stock_quantity_non_negative CHECK (stock_quantity >= 0);

-- Đảm bảo đơn giá bán và tổng tiền đơn hàng không âm
ALTER TABLE products
ADD CONSTRAINT ck_products_price_non_negative CHECK (price >= 0);

ALTER TABLE orders
ADD CONSTRAINT ck_orders_total_amount_non_negative CHECK (total_amount >= 0);
```

---
