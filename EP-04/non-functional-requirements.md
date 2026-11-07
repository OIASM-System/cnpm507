# Yêu cầu phi chức năng

> **Dự án:** Omnichannel Inventory and Sales Management System (OISM)  
> **Phiên bản:** 1.0  
> **Trạng thái:** Bản đặc tả cơ sở  
> **Ngày cập nhật:** 29/10/2026  
> **Phạm vi:** SaaS đa khách hàng, Backend .NET 8, PostgreSQL, ReactJS Admin, PWA POS, SignalR, Hangfire và Docker.

---

## 1. Hiệu năng và khả năng đồng thời

| ID | Yêu cầu đo được | Phương pháp xác minh |
|---|---|---|
| NFR-PERF-01A | p95 tìm SKU/quét barcode < 200 ms | Load test trên môi trường chuẩn, cache ấm, công bố cấu hình |
| NFR-PERF-01B | p95 tạo/ghi đơn < 500 ms | Đo API end-to-end, không tính độ trễ dịch vụ ngoài |
| NFR-PERF-01C | Báo cáo tổng hợp < 2 giây với < 100.000 bản ghi | Dataset chuẩn và bộ lọc công bố trước |
| NFR-PERF-02A | 50 request đồng thời tranh 1 SKU không làm available âm | Concurrency test lặp nhiều vòng |
| NFR-PERF-02B | Tổng lượng confirm thành công không vượt tồn có thể bán | Đối chiếu balance, reservation và ledger |
| NFR-PERF-03 | Timeout, deadlock và retry được cấu hình giới hạn | Fault/concurrency test |

## 2. Multi-tenancy và mở rộng

| ID | Yêu cầu |
|---|---|
| NFR-TENANT-01 | Mọi bảng nghiệp vụ có TenantId; EF Core Global Query Filters bật mặc định; unique/index có tenant scope |
| NFR-TENANT-02 | Không endpoint, export, SignalR group, job hoặc cache key nào được rò dữ liệu chéo tenant |
| NFR-TENANT-03 | Chỉ mục tối thiểu `(TenantId, CreatedAt)`, `(TenantId, SKUId)` cho ledger/orders theo truy vấn thực tế |
| NFR-TENANT-04 | Thiết kế hỗ trợ hàng triệu dòng ledger bằng pagination, covering index/partitioning khi cần, không tải toàn bộ vào RAM |
| NFR-TENANT-05 | TenantId tin cậy được lấy từ principal/server context; payload client không được dùng để vượt scope |

## 3. Bảo mật và toàn vẹn

| ID | Yêu cầu |
|---|---|
| NFR-SEC-01 | HTTPS/TLS 1.3 tại hạ tầng hỗ trợ; mật khẩu hash BCrypt/Argon2; access token <= 60 phút; refresh token hash, rotate, revoke |
| NFR-SEC-02 | Reserve/confirm/deduct và POS checkout tuân thủ ACID, rollback toàn bộ khi lỗi |
| NFR-SEC-03 | InventoryLedger append-only; application DB role không có UPDATE/DELETE; sửa sai bằng compensating entry |
| NFR-SEC-04 | RBAC được thực thi server-side; nguyên tắc least privilege cho DB, CI/CD và vận hành |
| NFR-SEC-05 | Chống injection, XSS, CSRF theo cơ chế xác thực, brute force, mass assignment; validate input và rate limit |
| NFR-SEC-06 | Không log password, token, secret hoặc dữ liệu thanh toán nhạy cảm; secret nằm trong secret store/environment |
| NFR-SEC-07 | Audit log chứa actor, tenant, action, entity, timestamp, result và trace ID; chống sửa trái phép |

## 4. Sẵn sàng, độ tin cậy và khôi phục

