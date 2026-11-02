# Kiến trúc bảo mật OISM

## 1. Mục tiêu và phạm vi

Bảo vệ tài khoản, dữ liệu tenant, giao dịch tồn kho, đơn hàng, webhook và hạ tầng triển khai. Kiến trúc áp dụng defense in depth và nguyên tắc đặc quyền tối thiểu.

## 2. Mô hình đe dọa tóm tắt

| Tài sản | Đe dọa chính | Kiểm soát |
|---|---|---|
| Tài khoản | Credential stuffing, token theft | Hash mạnh, rate limit, token ngắn hạn, rotation |
| Dữ liệu tenant | IDOR, filter bypass | TenantContext, query filter, authorization, test isolation |
| Tồn kho | Race condition, sửa ledger | DB lock, ACID, append-only permission |
| Webhook | Giả mạo, replay | Signature/API key, timestamp, idempotency |
| API | Injection, abuse | Parameterized query, validation, WAF/rate limit |
| Secrets | Lộ trong code/log | Secret store, masking, rotation |
| Container | Image độc hại/lỗi thời | Scan dependency/image, non-root user |

## 3. Xác thực

### 3.1 Đăng nhập

- Email hoặc số điện thoại được chuẩn hóa.
- Mật khẩu băm bằng Argon2id hoặc BCrypt với work factor được cấu hình và kiểm tra định kỳ.
- Không ghi mật khẩu, OTP hoặc token vào log.
- Rate limit theo IP, tenant candidate và tài khoản.
- Có cơ chế lockout tăng dần, tránh cho phép dò tài khoản tồn tại.

### 3.2 JWT và Refresh Token

Access token thời hạn mục tiêu 60 phút theo NFR-SEC-01; môi trường rủi ro cao có thể dùng ngắn hơn.

Claim tối thiểu:

```json
{
  "sub": "user-id",
  "tenant_id": "tenant-id",
  "role": "Owner",
  "branch_ids": ["branch-id"],
  "jti": "token-id",
  "iss": "oism",
  "aud": "oism-api"
}
```

- Ký token bằng khóa bất đối xứng khi triển khai production.
- Kiểm tra issuer, audience, signature, expiry và clock skew nhỏ.
- Refresh token là chuỗi ngẫu nhiên mạnh, chỉ lưu bản băm ở server.
- Rotation refresh token sau mỗi lần sử dụng.
- Phát hiện reuse thì thu hồi cả token family.
- Thu hồi token khi user bị khóa, đổi mật khẩu hoặc tenant bị đình chỉ.

Nếu lưu token trên trình duyệt, ưu tiên cookie `HttpOnly`, `Secure`, `SameSite` phù hợp; nếu dùng Bearer token trong bộ nhớ, phải giảm thiểu XSS và không lưu access token vào localStorage.

## 4. Phân quyền

Sử dụng policy-based authorization, không chỉ kiểm tra role tại giao diện.

Ví dụ policy:

```text
Catalog.Read
Catalog.Manage
Inventory.Receive
Inventory.Transfer
Inventory.Adjust
Orders.Read
Orders.Reserve
Orders.Confirm
Orders.Cancel
Reports.Read
Tenant.Manage
```

Mỗi request phải vượt qua:

1. Authentication.
2. Tenant active check.
3. Permission check.
4. Branch/resource ownership check.
5. Business invariant check.

## 5. Bảo mật API

- HTTPS bắt buộc; TLS 1.3 theo NFR, cho phép TLS 1.2 nếu hạ tầng tương thích được phê duyệt.
- HSTS ở production.
- CORS allow-list chính xác cho Admin và POS origin.
- Validation server-side cho mọi DTO.
- Giới hạn body size, upload type và pagination size.
- Truy vấn parameterized; không nối chuỗi SQL từ input.
- Trả `ProblemDetails`, không lộ stack trace.
- Rate limit theo endpoint và danh tính.
- Swagger production được bảo vệ hoặc tắt tùy môi trường.

Header đề xuất:

```text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options: nosniff
Referrer-Policy
Permissions-Policy
```

## 6. Bảo mật PWA và Admin Web

