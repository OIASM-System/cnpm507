# SRS – Đặc tả yêu cầu phần mềm

> **Dự án:** Omnichannel Inventory and Sales Management System (OISM)  
> **Phiên bản:** 1.0  
> **Trạng thái:** Bản đặc tả cơ sở  
> **Ngày cập nhật:** 29/10/2026  
> **Phạm vi:** SaaS đa khách hàng, Backend .NET 8, PostgreSQL, ReactJS Admin, PWA POS, SignalR, Hangfire và Docker.

---

## 1. Mục đích và phạm vi hệ thống

SRS chuyển nhu cầu trong URS thành yêu cầu phần mềm có thể thiết kế, phát triển và kiểm thử. OISM là nền tảng SaaS quản lý tồn kho và bán hàng đa kênh, cung cấp Backend Web API, Admin Dashboard và PWA POS.

## 2. Tổng quan kiến trúc

### 2.1 Các khối chính

- **Presentation:** ASP.NET Core Web API, React Admin và React PWA POS.
- **Application:** use case/command/query, DTO, validation, authorization và orchestration giao dịch.
- **Domain:** Aggregate, entity, value object, luật COGS, order state và reservation.
- **Infrastructure:** EF Core, PostgreSQL, BCrypt/Argon2, SignalR, Hangfire, file/export, observability.
- **Tích hợp:** Webhook Simulator, API contracts và adapter cho các kênh.

### 2.2 Nguyên tắc

- Dependency hướng vào Domain/Application theo Clean Architecture.
- Mọi dữ liệu nghiệp vụ mang TenantId và được lọc tự động.
- Ledger là nguồn kiểm toán bất biến; bảng balance là projection tối ưu truy vấn.
- Command thay đổi tồn phải chạy trong transaction và có concurrency control.
- Webhook và command nhạy cảm phải idempotent.

## 3. Actor và quyền

| Actor | Quyền chính |
|---|---|
| Owner | Toàn quyền trong tenant; quản lý người dùng, chi nhánh, cấu hình và báo cáo |
| Staff | Sản phẩm, kho, nhập/chuyển/kiểm kê, xử lý đơn; không quản trị tenant nhạy cảm |
| Cashier | POS, đọc SKU/tồn khả dụng, tạo và thanh toán giao dịch tại quầy |
| Tester/Developer | Dùng simulator trong môi trường được cho phép |
| Channel Adapter | Gửi webhook với chữ ký/API key và idempotency key |
| Background Worker | Hủy reservation hết hạn, tổng hợp báo cáo, gửi thông báo |

## 4. Các phân hệ

| Phân hệ | Trách nhiệm | Mã yêu cầu |
|---|---|---|
| Identity & Tenant | Tenant, user, token, role, branch | FR-AUTH |
| Catalog | Category, brand, product, variant, SKU, barcode, price | FR-PROD |
| Inventory | Ledger, stock balance, receipt, transfer, stocktake | FR-INV |
| Costing | Weighted Average Cost và COGS snapshot | FR-COST |
| Order Hub | Canonical model, state machine, xử lý đơn | FR-ORD |
| Reservation | Available, reserve, confirm, release | FR-RSE |
| POS | Giỏ hàng, quét mã, thanh toán, in | FR-POS |
| Reporting | Doanh thu, lợi nhuận, tồn và cảnh báo | FR-REP |
| Realtime/Jobs | Simulator, SignalR, Hangfire | FR-SIM |
| Forecasting | Đề xuất reorder | AI-01 |

## 5. Mô hình trạng thái

### 5.1 Đơn hàng

`Draft -> Reserved -> Confirmed -> Completed`

Nhánh hủy: `Draft -> Cancelled`, `Reserved -> Cancelled`; không cho hủy trực tiếp đơn Completed. Việc hoàn/trả sau Completed phải là quy trình Return riêng, sinh ledger đảo và chứng từ tham chiếu.

### 5.2 Chuyển kho

`Draft -> Dispatched -> Received` hoặc `Draft/Dispatched -> Cancelled` theo điều kiện. Khi Dispatched, hàng rời kho nguồn; khi Received, hàng vào kho đích. Hàng đang vận chuyển phải được theo dõi riêng, không cộng vào available của kho đích.

### 5.3 Phiếu nhập và kiểm kê

Chứng từ có trạng thái `Draft -> Confirmed`; chỉ Confirmed mới tác động tồn. Chứng từ đã Confirmed không sửa/xóa, chỉ bù trừ bằng chứng từ mới.

## 6. Giao diện bên ngoài

### 6.1 API

- REST/JSON qua HTTPS; version theo `/api/v1`.
- JWT Bearer cho người dùng; refresh token được xoay vòng và thu hồi.
- Phản hồi lỗi thống nhất gồm `code`, `message`, `details`, `traceId`.
- Phân trang cursor hoặc page/size; lọc/sắp xếp phải có whitelist.
- Command webhook có `ExternalOrderId`, `Channel`, `IdempotencyKey`.
- Swagger/OpenAPI mô tả request, response, quyền và lỗi.

### 6.2 Realtime

SignalR group phải phân tách ít nhất theo TenantId, có thể theo BranchId/Role. Hub xác thực token và không cho client tự gia nhập group tenant khác.

### 6.3 In và thiết bị

PWA nhận dữ liệu từ máy quét dạng keyboard wedge hoặc nhập tay. In sử dụng hộp thoại in trình duyệt và mẫu CSS print; Browser Print API được hiểu là khả năng `window.print()`/print dialog của trình duyệt, không cam kết điều khiển máy in im lặng nếu không có agent riêng.

