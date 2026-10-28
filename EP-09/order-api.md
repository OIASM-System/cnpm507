# Order API / API đơn hàng

Order states and legal transitions must match the Domain state machine. Values below are illustrative, not final enums.
Trạng thái và chuyển trạng thái phải khớp state machine Domain. Giá trị dưới đây chỉ minh họa.

## `GET /api/v1/orders`
Filters [PROPOSED]: `page`, `pageSize`, `status`, `channel`, `branchId`, `from`, `to`.
Only returns orders within caller's tenant and permitted scope.

## `GET /api/v1/orders/{orderId}`
Returns order header, lines, channel, state, payment summary and reservation information where available.

## `POST /api/v1/orders` [PROPOSED]
Creates a manual order or normalized order record only if this path is approved for the relevant source.
```json
{"channel":"POS","branchId":"br_123","items":[{"sku":"SKU-001","quantity":2}],"externalOrderId":null}
```
Client-supplied price/cost is not authoritative; server resolves product and pricing rules. Use an idempotency key for retriable creation.

## `POST /api/v1/orders/{orderId}/confirm` [PROPOSED]
Validates current state and atomically applies the appropriate reservation/deduction policy. Exact timing (reserve on creation vs confirmation) is [TBD].

## `POST /api/v1/orders/{orderId}/cancel` [PROPOSED]
Allowed only for states permitted by the approved state machine. Release reservation when applicable, exactly once. Cancellation after deduction/refund policy is [TBD].

## `POST /api/v1/orders/{orderId}/release-reservation` [PROPOSED/internal]
Should be callable only by authorized workflow/background job; must be idempotent and verify reservation expiry/current state.

## Transaction rules / Quy tắc giao dịch
- Order creation, reservation and stock mutation must be atomic where the source requirements specify.
- Roll back all writes if any critical step fails.
- Use concurrency controls (transaction isolation/locking/concurrency token) to prevent overselling.
- Duplicate external events must not create duplicate orders.
- Tạo đơn/giữ tồn/thay đổi tồn phải nguyên tử theo yêu cầu; lỗi bước trọng yếu thì rollback; dùng kiểm soát đồng thời; sự kiện ngoài trùng không tạo đơn trùng.

## Response/error semantics
`409 Conflict` for invalid state transition, insufficient stock or duplicate business key (specific code distinguishes cause). Never silently coerce a forbidden transition.
