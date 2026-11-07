# Hướng dẫn Di trú Cơ sở dữ liệu — POS PWA

**Dự án:** Omnichannel Inventory and Sales Management System (OISM)  
**Cơ sở dữ liệu:** PostgreSQL  
**Nền tảng Backend:** .NET 8 Web API / Entity Framework Core 8  
**Kiến trúc:** Cơ sở dữ liệu dùng chung + schema dùng chung, đa khách hàng (`tenant_id`)  
**Trạng thái:** Tài liệu hướng dẫn triển khai. Nhóm cần xác nhận các trường schema đề xuất và cấu hình triển khai trước khi sử dụng thực tế.

## 1. Mục đích

Tài liệu này hướng dẫn nhóm thay đổi schema PostgreSQL một cách an toàn trong quá trình phát triển POS PWA. Mọi thay đổi schema phải được thể hiện bằng migration có kiểm duyệt và quản lý phiên bản. Không thực hiện thay đổi thủ công không được ghi nhận trên môi trường dùng chung.

Nội dung bao gồm quản lý phiên bản migration, lệnh EF Core, rà soát SQL, cập nhật dữ liệu cũ, cô lập Tenant/chi nhánh, triển khai, rollback và kiểm tra xác nhận.

## 2. Nền tảng cơ sở dữ liệu hiện tại

Các tài liệu cơ sở dữ liệu hiện tại mô tả:

- PostgreSQL với mô hình dùng chung cơ sở dữ liệu và schema.
- `tenant` là bảng tổ chức gốc; các bảng nghiệp vụ thuộc Tenant có `tenant_id`.
- Các bản ghi vận hành như đơn hàng và tồn kho được liên kết với `branch_id`.
- Các phân hệ hệ thống/RBAC, sản phẩm/giá, kho vận, bán hàng/thanh toán và thông báo.
- Khóa chính `BIGSERIAL`, khóa ngoại `BIGINT`, giá trị tiền tệ `DECIMAL`, mốc thời gian `TIMESTAMPTZ`.
- Khóa ngoại, ràng buộc theo Tenant và chỉ mục kết hợp.

**Quan trọng:** `database-schema.sql` là schema nền được đề xuất, tổng hợp từ từ điển dữ liệu và đặc tả bảng. Một số trường và bảng chi tiết hỗ trợ được suy luận trong trường hợp tài liệu đầu vào chưa mô tả đầy đủ. Cần xác nhận các nội dung này trước khi xem tập lệnh là schema chính thức của môi trường thực tế.

## 3. Nguyên tắc di trú

1. Quản lý phiên bản mọi thay đổi schema và dữ liệu.
2. Rà soát SQL PostgreSQL được sinh ra; không chỉ dựa vào mã migration C#.
3. Bảo toàn ranh giới `tenant_id` và quyền truy cập theo chi nhánh.
4. Ưu tiên thay đổi tương thích ngược để phiên bản ứng dụng cũ và mới có thể cùng hoạt động trong thời gian triển khai.
5. Sao lưu trước các thay đổi rủi ro cao trên môi trường thực tế và xác nhận quy trình phục hồi.
6. Kiểm thử với dung lượng dữ liệu thực tế; DDL chạy nhanh trên cơ sở dữ liệu nhỏ có thể khóa bảng lớn khi triển khai thật.
7. Không chỉnh sửa migration đã áp dụng trên môi trường dùng chung hoặc production. Tạo migration mới để sửa.
8. Tránh thay đổi phá hủy dữ liệu trong cùng bản phát hành với thay đổi ứng dụng; sử dụng chiến lược mở rộng rồi thu hẹp (expand-and-contract).
9. Xem đơn hàng, thanh toán, số dư tồn kho và giao dịch kho là dữ liệu nghiệp vụ có rủi ro cao.
10. Không để mọi instance API đang chạy tự ý thực hiện migration production khi khởi động.

## 4. Cấu trúc thư mục repository đề xuất

```text
database/
├── database-overview.md
├── database-conventions.md
├── data-dictionary.md
├── table-specifications.md
├── tenant-data-isolation.md
├── indexing-strategy.md
├── transaction-and-locking-strategy.md
├── backup-and-restore.md
├── database-schema.sql
└── database-migration-guide.md

src/
└── OISM.Infrastructure/
    └── Persistence/
        ├── AppDbContext.cs
        ├── Configurations/
        └── Migrations/
            ├── YYYYMMDDHHMMSS_Description.cs
            ├── YYYYMMDDHHMMSS_Description.Designer.cs
            └── AppDbContextModelSnapshot.cs
```

