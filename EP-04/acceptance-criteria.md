# Tiêu chí chấp nhận

> **Dự án:** Omnichannel Inventory and Sales Management System (OISM)  
> **Phiên bản:** 1.0  
> **Trạng thái:** Bản đặc tả cơ sở  
> **Ngày cập nhật:** 29/10/2026  
> **Phạm vi:** SaaS đa khách hàng, Backend .NET 8, PostgreSQL, ReactJS Admin, PWA POS, SignalR, Hangfire và Docker.

---

## 1. Quy ước Given–When–Then

Mỗi tiêu chí phải kiểm thử được và truy vết tới FR/User Story. Dữ liệu test phải gồm ít nhất hai tenant, hai branch, SKU có/không tồn, đơn trùng idempotency và tình huống đồng thời.

## 2. Xác thực, tenant và RBAC

### AC-AUTH-01 – Tạo tenant
- **Given** thông tin tenant và Owner hợp lệ  
  **When** đăng ký  
  **Then** tạo TenantId duy nhất, Owner thuộc tenant và dữ liệu khởi tạo trong một transaction.
- **Given** quá trình tạo Owner thất bại  
  **When** transaction kết thúc  
  **Then** không tồn tại tenant mồ côi.

### AC-AUTH-02 – Đăng nhập và token
- **Given** credential đúng và tài khoản active  
  **When** đăng nhập  
  **Then** trả JWT chứa TenantId/UserId/Role, expiry <= 60 phút và refresh token an toàn.
- **Given** token hết hạn/revoked  
  **When** gọi API bảo vệ  
  **Then** trả 401 và không trả dữ liệu.

### AC-AUTH-03 – RBAC và cô lập
- **Given** Cashier  
  **When** gọi API quản lý người dùng  
  **Then** trả 403.
- **Given** user tenant A cố truy cập ID thuộc tenant B  
  **When** gọi API/query/export hoặc kết nối group realtime  
  **Then** không nhận dữ liệu tenant B và sự kiện được audit.

## 3. Catalog

### AC-PROD-01 – SKU/barcode duy nhất
- Tạo SKU trùng code trong cùng tenant bị từ chối; cùng code ở tenant khác được phép.
- Gán barcode đã thuộc SKU khác trong cùng tenant bị từ chối với mã lỗi rõ ràng.
- EAN-13 sai check digit bị từ chối nếu khai báo symbology EAN-13.

### AC-PROD-02 – Giá
- Giá bán âm bị từ chối.
- Thay đổi retail/wholesale không làm thay đổi current average cost.

## 4. Ledger, nhập, chuyển và kiểm kê

### AC-INV-01 – Ledger append-only
- Mọi thay đổi on-hand thành công tạo đúng bút toán và BalanceAfter.
- Thử UPDATE/DELETE bằng application DB role bị từ chối.
- Sửa sai tạo compensating entry tham chiếu bút toán gốc, không sửa lịch sử.

### AC-INV-02 – Phiếu nhập và COGS
- **Given** on-hand 10, cost 100.000; nhận 10, unit cost 120.000  
  **When** Confirm receipt  
  **Then** on-hand = 20, cost = 110.000 và có ledger IN quantity 10.
- Retry confirm cùng command/idempotency key không tăng tồn lần hai.
- Receipt Confirmed không thể sửa quantity/cost trực tiếp.

### AC-INV-03 – Chuyển kho
- Dispatch 5 làm kho nguồn giảm 5, in-transit tăng 5, kho đích chưa tăng.
- Receive 5 làm in-transit về 0, kho đích tăng 5 và có ledger liên quan ở hai đầu.
- Receive vượt lượng còn in-transit bị từ chối.

### AC-INV-04 – Kiểm kê
- SystemQty 20, CountedQty 18 sau phê duyệt tạo adjustment OUT 2 và BalanceAfter 18.
- Phiên chưa phê duyệt không làm thay đổi stock.

## 5. Order, reservation và anti-oversell

### AC-ORD-01 – Chuẩn hóa và idempotency
- Payload hợp lệ từng simulator tạo Canonical Order với channel/external order ID chính xác.
- Hai webhook cùng external event/idempotency key chỉ tạo một Order và một tập reservation.
- Payload sai trả lỗi mapping/validation, không tác động tồn.

### AC-ORD-02 – State machine
- Draft -> Reserved -> Confirmed -> Completed thành công khi đủ điều kiện.
- Draft -> Completed trực tiếp bị từ chối.
- Completed -> Cancelled bị từ chối; quy trình Return được yêu cầu.
- Mỗi transition lưu From/To, actor, reason và timestamp.

### AC-RSE-01 – Reserve
- **Given** on-hand 10, reserved 7  
  **When** reserve 3  
  **Then** reserved = 10, available = 0.
- **When** reserve thêm 1  
  **Then** trả `INSUFFICIENT_STOCK` và balance không đổi.

### AC-RSE-02 – Confirm và cancel
- Confirm reservation 3 làm on-hand giảm 3, reserved giảm 3, available không bị âm, tạo SALE ledger và snapshot CostPrice.
- Cancel reservation 3 làm reserved giảm 3, on-hand không đổi.
- Gọi cancel/confirm lặp không trừ hoặc giải phóng hai lần.

