# Logging và Monitoring OISM

## 1. Mục tiêu

Cung cấp khả năng quan sát toàn diện cho request API, transaction tồn kho, Hangfire, SignalR, PostgreSQL và trải nghiệm POS; đồng thời bảo vệ dữ liệu nhạy cảm và hỗ trợ điều tra sự cố.

## 2. Ba trụ cột observability

- **Logs**: sự kiện có cấu trúc và ngữ cảnh.
- **Metrics**: số đo theo thời gian để dashboard và alert.
- **Traces**: theo dõi luồng xuyên API, DB, worker và integration.

Khuyến nghị dùng OpenTelemetry để chuẩn hóa instrumentation; backend có thể dùng structured logging và exporter phù hợp môi trường.

## 3. Structured logging

Mỗi log quan trọng gồm:

```json
{
  "timestamp": "2026-10-29T00:00:00Z",
  "level": "Information",
  "message": "Order reserved",
  "service": "oism-api",
  "environment": "production",
  "traceId": "...",
  "spanId": "...",
  "correlationId": "...",
  "tenantId": "...",
  "userId": "...",
  "branchId": "...",
  "orderId": "...",
  "durationMs": 72
}
```

Dùng message template ổn định, không nối chuỗi tùy ý.

## 4. Correlation và trace propagation

- Chấp nhận hoặc tạo `X-Correlation-ID` với định dạng hợp lệ.
- Trả correlation ID trong response.
- Propagate W3C Trace Context qua HTTP và background message.
- Outbox event chứa trace/correlation context cần thiết.
- Hangfire job tạo child span và giữ TenantId.

## 5. Mức log

- `Trace`: chỉ dùng chẩn đoán tạm thời, không bật mặc định production.
- `Debug`: luồng kỹ thuật chi tiết, không chứa secret.
- `Information`: request hoàn tất, state transition và job thành công quan trọng.
- `Warning`: retry, cache failure, webhook invalid, lock wait cao.
- `Error`: operation thất bại không mong đợi.
- `Critical`: database unavailable kéo dài, invariant violation, nguy cơ mất dữ liệu.

Không log mọi lần đọc SKU ở Information nếu tạo tải log quá lớn; sử dụng metric/trace sampling.

## 6. Dữ liệu cấm ghi log

- Mật khẩu, password hash.
- JWT và refresh token đầy đủ.
- Webhook secret/API key.
- Connection string.
- Nội dung QR thanh toán nhạy cảm.
- Dữ liệu cá nhân không cần thiết.
- Toàn bộ request/response body theo mặc định.

Áp dụng masking cho email/số điện thoại nếu cần chẩn đoán.

## 7. Audit log và application log

Audit log không thay thế application log.

- Application log phục vụ vận hành và debug, có retention ngắn hơn.
- Audit log phục vụ truy vết hành động người dùng và thay đổi nhạy cảm, có tính bất biến và retention riêng.

Audit các hành động: login, thay đổi quyền, adjustment, receipt confirmation, transfer receive, order cancel/confirm, export report và thay đổi tenant.

## 8. Metrics nghiệp vụ

- `orders_created_total{channel}`.
- `orders_by_status{status}`.
- `gross_revenue_total` và `cogs_total` chỉ dùng nếu hệ thống metric phù hợp; tránh label cardinality cao.
- `inventory_reservations_total{result}`.
- `inventory_low_stock_skus`.
- `webhook_events_total{channel,result}`.
- `reservation_expired_total`.

Không dùng TenantId làm label cho hệ thống metric công cộng nếu số tenant lớn; có thể dùng dashboard tenant-specific từ database/reporting.

## 9. Metrics kỹ thuật

- API request rate, error rate, duration p50/p95/p99.
- POS barcode lookup p95 dưới 200ms.
- Order write p95 dưới 500ms.
- Report query dưới 2 giây với phạm vi dữ liệu mục tiêu.
- DB connection pool usage.
- Query duration và slow query count.
- Lock wait, deadlock, transaction retry.
- Redis hit rate, latency, memory và eviction.
- Hangfire queue length, job age, failure/retry.
- SignalR active connections và send failures.
- CPU, memory, disk và container restart.

