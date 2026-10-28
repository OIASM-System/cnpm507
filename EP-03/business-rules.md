# Quy tắc nghiệp vụ

## 1. Mục đích

Tài liệu định nghĩa các quy tắc nghiệp vụ bắt buộc của OISM. Mỗi quy tắc có mã duy nhất để truy vết sang URS, RTM, use case, API, kiểm thử và mã nguồn.

## 2. Quy ước mức độ

- **MUST:** Bắt buộc, vi phạm phải từ chối hoặc rollback giao dịch.
- **SHOULD:** Nên áp dụng; chỉ được bỏ qua khi có lý do thiết kế được phê duyệt.
- **MAY:** Tùy chọn hoặc có thể cấu hình.

## 3. Quy tắc Tenant, xác thực và phân quyền

### BR-AUTH-001 - Mọi dữ liệu nghiệp vụ thuộc một Tenant

- Mỗi bản ghi nghiệp vụ MUST có TenantId, trừ bảng tham chiếu toàn hệ thống được xác định rõ.
- TenantId MUST được lấy từ ngữ cảnh xác thực phía server.
- Client không được phép đổi TenantId để truy cập dữ liệu Tenant khác.
- **Nguồn:** FR-AUTH-01, NFR-TENANT-01.

### BR-AUTH-002 - TenantId là bất biến

TenantId của một bản ghi nghiệp vụ MUST NOT được thay đổi sau khi tạo. Việc chuyển dữ liệu giữa Tenant không nằm trong thao tác nghiệp vụ thông thường.

### BR-AUTH-003 - Nội dung token

JWT hợp lệ MUST chứa tối thiểu TenantId, UserId và Role; access token có thời hạn tối đa 60 phút theo yêu cầu đề tài.

### BR-AUTH-004 - Mật khẩu

Mật khẩu MUST được băm bằng BCrypt hoặc Argon2; không được lưu hoặc ghi log mật khẩu dạng rõ.

### BR-AUTH-005 - Quyền theo vai trò

- Owner: toàn quyền trong Tenant.
- Staff: quản lý kho, sản phẩm và đơn theo quyền được cấu hình.
- Cashier: chỉ truy cập chức năng POS và dữ liệu tối thiểu cần thiết.
- API MUST kiểm tra quyền phía server; ẩn nút trên giao diện không thay thế kiểm tra API.

### BR-AUTH-006 - Chi nhánh bị tắt

Chi nhánh/kho đã có lịch sử giao dịch MUST NOT bị xóa cứng. Khi bị tắt, hệ thống không cho tạo giao dịch mới nhưng vẫn cho phép truy vấn báo cáo lịch sử.

## 4. Quy tắc sản phẩm, SKU, mã vạch và giá

### BR-PROD-001 - SKU duy nhất

Mã SKU MUST là duy nhất trong cùng một Tenant. Hai Tenant khác nhau MAY sử dụng cùng chuỗi SKU.

### BR-PROD-002 - SKU đại diện đơn vị tồn kho

Mỗi biến thể bán được MUST có SKU riêng. Tồn kho, reservation, COGS và OrderItem MUST tham chiếu SKU, không chỉ tham chiếu Product.

### BR-PROD-003 - Mã vạch

- Mã vạch được sinh hoặc nhập thủ công.
- Mã vạch đang hoạt động SHOULD là duy nhất trong Tenant để tránh quét nhầm.
- Nếu dùng EAN-13, hệ thống SHOULD kiểm tra đủ 13 chữ số và check digit.
- Nếu dùng Code128, hệ thống MUST kiểm tra độ dài và tập ký tự theo cấu hình.

### BR-PROD-004 - Giá bán tách biệt COGS

RetailPrice và WholesalePrice MUST được lưu tách biệt với CostPrice/COGS. Thay đổi giá bán không được tự động thay đổi COGS.

### BR-PROD-005 - Không xóa SKU có lịch sử

SKU đã xuất hiện trong ledger, đơn hàng, phiếu nhập hoặc kiểm kê MUST NOT bị xóa cứng; chỉ được ngừng hoạt động.

### BR-PROD-006 - Số lượng và giá hợp lệ

- Số lượng giao dịch MUST lớn hơn 0, trừ trường chênh lệch tính toán được biểu diễn bằng loại IN/OUT riêng.
- Giá nhập và giá bán MUST không âm.
- Tiền tệ và quy tắc làm tròn MUST nhất quán trong Tenant.

## 5. Quy tắc tồn kho và Inventory Ledger

