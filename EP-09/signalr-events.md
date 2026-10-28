# SignalR Events / Sự kiện SignalR

**Status:** Proposed event contract. Exact hub path, event names and payload schemas require implementation agreement.
**Trạng thái:** Hợp đồng sự kiện đề xuất; cần thống nhất hub, tên sự kiện và schema.

## Purpose / Mục đích
Notify authorized clients about durable state changes such as order updates, inventory changes and alerts. SignalR is a notification channel, not the source of truth; clients should refetch authoritative resources after reconnect or missed events.
Thông báo thay đổi đã lưu bền vững như đơn hàng, tồn kho, cảnh báo. SignalR không phải nguồn dữ liệu chuẩn; client cần tải lại dữ liệu sau reconnect/mất sự kiện.

## Proposed event catalogue / Danh mục đề xuất
| Event | Meaning / Ý nghĩa | Suggested payload |
|---|---|---|
| `OrderUpdated` | Order state changed / Đơn đổi trạng thái | `orderId`, `status`, `occurredAt`, `correlationId` |
| `InventoryChanged` | Stock changed / Tồn thay đổi | `branchId`, `sku`, `occurredAt`, `correlationId` |
| `LowStockAlert` | Threshold reached / Chạm ngưỡng tồn thấp | `branchId`, `sku`, `severity`, `occurredAt` |
| `WebhookProcessed` | Simulated/external event processed / Webhook xử lý xong | `eventId`, `status`, `correlationId` |

## Authorization / Phân quyền
- Authenticate hub connections with the approved JWT strategy.
- Join groups only after server-side tenant and branch authorization.
- Never accept arbitrary group names or tenant IDs from clients.
- Avoid broadcasting sensitive order/customer/payment details.
- Xác thực kết nối; chỉ tham gia group sau khi server kiểm tra tenant/chi nhánh; không cho client tự chọn group/tenant; tránh broadcast dữ liệu nhạy cảm.

## Reliability / Độ tin cậy
- Events may be delayed, duplicated or missed; include identifiers/timestamps and make handlers idempotent.
- Use durable outbox/background processing if required by the final architecture [PROPOSED].
- Event có thể trễ/trùng/mất; cần ID/thời gian và handler idempotent; outbox/background là [ĐỀ XUẤT].
