# Chiến lược Sao lưu và Khôi phục — POS PWA

**Dự án:** Omnichannel / POS PWA đa chi nhánh  
**Cơ sở dữ liệu:** PostgreSQL  
**Kiến trúc:** Cơ sở dữ liệu dùng chung + lược đồ dùng chung, đa khách hàng (`tenant_id`)  
**Trạng thái:** Tài liệu cơ sở đề xuất triển khai — các thông số vận hành phải được phê duyệt trước khi đưa vào môi trường thực tế.

## 1. Mục đích và phạm vi

Tài liệu này quy định phương án sao lưu, khôi phục và phục hồi cơ sở dữ liệu PostgreSQL của POS PWA. Nội dung bao gồm:

- Sao lưu logic để dễ di chuyển và tạo bản chụp dữ liệu tại một thời điểm.
- Sao lưu vật lý và lưu trữ WAL để phục hồi sau thảm họa.
- Kiểm tra tính hợp lệ của bản sao lưu và thử nghiệm khôi phục.
- Xử lý dữ liệu theo Tenant và ảnh hưởng của các thiết bị POS hoạt động ngoại tuyến.
- Bảo mật, thời hạn lưu trữ, giám sát và trách nhiệm vận hành.

Cơ sở dữ liệu lưu trữ thông tin Tenant và chi nhánh, người dùng và RBAC, danh mục sản phẩm và giá, số dư tồn kho và lịch sử biến động, phiếu nhập/chuyển/kiểm kê, khách hàng, đơn hàng, thanh toán và thông báo.

## 2. Mục tiêu phục hồi

Các giá trị dưới đây là **mục tiêu khởi đầu được đề xuất**, không phải yêu cầu đã được xác nhận trong các tài liệu đặc tả. Chủ sở hữu sản phẩm và nhóm vận hành cần phê duyệt.

| Chỉ số | Mục tiêu đề xuất | Ý nghĩa |
|---|---:|---|
| RPO (Mục tiêu điểm khôi phục) | 15 phút | Khoảng mất dữ liệu tối đa mục tiêu khi lưu trữ WAL hoạt động bình thường |
| RTO (Mục tiêu thời gian khôi phục) | 4 giờ | Thời gian mục tiêu để khôi phục dịch vụ sau sự cố cấp cơ sở dữ liệu |
| Tần suất sao lưu logic | Hằng ngày | Tạo bản sao logic đầy đủ để dễ di chuyển và khôi phục chọn lọc |
| Tần suất lưu trữ WAL | Liên tục | Hỗ trợ khôi phục tại một thời điểm cụ thể (PITR) |
| Diễn tập khôi phục | Hằng quý | Xác minh bản sao lưu thực sự có thể khôi phục |

Một tác vụ sao lưu báo thành công không đồng nghĩa với việc dữ liệu chắc chắn khôi phục được. Chỉ khi khôi phục và kiểm tra thành công mới có thể xác nhận khả năng phục hồi.

## 3. Chiến lược sao lưu

### 3.1. Sao lưu logic

Sử dụng `pg_dump` của PostgreSQL ở định dạng custom để tạo bản sao lưu nhất quán. Lưu tệp sao lưu bên ngoài máy chủ cơ sở dữ liệu.

Ví dụ:

```bash
# Chạy bằng tệp .pgpass được bảo vệ hoặc cơ chế quản lý bí mật khác.
pg_dump \
  --host="$PGHOST" \
  --port="${PGPORT:-5432}" \
  --username="$PGUSER" \
  --format=custom \
  --no-owner \
  --file="pos_pwa_$(date -u +%Y%m%dT%H%M%SZ).dump" \
  "$PGDATABASE"
```

Khi cần, xuất riêng các đối tượng toàn cục (ví dụ: vai trò và tablespace):

```bash
pg_dumpall --host="$PGHOST" --username="$PGUSER" --globals-only \
  > "postgres_globals_$(date -u +%Y%m%dT%H%M%SZ).sql"
```

Tệp xuất các đối tượng toàn cục có thể chứa thông tin nhạy cảm về vai trò. Hạn chế quyền truy cập và không lưu mật khẩu dạng văn bản thuần trong tập lệnh hoặc nhật ký.