### BR-INV-001 - Công thức tồn khả dụng

```text
available = on_hand - reserved
```

Với mô hình không cho phép backorder, available MUST luôn lớn hơn hoặc bằng 0 sau khi commit.

### BR-INV-002 - Cấp quản lý số dư

Số dư MUST được xác định tối thiểu theo `TenantId + BranchId/WarehouseId + SKUId`. Không được gộp tồn giữa các Tenant.

### BR-INV-003 - Ledger chỉ ghi thêm

InventoryLedger MUST chỉ cho phép INSERT. UPDATE và DELETE bị cấm ở tầng ứng dụng và SHOULD bị ngăn thêm bằng quyền/ràng buộc cơ sở dữ liệu.

### BR-INV-004 - Điều chỉnh bằng bút toán bù trừ

Nếu giao dịch ledger sai, hệ thống MUST tạo giao dịch bù trừ có ReferenceId liên kết bản ghi gốc; không chỉnh sửa bản ghi cũ.

### BR-INV-005 - Trường bắt buộc của ledger

Mọi bản ghi MUST có TenantId, BranchId/WarehouseId, SKUId, Type, Quantity, BalanceAfter, ReferenceId và CreatedAt; SHOULD có ActorId, ReasonCode và CorrelationId.

### BR-INV-006 - Đồng nhất số dư và ledger

Mọi thay đổi on_hand MUST có ledger tương ứng trong cùng transaction. Nếu ghi ledger thất bại, cập nhật số dư MUST rollback.

### BR-INV-007 - BalanceAfter

BalanceAfter MUST bằng số dư on_hand sau khi áp dụng giao dịch tại đúng kho và SKU. Việc tính BalanceAfter phải diễn ra dưới cùng cơ chế khóa với cập nhật số dư.

### BR-INV-008 - Không cập nhật tồn trực tiếp

Không API/UI nào được phép nhập một giá trị mới để ghi đè on_hand. Thay đổi chỉ đi qua nghiệp vụ nhập hàng, bán hàng, trả hàng, chuyển kho hoặc kiểm kê/điều chỉnh.

### BR-INV-009 - Không cho tồn âm

on_hand MUST không âm sau commit, trừ khi một chính sách backorder riêng được thiết kế và phê duyệt. Phiên bản đề tài mặc định không hỗ trợ backorder.

### BR-INV-010 - Nhập hàng

Phiếu nhập chỉ làm tăng tồn và cập nhật COGS khi chuyển sang Confirmed. Phiếu Draft MUST không ảnh hưởng số dư.

### BR-INV-011 - Tính nguyên tử của phiếu nhập

Khi xác nhận phiếu nhập nhiều dòng, tất cả dòng MUST thành công hoặc toàn bộ phiếu rollback.

### BR-INV-012 - Chuyển kho hai bước

- Confirm Dispatch: ghi OUT tại nguồn và chuyển trạng thái InTransit.
- Confirm Receipt: ghi IN tại đích.
- Kho đích MUST NOT tăng on_hand trước khi xác nhận nhận.

### BR-INV-013 - Chênh lệch chuyển kho

Nếu số lượng nhận khác số lượng gửi, hệ thống MUST ghi nhận chênh lệch và yêu cầu lý do/phê duyệt; không âm thầm sửa số lượng gửi.

### BR-INV-014 - Kiểm kê

Kết quả kiểm kê chỉ thay đổi tồn sau khi được người có quyền phê duyệt. Chênh lệch dương ghi ADJUSTMENT_IN; chênh lệch âm ghi ADJUSTMENT_OUT.

## 6. Quy tắc COGS

### BR-COST-001 - Phương pháp giá vốn

OISM sử dụng giá vốn bình quân gia quyền theo SKU và phạm vi kho/chi nhánh được thiết kế.

### BR-COST-002 - Công thức nhập hàng

```text
new_cost = ((old_on_hand × old_cost) + (received_qty × purchase_price))
           / (old_on_hand + received_qty)
```

Công thức chỉ áp dụng khi phiếu nhập được Confirmed.

### BR-COST-003 - Trường hợp tồn cũ bằng 0

Nếu `old_on_hand = 0` và `received_qty > 0`, `new_cost` MUST bằng `purchase_price`.

### BR-COST-004 - Trường hợp mẫu số không hợp lệ

Nếu `old_on_hand + received_qty <= 0`, hệ thống MUST từ chối phép tính và rollback giao dịch.

### BR-COST-005 - Độ chính xác và làm tròn