## 10. Health checks

Các endpoint:

```text
/health/live   - process sống, không kiểm tra phụ thuộc nặng
/health/ready  - sẵn sàng nhận traffic, kiểm tra PostgreSQL và phụ thuộc bắt buộc
/health/startup - migration/configuration đã sẵn sàng
```

Redis có thể là degraded thay vì unhealthy nếu chức năng cốt lõi có fallback. Không trả secret hoặc chi tiết hạ tầng trong health response public.

## 11. Dashboard đề xuất

### API Overview

- Requests/sec, p95 latency, 4xx, 5xx.
- Top slow endpoints.
- Instance health và restart.

### Inventory Integrity

- Reservation conflicts.
- Lock wait/deadlocks.
- Invariant violation.
- Balance-ledger reconciliation status.

### Integration

- Webhook received/succeeded/failed/duplicated.
- Inbox age và outbox backlog.
- SignalR delivery failure.

### Background Jobs

- Queue length, oldest job age.
- Failed jobs và retries.
- Expired reservation processing lag.
- Daily report completion.

### Data Layer

- DB CPU/storage/connections.
- Slow queries.
- Redis health.

## 12. Alerting

| Mức | Điều kiện ví dụ | Phản ứng |
|---|---|---|
| Critical | Inventory invariant violation > 0 | Dừng luồng ảnh hưởng, điều tra ngay |
| Critical | DB unavailable > 5 phút | Incident response |
| High | API 5xx vượt ngưỡng 5 phút | Kiểm tra release/phụ thuộc |
| High | Outbox backlog tăng liên tục | Kiểm tra worker |
| High | Deadlock tăng bất thường | Phân tích lock ordering/query |
| Medium | p95 POS lookup > 200ms | Tối ưu/cache/index |
| Medium | Hangfire oldest job quá SLA | Tăng worker/sửa job |
| Low | Disk/Redis memory gần ngưỡng | Lập kế hoạch dung lượng |

Ngưỡng cụ thể phải được hiệu chỉnh từ baseline, tránh alert fatigue.

## 13. Retention và truy cập

- Application logs: ví dụ 14-30 ngày.
- Security/audit logs: theo chính sách tổ chức, thường dài hơn.
- Traces: sampling và retention ngắn hơn log.
- Metrics: đủ dài để xem xu hướng và capacity.
- Quyền xem log theo least privilege.
- Ghi audit việc truy cập hoặc export log nhạy cảm nếu cần.

## 14. Runbook sự cố mẫu

### Oversell hoặc invariant violation

1. Xác định TenantId, BranchId, SkuId và CorrelationId.
2. Tạm dừng endpoint/consumer gây lỗi nếu cần.
3. Đối chiếu balance, reservation, order và ledger.
4. Không sửa/xóa ledger; tạo adjustment có phê duyệt.
5. Kiểm tra lock wait, deadlock và deployment gần nhất.
6. Bổ sung regression/concurrency test.

### Webhook backlog

1. Kiểm tra inbox/outbox age và Hangfire queue.
2. Kiểm tra lỗi chữ ký, payload schema và DB latency.
3. Scale worker nếu job an toàn để song song.
4. Replay theo idempotency key, không chèn trực tiếp đơn trùng.

## 15. Kiểm thử observability

- Trace xuyên request -> DB -> outbox -> worker.
- Log masking token và password.
- Alert thử nghiệm ở staging.
- Health check khi PostgreSQL/Redis bị ngắt.
- Dashboard hiển thị đúng SLI.
- Correlation ID xuất hiện trong response và log.

## 16. Tiêu chí chấp nhận

- 100% request có trace/correlation ID.
- State transition quan trọng có structured log và audit phù hợp.
- Không có secret trong log scan.
- Có dashboard cho API, inventory, integration, job và database.
- Có alert đặc biệt cho invariant violation và outbox backlog.