Điều chỉnh tên project và đường dẫn để phù hợp với solution thực tế.

## 5. Quy tắc đặt tên và lịch sử migration

Sử dụng tên migration EF Core có dấu thời gian và mô tả rõ ràng:

```text
YYYYMMDDHHMMSS_TenMoTaNgan
```

Ví dụ:

```text
202611070001_InitialSchema
20261108093000_AddCustomerLoyaltyPoints
20261109110000_AddInventoryBalanceVersion
20261110143000_AddOrderSearchIndex
```

Mặc định EF Core ghi nhận các migration đã áp dụng trong bảng `__EFMigrationsHistory`. Lưu các tệp migration và model snapshot trong hệ thống quản lý phiên bản. Không xóa hoặc chỉnh sửa thủ công các dòng lịch sử migration trong quy trình triển khai thông thường.

Khi nhiều lập trình viên cùng thay đổi mô hình dữ liệu, cần thống nhất người phụ trách migration để tránh xung đột lịch sử.

## 6. Tạo migration bằng EF Core 8

Cài đặt hoặc cập nhật công cụ dòng lệnh:

```bash
dotnet tool install --global dotnet-ef --version 8.*
# Nếu đã cài đặt:
dotnet tool update --global dotnet-ef --version 8.*
```

Tạo migration (điều chỉnh đường dẫn và tên DbContext theo solution):

```bash
dotnet ef migrations add AddInventoryBalanceVersion \
  --project src/OISM.Infrastructure \
  --startup-project src/OISM.WebAPI \
  --context AppDbContext \
  --output-dir Persistence/Migrations
```

Sinh SQL để rà soát:

```bash
dotnet ef migrations script \
  --project src/OISM.Infrastructure \
  --startup-project src/OISM.WebAPI \
  --context AppDbContext \
  --output migration-review.sql
```

Sinh tập lệnh giữa hai phiên bản migration:

```bash
dotnet ef migrations script PreviousMigration TargetMigration \
  --project src/OISM.Infrastructure \
  --startup-project src/OISM.WebAPI \
  --context AppDbContext \
  --output migration-range.sql
```

Sinh tập lệnh idempotent cho các môi trường có thể đang ở những phiên bản migration khác nhau:

```bash
dotnet ef migrations script --idempotent \
  --project src/OISM.Infrastructure \
  --startup-project src/OISM.WebAPI \
  --context AppDbContext \
  --output migration-idempotent.sql
```

Áp dụng migration cho cơ sở dữ liệu phát triển cục bộ:

```bash
dotnet ef database update \
  --project src/OISM.Infrastructure \
  --startup-project src/OISM.WebAPI \
  --context AppDbContext
```

Đối với staging và production, ưu tiên tệp SQL đã được rà soát và thực thi thông qua pipeline triển khai có kiểm soát hoặc người quản trị cơ sở dữ liệu.

## 7. Viết thao tác migration an toàn

### 7.1. Thêm cột cho phép NULL trước

```sql
ALTER TABLE app_user
ADD COLUMN display_name VARCHAR(150);
```

Triển khai mã ứng dụng tương thích, cập nhật dữ liệu hiện có, sau đó mới thêm `NOT NULL` nếu quy tắc nghiệp vụ yêu cầu.

### 7.2. Thêm cột có giá trị mặc định

```sql
ALTER TABLE inventory_balance
ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
```

Kiểm thử thời gian khóa và hành vi theo phiên bản PostgreSQL đang triển khai cũng như dung lượng bảng thực tế.

### 7.3. Thêm khóa ngoại cho bảng lớn

Có thể xác thực ràng buộc theo hai giai đoạn để giảm tác động khi kiểm tra toàn bộ dữ liệu lịch sử trong bước DDL ban đầu:

```sql
ALTER TABLE order_item
ADD CONSTRAINT fk_order_item_sku
FOREIGN KEY (tenant_id, sku_id)
REFERENCES sku (tenant_id, id)
NOT VALID;

ALTER TABLE order_item
VALIDATE CONSTRAINT fk_order_item_sku;
```

Khóa duy nhất kết hợp được tham chiếu phải tồn tại và toàn bộ dữ liệu lịch sử phải thỏa mãn quan hệ trước khi xác thực thành công.