Phép tính COGS MUST dùng kiểu decimal, không dùng floating point nhị phân. Hệ thống SHOULD lưu nhiều chữ số thập phân hơn số hiển thị và chỉ làm tròn theo chính sách tiền tệ khi xuất báo cáo/hóa đơn.

### BR-COST-006 - Snapshot khi xuất bán

Khi đơn chuyển sang Confirmed hoặc POS thanh toán, COGS hiện tại MUST được lưu vào `OrderItem.CostPrice` trong cùng transaction với trừ kho.

### BR-COST-007 - Bất biến lịch sử COGS

Việc nhập hàng hoặc thay đổi COGS trong tương lai MUST NOT thay đổi `OrderItem.CostPrice` của đơn đã Confirmed/Completed.

### BR-COST-008 - Lợi nhuận gộp

```text
GrossProfit = NetRevenue - COGS
COGS = Sum(OrderItem.CostPrice × confirmed_quantity)
```

Đơn Cancelled chưa xuất hàng MUST không đóng góp doanh thu hoặc COGS. Trả hàng/hoàn tiền phải dùng quy tắc bù trừ được định nghĩa.

## 7. Quy tắc đơn hàng và máy trạng thái

### BR-ORD-001 - Mô hình đơn chuẩn

Mọi đơn POS, Admin và sàn MUST được chuyển về Canonical Order Model trước khi xử lý nghiệp vụ chung.

### BR-ORD-002 - Định danh đơn ngoài hệ thống

Tổ hợp `TenantId + Channel + ExternalOrderId` MUST duy nhất đối với đơn online để ngăn tạo trùng.

### BR-ORD-003 - Idempotency webhook

Nhận lại cùng event hoặc cùng khóa idempotency MUST không tạo thêm Order, reservation, payment hoặc ledger transaction.

### BR-ORD-004 - Chuyển trạng thái hợp lệ

Các chuyển đổi mặc định:

- Draft → Reserved
- Draft → Cancelled
- Reserved → Confirmed
- Reserved → Cancelled
- Confirmed → Completed
- Confirmed → trạng thái hủy/trả chỉ theo quy trình bù trừ được phê duyệt

Mọi chuyển đổi khác MUST bị từ chối.

### BR-ORD-005 - Kiểm tra trạng thái hiện tại

Lệnh chuyển trạng thái MUST kiểm tra trạng thái hiện tại trong cơ sở dữ liệu dưới kiểm soát đồng thời; không chỉ dựa trên trạng thái client gửi lên.

### BR-ORD-006 - Đơn nhiều dòng

Reservation/Confirm cho đơn nhiều dòng MUST theo nguyên tắc all-or-nothing, trừ khi nghiệp vụ tách đơn/backorder được bổ sung rõ ràng.

### BR-ORD-007 - SKU không ánh xạ được

Đơn online có SKU ngoài chưa ánh xạ MUST được đưa vào hàng chờ lỗi và MUST NOT giữ tồn của một SKU khác theo suy đoán.

### BR-ORD-008 - Hủy sau Confirmed

Không được hoàn tác đơn Confirmed chỉ bằng cách đổi trạng thái. Hệ thống MUST tạo nghiệp vụ trả hàng hoặc bút toán tồn kho bù trừ nếu hàng quay lại kho.

## 8. Quy tắc Reservation và chống bán vượt

### BR-RSE-001 - Điều kiện giữ hàng

Reservation chỉ thành công nếu tại thời điểm khóa:

```text
on_hand - reserved >= requested_quantity
```

### BR-RSE-002 - Tác động của Reserve

Reserve thành công MUST tăng reserved, không giảm on_hand và không ghi ledger xuất kho.

### BR-RSE-003 - Tác động của Confirm

Confirm MUST đồng thời:

1. Giảm on_hand theo số lượng xác nhận.
2. Giảm reserved theo lượng đã giữ.
3. Ghi ledger OUT/SALE.
4. Snapshot COGS.
5. Chuyển trạng thái đơn.

Tất cả thực hiện trong một transaction.

### BR-RSE-004 - Tác động của Cancel/Expire

Nếu đơn đang Reserved, Cancel/Expire MUST giảm reserved; on_hand không đổi và không ghi ledger OUT.

### BR-RSE-005 - Một reservation không được giải phóng hai lần

Reservation MUST có trạng thái hoặc version để bảo đảm Release/Expire chỉ tác động một lần.

### BR-RSE-006 - Khóa đồng thời