## 7. Yêu cầu dữ liệu và nhất quán

- Khóa chính ưu tiên UUID/ULID; thời gian lưu UTC và hiển thị theo múi giờ tenant.
- Tiền tệ dùng `decimal`, không dùng floating point.
- Quantity hỗ trợ đơn vị phù hợp; nếu chỉ bán nguyên chiếc thì scale bằng 0.
- Unique index tối thiểu: `(TenantId, SKUCode)`, `(TenantId, Barcode)` khi barcode có giá trị, `(TenantId, Channel, ExternalOrderId)`.
- StockBalance unique theo `(TenantId, BranchId, SKUId)` và có concurrency token/version.
- InventoryLedger có chỉ mục `(TenantId, SKUId, CreatedAt)` và `(TenantId, BranchId, CreatedAt)`.
- `BalanceAfter` phải khớp balance sau cùng trong cùng transaction ghi ledger.

## 8. Giao dịch trọng yếu

### 8.1 Reserve trực tuyến

1. Xác thực tenant, branch, SKU và idempotency key.
2. Bắt đầu transaction.
3. Khóa StockBalance qua `SELECT ... FOR UPDATE` hoặc kiểm tra version khi optimistic update.
4. Tính `available = on_hand - reserved`.
5. Nếu đủ, tăng reserved và tạo reservation; nếu thiếu, rollback và trả lỗi nghiệp vụ.
6. Ghi order/outbox liên quan, commit rồi mới phát SignalR.

### 8.2 Thanh toán POS

Trong một transaction: tạo/khóa đơn, kiểm tra available, reserve tạm thời, confirm, giảm on-hand/reserved, snapshot CostPrice, ghi ledger và payment. Nếu bất kỳ bước nào lỗi, rollback toàn bộ.

### 8.3 Nhập hàng và COGS

Khi xác nhận receipt, khóa balance/cost, tính COGS mới bằng weighted average trên số lượng hợp lệ, tăng on-hand, ghi ledger và lưu lịch sử cost. Không tính lại COGS hồi tố cho OrderItem đã snapshot.

## 9. Xử lý lỗi và idempotency

- Webhook trùng không được tạo đơn hoặc reservation lần hai.
- Client timeout rồi retry với cùng key phải nhận kết quả tương đương lần đầu.
- Deadlock/concurrency conflict được retry có giới hạn với jitter; không retry lỗi nghiệp vụ thiếu tồn.
- Sự kiện realtime chỉ phát sau commit; nên dùng transactional outbox để không mất sự kiện.
- Job Hangfire phải có khóa/idempotency tránh xử lý một reservation hai lần.

## 10. Bảo mật

- Password hash bằng Argon2 hoặc BCrypt với cost phù hợp; không ghi password/token vào log.
- JWT chứa TenantId, UserId, Role; server đối chiếu trạng thái user/tenant khi cần.
- Refresh token lưu dạng hash, có expiry, rotation và revoke.
- Rate limit login, webhook và API tìm kiếm; validate payload và kích thước request.
- Audit log ghi actor, hành động, đối tượng, thời gian, tenant, IP/trace ID; không chứa bí mật.
- EF Core Global Query Filter là lớp bảo vệ mặc định, nhưng command/query nhạy cảm vẫn phải kiểm tra tenant ownership.

## 11. Quan sát và vận hành

- Structured logging có `TraceId`, `TenantId`, `UserId`, `OrderId`; che dữ liệu nhạy cảm.
- Health checks cho API, PostgreSQL, Hangfire và dependency.
- Metrics: latency p50/p95/p99, error rate, webhook throughput, lock wait, oversell rejection, job failure.
- Backup/restore PostgreSQL được kiểm thử; migration có chiến lược rollback hoặc forward-fix.

## 12. Kiểm thử

- Unit test Domain: COGS, state transition, available và business rules.
- Integration test: PostgreSQL thật/container, transaction, query filter, ledger và API.
- Concurrency test: 50 request cạnh tranh một SKU.
- Security test: tenant isolation, RBAC, token expiry, injection và mass assignment.
- E2E: nhập hàng -> reserve -> confirm -> payment -> report.
- Mục tiêu coverage tối thiểu 80% cho Inventory Ledger, Reservation và COGS.

## 13. Triển khai

Docker Compose gồm backend, admin, POS, PostgreSQL và worker (có thể cùng host với API ở demo nhưng phải tách trách nhiệm logic). Pipeline GitHub Actions thực hiện restore, build, test, image build và kiểm tra migration. Secret được cấp qua environment/secret store, không commit vào repository.

## 14. Ma trận truy vết rút gọn

| URS | FR/NFR | User Story | Acceptance |
|---|---|---|---|
| UR-AUTH-01 | FR-AUTH-01..04; NFR-TENANT; NFR-SEC | US-AUTH-01..04 | AC-AUTH-* |
| UR-INV-01 | FR-INV-01..04; NFR-SEC-02..03 | US-INV-01..04 | AC-INV-* |
| UR-RSE-01 | FR-RSE-01..03; NFR-PERF-02 | US-RSE-01..03 | AC-RSE-* |
| UR-POS-01 | FR-POS-01..04; NFR-USA-02 | US-POS-01..04 | AC-POS-* |
| UR-REP-01 | FR-REP-01..03; NFR-PERF-01 | US-REP-01..03 | AC-REP-* |