| ID | Yêu cầu |
|---|---|
| NFR-USA-01 | Mục tiêu uptime 99,5% trong 07:00–22:00, loại trừ bảo trì đã thông báo theo thỏa thuận dự án |
| NFR-REL-01 | Webhook, event và job phải idempotent; retry không tạo duplicate order/ledger/payment |
| NFR-REL-02 | SignalR chỉ là kênh thông báo; dữ liệu chuẩn luôn truy xuất lại được qua API |
| NFR-REL-03 | Có health check, structured log, metrics và cảnh báo cho API, DB, worker |
| NFR-REL-04 | Backup tự động; bài kiểm tra restore được ghi nhận. Mục tiêu demo đề xuất RPO <= 24 giờ, RTO <= 4 giờ |
| NFR-REL-05 | Sự kiện sau giao dịch dùng outbox hoặc cơ chế tương đương để tránh commit thành công nhưng mất thông báo |

## 5. Khả năng sử dụng và truy cập

| ID | Yêu cầu |
|---|---|
| NFR-USA-02 | POS responsive trên desktop/tablet/thiết bị cầm tay; luồng chuẩn dưới 3 cú nhấp hoặc barcode + Enter |
| NFR-USA-03 | Tác vụ chính dùng được bằng bàn phím; focus rõ; lỗi chỉ ra trường và cách khắc phục |
| NFR-USA-04 | Không chỉ dùng màu để báo trạng thái; độ tương phản và nhãn form đạt mức truy cập hợp lý theo WCAG 2.1 AA mục tiêu |
| NFR-USA-05 | Thời gian, số và tiền tệ hiển thị theo locale/múi giờ tenant; lưu thời gian UTC |
| NFR-USA-06 | Hành động phá hủy/hủy có xác nhận và hiển thị tác động đến reservation/tồn |

## 6. Bảo trì và kiểm thử

| ID | Yêu cầu |
|---|---|
| NFR-MAINT-01 | Domain không phụ thuộc Infrastructure/Presentation; Application mô tả use case; dependency được kiểm tra trong review/test |
| NFR-MAINT-02 | Coverage >= 80% cho Inventory Ledger, Anti-Oversell và COGS; coverage không thay thế kiểm tra chất lượng assertion |
| NFR-MAINT-03 | API có OpenAPI; migration có version; coding standard, analyzer và format chạy trong CI |
| NFR-MAINT-04 | Unit, integration, concurrency và smoke test chạy tự động; build lỗi nếu test bắt buộc thất bại |
| NFR-MAINT-05 | Cấu hình theo môi trường; không hard-code endpoint, credential hoặc tenant |

## 7. Khả năng triển khai và tương thích

| ID | Yêu cầu |
|---|---|
| NFR-DEP-01 | Dockerfile riêng cho Backend và Frontend; image chạy bằng non-root khi khả thi |
| NFR-DEP-02 | `docker-compose.yml` khởi động được hệ thống demo và seed dữ liệu có kiểm soát |
| NFR-DEP-03 | GitHub Actions build, test và tạo image; secret không xuất hiện trong log/artifact |
| NFR-DEP-04 | Hỗ trợ các phiên bản ổn định hiện hành của Chrome/Edge tại thời điểm nghiệm thu; PWA có manifest và service worker phù hợp |
| NFR-DEP-05 | Database migration chạy an toàn, có kiểm tra compatibility và hướng dẫn rollback/forward-fix |

## 8. Chất lượng dữ liệu và báo cáo

- NFR-DQ-01: Tiền dùng decimal với precision thống nhất; quantity/cost không mất chính xác do binary float.
- NFR-DQ-02: Báo cáo nêu rõ timezone, trạng thái đơn, discount, return và khoảng thời gian được tính.
- NFR-DQ-03: Ledger có chuỗi tham chiếu đến chứng từ gốc; balance projection có thể đối soát/tái dựng.
- NFR-DQ-04: Các khóa ngoại và check constraint ngăn quantity âm không hợp lệ, reserved > on_hand hoặc trạng thái vô nghĩa theo mô hình đã chọn.

## 9. Điều kiện đo kiểm chung

Mọi benchmark phải ghi CPU, RAM, DB, network, phiên bản phần mềm, kích thước dữ liệu, số virtual users, thời gian warm-up và percentile. Kết quả chỉ được xem là đạt khi không phát sinh sai lệch tồn, lỗi tenant isolation hoặc mất ledger để đổi lấy tốc độ.