### AC-RSE-03 – Flash Sale
- **Given** SKU có on-hand 1, reserved 0  
  **When** 50 request reserve hợp lệ chạy đồng thời  
  **Then** đúng tối đa 1 request thành công, 49 request bị từ chối/xung đột xử lý đúng; on-hand = 1, reserved = 1, available = 0.
- Sau confirm request thắng: on-hand = 0, reserved = 0; ledger có đúng một SALE.
- Không có deadlock chưa xử lý, order trùng hoặc balance âm.

## 6. POS và thanh toán

### AC-POS-01 – Tìm/quét
- Quét barcode hợp lệ trả đúng SKU trong tenant/branch và hiển thị available trong p95 < 200 ms ở môi trường chuẩn.
- Barcode không tồn tại hiển thị lỗi có thể phục hồi mà không làm mất giỏ.

### AC-POS-02 – Chặn oversell
- Client chặn quantity vượt available hiển thị, nhưng server vẫn kiểm tra lại khi checkout.
- Nếu tồn đã bị đơn online giữ sau khi POS tải màn hình, checkout bị từ chối/cho chỉnh giỏ và không ghi payment/ledger dở dang.

### AC-POS-03 – Checkout nguyên tử
- Với tồn đủ và payment hợp lệ, một thao tác tạo order, payment, cost snapshot, stock update và ledger, sau đó mở khả năng in.
- Giả lập lỗi trước commit làm rollback toàn bộ; không có hóa đơn/payment thành công giả.
- In lại không tạo thêm giao dịch.

### AC-POS-04 – Khả dụng
- Luồng chuẩn quét barcode + Enter hoặc không quá 3 cú nhấp để hoàn tất.
- Các control chính dùng được bằng bàn phím và giao diện không vỡ ở desktop/tablet mục tiêu.

## 7. Báo cáo, cảnh báo và AI

### AC-REP-01 – Doanh thu/COGS/lợi nhuận
- Dataset chuẩn có Net Revenue 1.000.000 và COGS 600.000 phải trả Gross Profit 400.000.
- Draft/Cancelled bị loại; Return/discount được xử lý theo business rule công bố.
- Bộ lọc time/branch/channel/SKU cho kết quả đúng và không chéo tenant.

### AC-REP-02 – Tồn và hiệu năng
- Inventory value khớp tổng `on_hand × current average cost` theo phương pháp hệ thống.
- Báo cáo dưới 100.000 bản ghi hoàn thành < 2 giây trên môi trường benchmark được ghi nhận.

### AC-REP-03 – Tồn thấp
- Khi available <= reorder point, tạo một cảnh báo mở và đẩy đúng tenant sau commit.
- Chạy job/check nhiều lần không tạo cảnh báo mở trùng.

### AC-AI-01 – Khuyến nghị
- Kết quả có suggested quantity, horizon, dữ liệu đầu vào/lý do và trạng thái phê duyệt.
- Không tự Confirm receipt; dữ liệu thiếu phải hiển thị cảnh báo độ tin cậy.

## 8. Simulator, realtime và background

### AC-SIM-01 – Simulator
- Tester được phép gửi payload theo kênh, số request và concurrency; xem được success/failure/latency.
- User không có quyền hoặc môi trường production bị cấu hình khóa thì không sử dụng được.

### AC-SIM-02 – SignalR
- Đơn mới sau commit đẩy đến client cùng tenant/group; client tenant khác không nhận.
- Mất kết nối/reconnect không làm mất khả năng tải dữ liệu chuẩn từ API.

### AC-SIM-03 – Hangfire
- Reservation hết hạn chưa Confirmed được release đúng một lần.
- Job retry không thay đổi dữ liệu lần hai; job thất bại quá ngưỡng được log/cảnh báo.

## 9. Phi chức năng, bảo mật và triển khai

### AC-NFR-01 – Hiệu năng
- Load test ghi rõ hạ tầng, dataset, warm-up, duration và percentile.
- SKU search p95 < 200 ms; order write p95 < 500 ms theo workload chuẩn.
- Không chấp nhận kết quả nhanh nếu có lỗi dữ liệu hoặc request bị bỏ qua không báo cáo.

### AC-NFR-02 – Bảo mật
- Password trong DB không ở dạng rõ; token/secret không xuất hiện trong log.
- API trả đúng 401/403; input injection/mass assignment cơ bản bị chặn.
- Refresh token rotate/revoke hoạt động và token cũ không tái sử dụng được.

### AC-NFR-03 – Kiểm thử và coverage
- Module Ledger, Reservation và COGS đạt >= 80% coverage với unit/integration test có assertion nghiệp vụ.
- CI thất bại khi test bắt buộc hoặc build thất bại.

### AC-NFR-04 – Docker/CI-CD
- Từ repository sạch, `docker compose up` theo hướng dẫn khởi động Backend, Admin, POS và PostgreSQL; seed demo hoạt động.
- Swagger/API health check truy cập được; migration chạy đúng một lần.
- GitHub Actions restore/build/test/image thành công và không lộ secret.

## 10. Điều kiện nghiệm thu toàn hệ thống

Hệ thống được nghiệm thu khi toàn bộ tiêu chí Must đạt, không còn lỗi Critical/High, ma trận URS–FR/NFR–Story–Test có truy vết, gói Docker demo chạy được, dữ liệu tenant cô lập, Flash Sale không oversell và bộ tài liệu cài đặt/sử dụng/API đã hoàn tất.