Cập nhật reserved/on_hand MUST dùng pessimistic locking hoặc optimistic locking ở cấp cơ sở dữ liệu. Kiểm tra tồn chỉ ở tầng ứng dụng mà không có bảo vệ DB là không hợp lệ.

### BR-RSE-007 - Thứ tự khóa

Khi một đơn có nhiều SKU, dịch vụ MUST khóa số dư theo một thứ tự ổn định, ví dụ SKUId tăng dần, để giảm nguy cơ deadlock.

### BR-RSE-008 - Hết hạn reservation

Mỗi reservation online SHOULD có `ExpiresAt`. Hangfire MAY quét theo lịch, nhưng thao tác hết hạn MUST idempotent và dùng khóa/phiên bản.

### BR-RSE-009 - Kịch bản Flash Sale

Với 50 yêu cầu đồng thời cho SKU còn 1 đơn vị, tối đa một reservation được thành công; `available` MUST không âm.

## 9. Quy tắc POS và thanh toán

### BR-POS-001 - Kiểm tra available

POS MUST kiểm tra available khi thêm/chỉnh số lượng và MUST kiểm tra lại trong transaction checkout. Kiểm tra trên giao diện không thay thế kiểm tra tại server.

### BR-POS-002 - Bảo vệ hàng online

POS chỉ được bán available, không được sử dụng phần reserved cho đơn online.

### BR-POS-003 - Thanh toán nguyên tử

Checkout POS MUST thực hiện Reserve → Confirm → Deduct, tạo Order, Payment, ledger và snapshot COGS trong một transaction nguyên tử.

### BR-POS-004 - Rollback khi lỗi

Nếu bất kỳ phần nào của checkout thất bại, không được để lại đơn thanh toán dở dang, số dư thay đổi một phần hoặc ledger thiếu.

### BR-POS-005 - Phương thức thanh toán

Phiên bản cốt lõi hỗ trợ tiền mặt và QR chuyển khoản. Payment MUST lưu phương thức, số tiền, trạng thái, thời gian và người thực hiện.

### BR-POS-006 - In hóa đơn

Chỉ mở hộp thoại in hóa đơn hoàn tất sau khi transaction checkout đã commit thành công.

### BR-POS-007 - Giá tại thời điểm bán

OrderItem MUST snapshot đơn giá bán, giảm giá, thuế nếu có và CostPrice; thay đổi bảng giá sau đó không sửa đơn lịch sử.

## 10. Quy tắc báo cáo và cảnh báo

### BR-REP-001 - Phạm vi doanh thu

Báo cáo doanh thu MUST chỉ tính các trạng thái được quy định là đã ghi nhận doanh thu, mặc định là Completed hoặc Confirmed theo chính sách kế toán của Tenant. Chính sách phải nhất quán giữa các báo cáo.

### BR-REP-002 - Bộ lọc

Báo cáo MUST hỗ trợ tối thiểu khoảng thời gian, chi nhánh, kênh bán và SKU.

### BR-REP-003 - Giá trị tồn kho

Giá trị tồn kho được tính theo số lượng on_hand nhân COGS hiện tại của SKU trong phạm vi kho tương ứng, theo chính sách định giá đã chọn.

### BR-REP-004 - Cảnh báo tồn thấp

Cảnh báo được tạo khi:

```text
available <= reorder_point
```

Một SKU không nên tạo lặp vô hạn cùng cảnh báo chưa xử lý; hệ thống SHOULD có cơ chế gộp hoặc trạng thái cảnh báo.

### BR-REP-005 - Dữ liệu gần thời gian thực

Sau khi transaction tồn kho hoặc đơn hàng commit, dashboard SHOULD được cập nhật qua SignalR hoặc cơ chế làm mới phù hợp; thông báo không được phát trước commit.

### BR-REP-006 - Đề xuất AI

Đề xuất của AI là thông tin hỗ trợ quyết định. Trong phạm vi mặc định, AI MUST NOT tự xác nhận phiếu nhập hoặc tạo cam kết tài chính mà không có người có quyền phê duyệt.

## 11. Quy tắc bảo mật, hiệu năng và vận hành

### BR-NFR-001 - HTTPS

API production MUST sử dụng HTTPS với TLS 1.3 theo yêu cầu dự án.

### BR-NFR-002 - Refresh token

Refresh token MUST được lưu và truyền an toàn, có khả năng thu hồi, xoay vòng hoặc vô hiệu hóa theo thiết kế bảo mật.

### BR-NFR-003 - Global Query Filter