- CSP không cho phép script tùy ý.
- Escape output và tránh `dangerouslySetInnerHTML`.
- Dependency scan cho npm.
- Service Worker chỉ cache asset và dữ liệu không nhạy cảm theo chiến lược đã duyệt.
- Không cache response chứa token, báo cáo nhạy cảm hoặc dữ liệu người dùng trên thiết bị dùng chung.
- Có chức năng đăng xuất xóa cache ứng dụng phù hợp.
- POS tự khóa phiên sau thời gian không hoạt động.

## 7. Bảo vệ webhook

- Xác thực chữ ký HMAC hoặc API key riêng cho từng connection.
- Kiểm tra timestamp để ngăn replay.
- Lưu `ExternalEventId` vào WebhookInbox với unique constraint.
- Payload được giới hạn kích thước và schema validation.
- Trả kết quả nhanh sau khi ghi inbox; xử lý nặng qua background worker.
- Secret webhook có vòng đời, rotation và audit.

## 8. Toàn vẹn tồn kho và ledger

- Reserve, confirm, balance update và ledger insert nằm trong transaction.
- Runtime DB role không có UPDATE/DELETE trên ledger.
- Trigger tùy chọn từ chối thay đổi ledger.
- Điều chỉnh tồn kho tạo bút toán bù trừ, không sửa lịch sử.
- Mọi adjustment yêu cầu permission cao và reason code.
- Có report đối chiếu `InventoryBalance` với tổng ledger.

Ví dụ quyền PostgreSQL:

```sql
REVOKE UPDATE, DELETE ON inventory_transactions FROM oism_app;
GRANT SELECT, INSERT ON inventory_transactions TO oism_app;
```

## 9. Quản lý secret và khóa

Không lưu secret trong:

- Git repository.
- Docker image.
- `appsettings.json` được commit.
- Log hoặc lỗi trả về client.

Sử dụng environment secret hoặc secret manager của nền tảng. Các secret cần rotation:

- JWT signing key.
- Database credentials.
- Redis credentials.
- Webhook secrets.
- SMTP/notification credentials.

## 10. Audit bảo mật

Các sự kiện phải audit:

- Đăng nhập thành công/thất bại, refresh, logout.
- Tạo/sửa user, role, permission và branch assignment.
- Tạo tenant, khóa tenant.
- Inventory adjustment, goods receipt confirmation, transfer confirmation.
- Order cancel/confirm thủ công.
- Export report và thay đổi cấu hình bảo mật.
- Webhook signature failure và idempotency conflict.

Audit log gồm `OccurredAt`, `TenantId`, `ActorUserId`, `Action`, `ResourceType`, `ResourceId`, `Result`, `IpAddress`, `CorrelationId`. Không lưu mật khẩu, token đầy đủ hoặc thông tin thanh toán nhạy cảm.

## 11. Bảo mật dữ liệu

- Mã hóa khi truyền qua TLS.
- Mã hóa volume, backup và snapshot ở hạ tầng.
- Dữ liệu nhạy cảm trong report phải giới hạn quyền.
- Thiết lập retention cho log, webhook payload và audit.
- Dữ liệu demo phải là dữ liệu giả, không dùng dữ liệu khách hàng thật.

## 12. Security testing trong CI/CD

- SAST cho .NET và frontend.
- Dependency vulnerability scan cho NuGet và npm.
- Secret scanning.
- Container image scan.
- Test authorization và tenant isolation.
- DAST trên môi trường staging.
- Kiểm tra migration không cấp quyền vượt mức.

Build bị chặn khi có secret hoặc lỗ hổng nghiêm trọng chưa được chấp nhận rủi ro.

## 13. Incident response

1. Phát hiện qua alert hoặc audit.
2. Phân loại phạm vi tenant và tài sản.
3. Thu hồi token, khóa user/key bị ảnh hưởng.
4. Cô lập deployment hoặc integration.
5. Bảo toàn log và bằng chứng.
6. Khắc phục, rotate secret và triển khai bản vá.
7. Đối chiếu ledger/balance nếu liên quan tồn kho.
8. Post-incident review và bổ sung test.

## 14. Tiêu chí chấp nhận

- Không endpoint nào chỉ dựa vào kiểm soát phía frontend.
- Refresh token được băm, rotation và phát hiện reuse.
- Ledger không thể UPDATE/DELETE bởi runtime role.
- Webhook replay không tạo hiệu ứng lặp.
- Secret scan và dependency scan chạy trong pipeline.
- Test IDOR và tenant isolation bắt buộc vượt qua trước release.