### 3.2. Sao lưu vật lý và khôi phục tại một thời điểm (PITR)

Với môi trường thực tế cần RPO ngắn, sử dụng phương thức sao lưu vật lý được PostgreSQL hỗ trợ (ví dụ: `pg_basebackup` hoặc công cụ quản lý sao lưu), kết hợp lưu trữ WAL liên tục.

Ví dụ cấu hình trong `postgresql.conf` (đường dẫn và giá trị tùy môi trường triển khai):

```conf
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /secure/wal_archive/%f && cp %p /secure/wal_archive/%f'
```

Lệnh `archive_command` trên chỉ mang tính minh họa. Khi triển khai thực tế, cần dùng đích lưu trữ bền vững, xử lý an toàn khi thử lại, giám sát lỗi lưu trữ và ưu tiên công cụ sao lưu được quản lý hoặc tích hợp object storage. Không xem thư mục nằm trên cùng ổ đĩa với máy chủ là phương án phục hồi sau thảm họa.

Một chuỗi PITR có thể khôi phục cần:
1. Một bản sao lưu nền (base backup) hợp lệ.
2. Tất cả phân đoạn WAL cần thiết từ bản sao lưu nền đến thời điểm khôi phục.
3. Cấu hình PostgreSQL và thông tin tablespace cần thiết.
4. Quy trình khôi phục đã được kiểm thử.

### 3.3. Lịch sao lưu và thời hạn lưu trữ

Đề xuất ban đầu:

| Thành phần sao lưu | Tần suất | Thời hạn lưu |
|---|---|---|
| Bản sao logic định dạng custom | Hằng ngày | 14 bản theo ngày |
| Bản sao logic hằng tuần | Hằng tuần | 8 bản theo tuần |
| Bản lưu trữ hằng tháng | Hằng tháng | 12 bản theo tháng |
| Sao lưu nền vật lý | Hằng tuần hoặc theo chính sách công cụ sao lưu | Ít nhất 4 thế hệ sao lưu thành công |
| Kho WAL | Liên tục | Ít nhất 14 ngày, tùy dung lượng và yêu cầu tuân thủ |

Khi khả thi, áp dụng nguyên tắc 3-2-1: có ít nhất 3 bản sao, trên 2 loại phương tiện lưu trữ khác nhau, trong đó 1 bản ở ngoài địa điểm hoặc miền sự cố riêng biệt. Thời hạn lưu trữ cần phù hợp với yêu cầu pháp lý, quyền riêng tư và nghiệp vụ.

## 4. Bảo mật bản sao lưu

- Mã hóa bản sao lưu khi truyền và khi lưu trữ. Sử dụng khóa được quản lý hoặc quy trình quản lý khóa có kiểm soát.
- Lưu thông tin xác thực cơ sở dữ liệu trong hệ thống quản lý bí mật hoặc tài khoản dịch vụ được bảo vệ; không commit vào Git.
- Chỉ cấp quyền đọc/ghi/xóa bản sao lưu cho tài khoản dịch vụ và quản trị viên được chỉ định.
- Tách quyền truy cập bản sao lưu môi trường thực tế khỏi tài khoản ứng dụng thông thường.
- Ghi nhận thời gian bắt đầu/kết thúc, định danh cơ sở dữ liệu, loại sao lưu, dung lượng, mã kiểm tra (checksum) và kết quả tác vụ.
- Không ghi dữ liệu khách hàng/thanh toán vào nhật ký gỡ lỗi. Áp dụng cho bản sao lưu mức bảo vệ tương đương dữ liệu sản xuất.
- Kiểm thử khả năng khôi phục khóa trong diễn tập khôi phục; bản sao lưu mã hóa sẽ không sử dụng được nếu mất khóa.

## 5. Quy trình khôi phục

### 5.1. Khôi phục bản sao logic vào cơ sở dữ liệu mới

Ưu tiên khôi phục vào một cơ sở dữ liệu mới, kiểm tra dữ liệu, sau đó mới chuyển ứng dụng sang sử dụng.