EF Core Global Query Filters MUST áp dụng cho các entity theo Tenant; các truy vấn bỏ filter chỉ được dùng trong tác vụ quản trị được kiểm soát và kiểm toán.

### BR-NFR-004 - Chỉ mục

InventoryLedger và Orders MUST có chỉ mục hỗ trợ `(TenantId, CreatedAt)` và `(TenantId, SKUId)` hoặc biến thể phù hợp với truy vấn thực tế.

### BR-NFR-005 - Mục tiêu hiệu năng

- p95 tìm kiếm/quét SKU tại POS: dưới 200 ms.
- Tạo/ghi đơn hàng: dưới 500 ms.
- Báo cáo tổng hợp: dưới 2 giây với dưới 100.000 bản ghi.

### BR-NFR-006 - Thời gian hoạt động

Hệ thống SHOULD đạt 99,5% uptime trong giờ vận hành 07:00–22:00.

### BR-NFR-007 - Clean Architecture

Domain không được phụ thuộc trực tiếp EF Core, SignalR, Hangfire hoặc Presentation. Application điều phối use case; Infrastructure triển khai giao tiếp kỹ thuật.

### BR-NFR-008 - Độ bao phủ kiểm thử

Inventory Ledger, Reservation/Anti-Oversell và COGS MUST đạt tối thiểu 80% coverage kết hợp Unit Test và Integration Test theo tiêu chí dự án.

### BR-NFR-009 - Thời gian chuẩn

Timestamp SHOULD được lưu ở UTC và chuyển đổi theo múi giờ Tenant khi hiển thị. CreatedAt của ledger MUST do server tạo.

### BR-NFR-010 - Không ghi log dữ liệu nhạy cảm

Log MUST NOT chứa mật khẩu, token đầy đủ, bí mật webhook hoặc dữ liệu thanh toán nhạy cảm. Log SHOULD có CorrelationId và TenantId ở dạng phù hợp.

## 12. Bất biến miền quan trọng

Các bất biến sau phải được bảo vệ bằng code miền, transaction và ràng buộc DB khi phù hợp:

```text
on_hand >= 0
reserved >= 0
available = on_hand - reserved
available >= 0
reserved <= on_hand
ledger is append-only
confirmed order item has CostPrice
TenantId never changes
one external order creates at most one internal order
one reservation is released at most once
```

## 13. Quy tắc cần được làm rõ thêm

Các nội dung sau chưa được đề tài quy định đầy đủ và cần quyết định trước khi hoàn thiện đặc tả chi tiết:

1. Reservation hết hạn sau bao nhiêu phút cho từng kênh?
2. COGS bình quân được tính riêng theo kho hay chung toàn Tenant?
3. Có hỗ trợ bán âm/backorder không? Tài liệu này mặc định là không.
4. Chính sách trả hàng, hoàn tiền và hàng trả về có nhập lại kho hay không?
5. Đơn Confirmed có được hủy trực tiếp hay bắt buộc tạo Return?
6. Revenue được ghi nhận tại Confirmed hay Completed?
7. Có cho nhận chuyển kho từng phần không?
8. Có cho xác nhận nhập hàng từng phần không?
9. Giá và giảm giá có cần quy tắc phê duyệt theo vai trò không?
10. Cách xử lý phí sàn, phí vận chuyển, thuế và voucher khi tính NetRevenue?
11. Phạm vi duy nhất của mã vạch là Tenant hay toàn hệ thống?
12. Chi nhánh và kho là cùng một thực thể hay hai thực thể liên kết?

## 14. Gợi ý truy vết kiểm thử

| Nhóm quy tắc | Kiểm thử tối thiểu |
|---|---|
| AUTH/Tenant | Truy cập chéo Tenant bị từ chối; JWT sai Tenant; quyền theo vai trò. |
| Product | SKU/mã vạch trùng; SKU ngừng hoạt động; dữ liệu giá không hợp lệ. |
| Ledger | Không UPDATE/DELETE; BalanceAfter đúng; rollback khi ghi ledger lỗi. |
| COGS | Tồn cũ bằng 0; nhiều lần nhập; decimal/rounding; snapshot bất biến. |
| Order | Chuyển trạng thái sai; webhook trùng; SKU không ánh xạ. |
| Reservation | 50 yêu cầu/1 SKU; cancel hai lần; expire và confirm cạnh tranh. |
| POS | Checkout thiếu tồn; lỗi payment; rollback toàn bộ; in sau commit. |
| Report | Lọc đúng; loại Cancelled; lợi nhuận dùng snapshot CostPrice. |