### 7.4. Thêm chỉ mục cho bảng có tải ghi cao

Với PostgreSQL đang phục vụ thật, cân nhắc:

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS
idx_order_tenant_branch_created
ON "order" (tenant_id, branch_id, created_at DESC);
```

`CREATE INDEX CONCURRENTLY` không thể chạy bên trong transaction block. Kiểm tra migration runner có tự động bọc migration trong transaction hay không và cấu hình riêng thao tác này. Nếu quá trình tạo chỉ mục đồng thời thất bại, hãy kiểm tra chỉ mục ở trạng thái không hợp lệ trước khi thử lại.

## 8. Chiến lược triển khai mở rộng rồi thu hẹp (Expand-and-Contract)

Dùng chiến lược này cho các thay đổi có thể ảnh hưởng đến tính tương thích của ứng dụng. Ví dụ: thay thế một cột.

1. **Mở rộng:** Thêm cột mới, chưa xóa cột cũ.
2. **Ghi kép:** Tạm thời ghi vào cả hai cột nếu cần.
3. **Cập nhật dữ liệu cũ:** Sao chép giá trị theo từng đợt có kiểm soát.
4. **Chuyển đọc:** Triển khai mã ứng dụng đọc cột mới.
5. **Theo dõi:** Xác nhận tất cả API instance và tác vụ nền đã chuyển sang dùng cột mới.
6. **Thu hẹp:** Xóa cột cũ trong một bản phát hành sau, khi đã xác nhận không còn nơi sử dụng.

Không đổi tên hoặc xóa cột ngay khi phiên bản ứng dụng cũ vẫn có thể truy vấn cột đó.

## 9. Di trú dữ liệu và cập nhật dữ liệu cũ (Backfill)

Di trú dữ liệu là thao tác thay đổi các bản ghi hiện có, không chỉ thay đổi cấu trúc bảng.

- Xác định rõ giá trị nguồn và giá trị đích.
- Giới hạn cập nhật theo `tenant_id` và, khi phù hợp, `branch_id`.
- Xử lý tập dữ liệu lớn theo từng đợt để giới hạn thời gian khóa, thời lượng transaction và mức tăng WAL.
- Thiết kế tập lệnh có thể tiếp tục an toàn sau khi bị gián đoạn; dùng điều kiện xác định và tránh chèn trùng.
- Ghi nhận số lượng bản ghi trước/sau và kiểm tra các bản ghi đại diện ở nhiều Tenant, chi nhánh.
- Không tự tạo dữ liệu khách hàng, thanh toán, đơn hàng hoặc tồn kho còn thiếu.

Ví dụ cập nhật có phạm vi Tenant:

```sql
UPDATE app_user
SET is_active = TRUE
WHERE tenant_id = :tenant_id
  AND is_active IS NULL;
```

Ví dụ này chỉ phù hợp với schema cũ trong đó `is_active` cho phép NULL; schema đề xuất hiện tại định nghĩa cột này là `NOT NULL DEFAULT TRUE`.

Với backfill lớn, nên dùng job hoặc tập lệnh có kiểm soát và ghi nhận tiến độ thay vì một migration chạy lâu khi ứng dụng khởi động.

## 10. Yêu cầu đối với Multi-Tenant và chi nhánh

Trước khi duyệt migration, kiểm tra:

- Mỗi bảng mới thuộc Tenant có `tenant_id`.
- Các dòng hiện có được gán đúng Tenant trong quá trình backfill.
- Có unique constraint và index theo Tenant khi cần.
- Khóa ngoại ngăn tham chiếu chéo giữa các Tenant.
- Truy vấn và phép JOIN tiếp tục giới hạn theo Tenant.
- Quyền truy cập theo chi nhánh vẫn được áp dụng cho dữ liệu vận hành.
- Dữ liệu seed/reference được tạo cho đúng Tenant.
- Rollback không trộn lẫn hoặc làm lộ dữ liệu Tenant.

Ưu tiên khóa ngoại kết hợp theo Tenant:

```sql
FOREIGN KEY (tenant_id, branch_id)
REFERENCES branch (tenant_id, id)
```

Bảng được tham chiếu phải có unique constraint tương ứng. Ứng dụng vẫn phải kiểm tra quyền Tenant và chi nhánh; migration không tự bảo vệ các API endpoint.

## 11. Biện pháp bảo vệ giao dịch POS và tồn kho

Rà soát các thay đổi theo `transaction-and-locking-strategy.md`:

- Đảm bảo các thao tác ghi khi thanh toán được thực hiện nguyên tử theo quy trình nghiệp vụ.
- Duy trì `SELECT ... FOR UPDATE` đối với các dòng tồn kho cần khóa bi quan.
- Khóa các dòng theo thứ tự nhất quán để giảm deadlock.
- Không sửa hoặc xóa lịch sử giao dịch kho như một cách điều chỉnh thông thường; sử dụng giao dịch điều chỉnh có thể kiểm toán.
- Bảo toàn quy tắc đối chiếu đơn hàng và thanh toán.
- Dùng cơ chế idempotency cho yêu cầu có thể được gửi lại từ thiết bị ngoại tuyến.
- Kiểm thử lại thanh toán đồng thời và cập nhật tồn kho sau khi thay đổi schema hoặc index liên quan.

## 12. Rollback và phục hồi

### 12.1. Rollback trong môi trường phát triển

Đưa cơ sở dữ liệu cục bộ về migration trước đó:

```bash
dotnet ef database update PreviousMigration \
  --project src/OISM.Infrastructure \
  --startup-project src/OISM.WebAPI \
  --context AppDbContext