```bash
createdb --host="$PGHOST" --username="$PGUSER" pos_pwa_restore_test

pg_restore \
  --host="$PGHOST" \
  --username="$PGUSER" \
  --dbname=pos_pwa_restore_test \
  --no-owner \
  --verbose \
  "pos_pwa_YYYYMMDDTHHMMSSZ.dump"
```

Nếu cần vai trò hoặc extension, hãy tạo trước bằng quy trình hạ tầng đã được phê duyệt. Kiểm tra quyền sở hữu và quyền truy cập trước khi kết nối ứng dụng với cơ sở dữ liệu đã khôi phục.

### 5.2. Khôi phục từ tệp xuất SQL

```bash
createdb --host="$PGHOST" --username="$PGUSER" pos_pwa_restore_test

psql \
  --host="$PGHOST" \
  --username="$PGUSER" \
  --dbname=pos_pwa_restore_test \
  --set=ON_ERROR_STOP=on \
  --file="backup.sql"
```

### 5.3. Khôi phục tại một thời điểm cụ thể (PITR)

Quy trình tổng quát; lệnh chính xác phụ thuộc công cụ sao lưu và phiên bản PostgreSQL:

1. Dừng ghi dữ liệu từ ứng dụng và cô lập máy chủ cơ sở dữ liệu gặp sự cố.
2. Cấp phát máy chủ PostgreSQL sạch, tương thích phiên bản chính.
3. Khôi phục bản sao lưu nền vật lý hợp lệ gần nhất.
4. Cấu hình truy xuất WAL từ kho lưu trữ an toàn.
5. Thiết lập điểm khôi phục (thời gian, giao dịch hoặc restore point có tên) theo cấu hình phục hồi được phiên bản PostgreSQL đang cài đặt hỗ trợ.
6. Khởi động PostgreSQL và xác minh quá trình phục hồi kết thúc đúng điểm mong muốn.
7. Kiểm tra tính toàn vẹn cơ sở dữ liệu và các quy tắc nghiệp vụ ở cấp ứng dụng.
8. Chỉ chuyển ứng dụng sang máy chủ đã khôi phục sau khi được phê duyệt.
9. Giữ lại máy chủ gặp sự cố và nhật ký để điều tra.

Không ghi đè bản sao lưu tốt duy nhất hoặc chuỗi WAL có thể phục hồi trong quá trình xử lý sự cố.

## 6. Danh sách kiểm tra sau khôi phục

- [ ] PostgreSQL khởi động thành công, không có lỗi phục hồi.
- [ ] Có đầy đủ schema, bảng, sequence, index, constraint và extension cần thiết.
- [ ] Các ràng buộc khóa chính và khóa ngoại hợp lệ.
- [ ] Có đầy đủ dữ liệu Tenant và chi nhánh.
- [ ] Truy vấn theo Tenant chỉ trả về dữ liệu của Tenant đã xác thực.
- [ ] Người dùng bị giới hạn theo chi nhánh không thể đọc hoặc sửa dữ liệu ngoài quyền.
- [ ] Mã SKU và barcode khác NULL vẫn đảm bảo tính duy nhất.
- [ ] Số dư tồn kho đối chiếu được với lịch sử giao dịch kho theo quy tắc của ứng dụng.
- [ ] Tổng tiền đơn hàng đối chiếu được với chi tiết đơn hàng và thanh toán.
- [ ] Đơn hàng, thanh toán, phiếu nhập, điều chuyển và kiểm kê gần nhất có mặt đến điểm khôi phục đã chọn.
- [ ] Đăng nhập, RBAC, tra cứu sản phẩm, quét barcode, thanh toán và thao tác kho vượt qua kiểm thử nhanh.
- [ ] Giao dịch thử nghiệm có thể commit và rollback an toàn.
- [ ] Cơ sở dữ liệu khôi phục có đúng quyền sở hữu, quyền truy cập và cấu hình kết nối.

Các tài liệu hiện có xác định những thực thể và một số quy tắc nghiệp vụ, nhưng chưa quy định đầy đủ SQL đối chiếu hoặc mọi trạng thái nghiệp vụ. Cần hoàn thiện các kiểm tra đó cùng quá trình phát triển ứng dụng.

## 7. Lưu ý về Multi-Tenant và chi nhánh

