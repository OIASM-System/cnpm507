# POS API / API POS

POS routes below are proposed and must be aligned with order/inventory use cases.
Các route là đề xuất, cần khớp use case đơn hàng/tồn kho.

## `GET /api/v1/pos/products/lookup?barcode={value}` [PROPOSED]
Returns a product/price and permitted stock summary for the current tenant/branch.
Trả sản phẩm/giá và thông tin tồn được phép xem trong tenant/chi nhánh.

## `POST /api/v1/pos/checkouts` [PROPOSED]
Headers: `Authorization: Bearer ...`; `Idempotency-Key: <unique-key>` recommended.
```json
{"branchId":"br_123","items":[{"sku":"SKU-001","quantity":1}],"payment":{"method":"Cash","amountTendered":120000}}
```
Payment schema, supported methods and cash-change rules are [TBD]. Server calculates totals and validates product/stock/price. The response must report persisted order/payment state.

Success example [PROPOSED]:
```json
{"orderId":"ord_123","orderNumber":"POS-000123","status":"Completed","paymentStatus":"Confirmed","total":100000,"currency":"<tenant-configured>"}
```

## `GET /api/v1/pos/receipts/{orderId}` [PROPOSED]
Returns receipt data only when caller is authorized to access the order. Receipt must reflect persisted values.

## Idempotency and timeout / Idempotency và timeout
- Same idempotency key + same request returns the original result (policy [PROPOSED]).
- Same key + different payload returns conflict.
- If client times out, it should query order status before retrying with a new key.
- Cùng key/cùng request trả kết quả gốc; cùng key/khác payload báo conflict; timeout phải tra cứu trạng thái trước khi gửi key mới.

## Security / Bảo mật
Cashier POS access is scoped to authorized tenant and branch. The UI cannot set arbitrary tenant, price or role.