```

Chỉ xóa migration mới nhất nếu migration đó **chưa được áp dụng** vào cơ sở dữ liệu:

```bash
dotnet ef migrations remove \
  --project src/OISM.Infrastructure \
  --startup-project src/OISM.WebAPI \
  --context AppDbContext
```

Không dùng `migrations remove` để xóa migration đã triển khai trên môi trường dùng chung.

### 12.2. Phục hồi môi trường production

Hạ phiên bản schema không phải lúc nào cũng an toàn; thao tác này có thể làm mất dữ liệu hoặc không tương thích với ứng dụng đang chạy. Khi có sự cố:

1. Dừng hoặc hạn chế ghi dữ liệu nếu tính toàn vẹn đang bị đe dọa.
2. Xác định phiên bản ứng dụng và phiên bản migration của cơ sở dữ liệu.
3. Đánh giá bản sửa tiến (forward fix) có an toàn hơn hạ phiên bản hay không.
4. Nếu dữ liệu bị mất/hỏng, thực hiện theo `backup-and-restore.md` và chọn điểm khôi phục được phê duyệt.
5. Đối chiếu giao dịch phát sinh sau điểm khôi phục, bao gồm hàng đợi POS ngoại tuyến.
6. Kiểm tra cô lập Tenant, tính nhất quán đơn hàng/thanh toán và số dư tồn kho.
7. Chỉ khôi phục lưu lượng hoạt động bình thường sau khi được phê duyệt.

Kiểm thử phương thức downgrade và quy trình khôi phục trong môi trường thử nghiệm riêng. Bản sao lưu không thay thế cho kế hoạch phục hồi đã được kiểm thử.

## 13. Danh sách kiểm thử

### Trước khi merge

- [ ] Migration build thành công và SQL sinh ra đã được rà soát.
- [ ] PK, FK, unique, check constraint và index chính xác.
- [ ] Dữ liệu hiện có được bảo toàn hoặc chuyển đổi bằng backfill rõ ràng.
- [ ] Cô lập Tenant và chi nhánh được giữ nguyên.
- [ ] Không có cascade delete ngoài ý muốn làm mất lịch sử giao dịch.
- [ ] Đường nâng cấp từ phiên bản schema được hỗ trợ trước đó hoạt động.
- [ ] Phương án rollback hoặc phục hồi tiến được ghi lại.

### Trước khi triển khai staging / production

- [ ] Bản sao lưu gần nhất đã hoàn tất thành công.
- [ ] Đã xác định điểm khôi phục và quy trình restore.
- [ ] Migration đã được kiểm thử trên bản sao staging có dung lượng dữ liệu đại diện.
- [ ] Thời gian khóa và tác động đến dung lượng lưu trữ đã được rà soát.
- [ ] Tính tương thích giữa phiên bản ứng dụng cũ/mới đã được kiểm thử.
- [ ] Các kiểm thử nhanh thanh toán, thanh toán tiền, tồn kho và tra cứu barcode thành công.
- [ ] Tenant A không thể truy cập dữ liệu Tenant B.
- [ ] Người dùng bị giới hạn chi nhánh không thể truy cập chi nhánh ngoài quyền.
- [ ] Có giám sát và người phụ trách liên hệ trong thời gian triển khai.

### Sau khi triển khai

- [ ] `__EFMigrationsHistory` ghi nhận đúng phiên bản.
- [ ] Kiểm tra tình trạng ứng dụng thành công.
- [ ] Không xuất hiện lỗi cơ sở dữ liệu hoặc serialization lặp lại.
- [ ] Index mới hợp lệ và hiệu năng truy vấn chấp nhận được.
- [ ] Kiểm tra đối chiếu đơn hàng/thanh toán và tồn kho thành công.
- [ ] Tác vụ nền và đồng bộ ngoại tuyến hoạt động an toàn trở lại.

## 14. Quy trình triển khai đề xuất

```text
Cập nhật Entity và cấu hình EF Core
                 |
                 v
       Tạo migration + model snapshot
                 |
                 v
        Rà soát mã migration và SQL
                 |
                 v
       Chạy kiểm thử tự động và DB cục bộ
                 |
                 v
 Triển khai staging; kiểm thử POS và cô lập Tenant
                 |
                 v
   Phê duyệt production; xác minh bản sao lưu
                 |
                 v
       Áp dụng migration SQL đã rà soát
                 |
                 v
     Triển khai phiên bản ứng dụng tương thích
                 |
                 v
       Kiểm thử nhanh, giám sát và xác nhận