Hệ thống dùng chung cơ sở dữ liệu và schema. Vì vậy, bản sao lưu toàn cơ sở dữ liệu chứa dữ liệu của **tất cả Tenant**; `pg_dump` không phải công cụ tạo bản sao lưu tách biệt cho từng Tenant.

- Không cung cấp bản sao lưu toàn cơ sở dữ liệu cho một Tenant riêng lẻ.
- Nếu cần xuất hoặc khôi phục dữ liệu cấp Tenant, phải thiết kế và kiểm thử quy trình xuất/nhập riêng theo Tenant. Quy trình phải bao gồm các bản ghi phụ thuộc và bảo toàn toàn vẹn tham chiếu.
- Duy trì bộ lọc `tenant_id` trong truy vấn ứng dụng và kiểm tra quyền chi nhánh độc lập.
- Kiểm tra cô lập Tenant sau mỗi lần khôi phục.
- Không khôi phục trực tiếp các dòng dữ liệu của một Tenant đè lên môi trường thực tế nếu chưa có kế hoạch được rà soát, an toàn giao dịch.

## 8. POS Offline-First và đồng bộ dữ liệu

PWA có thể tiếp tục lưu các thao tác đang chờ đồng bộ trên thiết bị cục bộ trong khi cơ sở dữ liệu máy chủ được khôi phục. Việc khôi phục cơ sở dữ liệu không tự động khôi phục hàng đợi phía thiết bị và cũng không đảm bảo chúng đã đồng bộ.

- Giữ mã định danh thao tác phía máy khách ổn định và dùng khóa idempotency cho yêu cầu đồng bộ.
- Sau khi phục hồi, đối chiếu đơn hàng và thao tác kho đang chờ với xác nhận từ máy chủ trước khi phát lại hàng loạt.
- Từ chối hoặc đánh dấu các yêu cầu gửi trùng; không mặc định rằng timeout phía máy khách đồng nghĩa giao dịch máy chủ thất bại.
- Với giao dịch được tạo sau điểm PITR đã chọn, dùng nhật ký đồng bộ hoặc hồ sơ vận hành để xác định việc phát lại có an toàn hay không.
- Không phát lại thao tác thay đổi tồn kho hoặc thanh toán nếu chưa có idempotency và cơ chế phát hiện trùng lặp.

Các kiểm soát đồng bộ trên là khuyến nghị vận hành; các tệp đặc tả cơ sở dữ liệu hiện tại chưa mô tả đầy đủ schema hàng đợi ngoại tuyến.

## 9. Giám sát và cảnh báo

Gửi cảnh báo cho người vận hành phụ trách khi:

- Tác vụ sao lưu theo lịch thất bại hoặc vượt quá thời gian dự kiến.
- Dung lượng bản sao lưu thay đổi bất thường hoặc bước kiểm tra checksum/xác minh thất bại.
- Lưu trữ WAL thất bại hoặc hàng đợi lưu trữ vượt ngưỡng đã phê duyệt.
- Dung lượng trống gần chạm giới hạn vận hành.
- Bản sao lưu thành công gần nhất cũ hơn khoảng RPO đã phê duyệt.
- Diễn tập khôi phục thất bại hoặc quá hạn.

Duy trì nhật ký có thể kiểm toán cho hoạt động sao lưu/khôi phục, bao gồm người khởi tạo khôi phục thủ công và người phê duyệt chuyển đổi môi trường thực tế.

## 10. Trách nhiệm và kiểm soát thay đổi

- **Phụ trách Cơ sở dữ liệu/DevOps:** tác vụ sao lưu, mã hóa, thời hạn lưu trữ, giám sát và thực hiện khôi phục.
- **Phụ trách Ứng dụng:** xác minh Tenant/chi nhánh, đối chiếu nghiệp vụ, xử lý hàng đợi ngoại tuyến và kiểm thử nhanh.
- **Chủ sở hữu nghiệp vụ:** phê duyệt RPO/RTO, thời hạn lưu trữ, điểm khôi phục và việc chuyển đổi môi trường thực tế.

Rà soát tài liệu này khi phiên bản chính PostgreSQL, kiến trúc triển khai, schema, nghĩa vụ lưu trữ dữ liệu hoặc thiết kế đồng bộ ngoại tuyến thay đổi.
