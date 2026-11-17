# ⚡ Database Indexing Strategy - POS PWA Project

Tài liệu này quy định chiến lược đánh chỉ mục (**Indexing**) trên **PostgreSQL 16** cho hệ thống **POS PWA (Point of Sale Progressive Web App)**. Tại quầy thu ngân, các thao tác như quét mã vạch sản phẩm, lọc món theo danh mục, tra cứu hóa đơn và khóa dòng tồn kho diễn ra liên tục. Việc thiết kế đúng chỉ mục giúp loại bỏ tình trạng quét toàn bảng (`Sequential Scan`), đưa độ trễ truy vấn xuống dưới **$10\text{ms}$** và giảm thiểu phạm vi khóa dữ liệu khi giao dịch đồng thời.

---

## 🎯 1. Nguyên tắc thiết kế chỉ mục cốt lõi

1. **Quy tắc dẫn đầu bởi `tenant_id` (Multi-Tenant Prefix Rule):** Vì hệ thống vận hành theo kiến trúc SaaS dùng chung bảng (`Shared Schema`), mọi chỉ mục tìm kiếm đều bắt buộc đặt cột `tenant_id` ở vị trí đầu tiên để PostgreSQL khoanh vùng ngay lập tức dữ liệu của cửa hàng hiện tại.
2. **Tránh đánh Index dư thừa (Over-Indexing):** Bảng `orders`, `order_details` và `payments` có tần suất ghi (`INSERT`) rất cao tại quầy POS. Chỉ tạo Index cho các cột thực sự xuất hiện trong mệnh đề `WHERE`, `JOIN` hoặc `ORDER BY` nhằm tránh làm chậm giao dịch thanh toán.
3. **Chỉ mục hỗ trợ khóa mức dòng (Row-Level Locking Optimization):** Trong PostgreSQL, câu lệnh khóa bi quan `SELECT ... FOR UPDATE` chỉ khóa đúng các dòng cần thiết nếu có **Index** trên điều kiện lọc; nếu thiếu Index, PostgreSQL sẽ phải quét và khóa toàn bộ bảng, gây nghẽn cổ chai nghiêm trọng giữa các quầy thu ngân.

---

## 🗂️ 2. Danh mục chỉ mục chi tiết theo từng bảng

### 2.1. Bảng `products` (Tần suất đọc & khóa cập nhật cao nhất)

| Tên chỉ mục (Index Name) | Loại Index | Cột áp dụng | Mục đích & Tác động hiệu năng |
| :--- | :--- | :--- | :--- |
| `ux_products_tenant_id_code` | **Unique B-Tree** | `(tenant_id, code)` | Phục vụ thao tác **quét mã vạch / nhập mã SKU** tức thì ($O(\log n)$) và đảm bảo không trùng mã trong cùng cửa hàng. |
| `ix_products_tenant_id_category_id` | **Composite B-Tree** | `(tenant_id, category_id)` | Tối ưu thao tác bấm lọc danh mục món (*Cà phê*, *Trà sữa*...) trên màn hình cảm ứng POS. |
| `ix_products_tenant_id_name_trgm` | **GIN (`pg_trgm`)** | `name gin_trgm_ops` | Tăng tốc tìm kiếm mờ theo tên sản phẩm tiếng Việt (`ILIKE '%cà phê%'`) mà không cần quét toàn bảng. |
| `ix_products_active_partial` | **Partial B-Tree** | `(tenant_id, category_id) WHERE is_active = true` | Giảm kích thước Index bằng cách loại bỏ các sản phẩm đã ngừng kinh doanh khỏi cây chỉ mục bán hàng. |

### 2.2. Bảng `orders` & `order_details` (Tần suất ghi cao & Báo cáo doanh thu)