```

Với thay đổi rủi ro cao, cần lên lịch bảo trì hoặc tạm hạn chế các nghiệp vụ bị ảnh hưởng. Phối hợp triển khai cơ sở dữ liệu và ứng dụng để phiên bản cũ và mới vẫn tương thích trong thời gian cập nhật luân phiên.

## 15. Trách nhiệm

| Vai trò | Trách nhiệm |
|---|---|
| Lập trình viên Backend | Cập nhật Entity/cấu hình EF Core và tạo migration |
| Người rà soát Cơ sở dữ liệu | Kiểm tra SQL, constraint, index, khóa và hiệu năng |
| QA | Kiểm thử nâng cấp, nghiệp vụ, cô lập Tenant và hồi quy |
| DevOps / Phụ trách phát hành | Xác minh sao lưu, thực hiện triển khai, giám sát và duy trì khả năng phục hồi |
| Chủ sở hữu sản phẩm / dự án | Phê duyệt thay đổi dữ liệu ảnh hưởng nghiệp vụ và phát hành production |

## 16. Tài liệu liên quan

- `database-overview.md` — kiến trúc và các phân hệ cơ sở dữ liệu.
- `database-conventions.md` — quy ước đặt tên và kiểu dữ liệu.
- `data-dictionary.md` — danh sách thực thể theo phân hệ nghiệp vụ.
- `table-specifications.md` — trường dữ liệu và quy tắc nghiệp vụ của các bảng đã đặc tả.
- `tenant-data-isolation.md` — cơ chế cô lập Tenant và chi nhánh.
- `indexing-strategy.md` — thiết kế chỉ mục.
- `transaction-and-locking-strategy.md` — mức cô lập giao dịch, khóa và phòng tránh deadlock.
- `database-schema.sql` — schema PostgreSQL nền được đề xuất.
- `backup-and-restore.md` — quy trình sao lưu, PITR và khôi phục.

## 17. Các quyết định cần xác nhận trước production

Nhóm cần xác nhận rõ:

1. EF Core migrations hay các tập lệnh SQL đã rà soát sẽ là nguồn chuẩn duy nhất để triển khai schema.
2. Phiên bản PostgreSQL chính xác và môi trường lưu trữ.
3. RPO, RTO, thời hạn lưu bản sao lưu và chính sách bảo trì đã được phê duyệt.
4. Các trường và bảng chi tiết hỗ trợ nào trong `database-schema.sql` đã được chấp thuận.
5. Mã SKU và barcode cần duy nhất theo Tenant hay trên toàn hệ thống.
6. Hành vi xóa/cập nhật cần thiết cho từng khóa ngoại, đặc biệt với dữ liệu giao dịch.
7. Có sử dụng PostgreSQL Row-Level Security (RLS) như một lớp bảo vệ bổ sung hay không.
8. Mô hình idempotency/thao tác ngoại tuyến cuối cùng và quy trình đối chiếu sau PITR.

Không đánh dấu quy trình migration là sẵn sàng cho production cho đến khi các quyết định trên, pipeline triển khai và một lần diễn tập khôi phục được rà soát, phê duyệt.