| Tên chỉ mục (Index Name) | Loại Index | Cột áp dụng | Mục đích & Tác động hiệu năng |
| :--- | :--- | :--- | :--- |
| `ux_orders_tenant_id_order_number` | **Unique B-Tree** | `(tenant_id, order_number)` | Đảm bảo mã hóa đơn (`ORD#...`) duy nhất và tăng tốc tra cứu hóa đơn khi khách yêu cầu hoàn tiền / in lại phiếu. |
| `ix_orders_tenant_id_created_at` | **Composite B-Tree** | `(tenant_id, created_at DESC)` | Tăng tốc hiển thị lịch sử giao dịch gần nhất và xuất báo cáo doanh thu theo khoảng thời gian (Ca / Ngày / Tháng). |
| `ix_orders_tenant_id_cashier_id` | **Composite B-Tree** | `(tenant_id, cashier_id)` | Phục vụ đối soát doanh thu theo từng nhân viên thu ngân lúc kết ca. |
| `ix_order_details_order_id` | **B-Tree** | `(order_id)` | **Bắt buộc** (PostgreSQL không tự tạo Index cho khóa ngoại), giúp tải nhanh danh sách món khi mở `Receipt Preview`. |
| `ix_order_details_product_id` | **B-Tree** | `(product_id)` | Tối ưu thống kê Top sản phẩm bán chạy và kiểm tra ràng buộc `ON DELETE RESTRICT`. |

---

## 💻 3. Mã nguồn SQL & Cấu hình EF Core Fluent API

### 3.1. Kích hoạt Extension `pg_trgm` và tạo Index nâng cao trong PostgreSQL
Đối với tính năng tìm kiếm gần đúng theo tên sản phẩm (`SearchProductsQuery`), hệ thống kích hoạt tiện ích mở rộng `pg_trgm` (Trigram) có sẵn trong PostgreSQL 16:

```sql
-- 1. Kích hoạt extension hỗ trợ tìm kiếm chuỗi con tốc độ cao
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Tạo GIN Index cho cột tên sản phẩm
CREATE INDEX ix_products_name_trgm 
ON products USING GIN (name gin_trgm_ops);

-- 3. Tạo Partial Index chỉ đánh chỉ mục cho các sản phẩm đang mở bán
CREATE INDEX ix_products_tenant_active_category 
ON products (tenant_id, category_id) 
WHERE is_active = true;
```

### 3.2. Cấu hình trong `ProductConfiguration.cs` (EF Core 8)
```csharp
public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        // Unique Composite Index cho mã SKU theo từng Tenant
        builder.HasIndex(p => new { p.TenantId, p.Code })
            .HasDatabaseName("ux_products_tenant_id_code")
            .IsUnique();

        // Partial Index cho danh mục sản phẩm đang hoạt động
        builder.HasIndex(p => new { p.TenantId, p.CategoryId })
            .HasDatabaseName("ix_products_tenant_active_category")
            .HasFilter("is_active = true");

        // GIN Index hỗ trợ tìm kiếm nhanh theo tên sản phẩm
        builder.HasIndex(p => p.Name)
            .HasDatabaseName("ix_products_name_trgm")
            .HasMethod("gin")
            .HasOperators("gin_trgm_ops");
    }
}
```

---

## 🔍 4. Quy chuẩn kiểm tra kế hoạch thực thi (`EXPLAIN ANALYZE`)

Trước khi đưa một truy vấn báo cáo hoặc tìm kiếm mới vào môi trường Production, lập trình viên bắt buộc kiểm tra bằng lệnh `EXPLAIN (ANALYZE, BUFFERS)`:

* **Đạt chuẩn:** Kế hoạch thực thi hiển thị `Index Scan` hoặc `Index Only Scan` hoặc `Bitmap Index Scan` với thời gian thực thi (`Execution Time`) **nhỏ hơn `10 ms`**.
* **Cần tối ưu lại:** Xuất hiện `Seq Scan on products` hoặc `Seq Scan on orders` trên tập dữ liệu lớn ($> 10,000$ bản ghi).

---
