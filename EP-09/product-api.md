# Product API / API sản phẩm

Paths and DTOs are proposed. Exact product fields, variants, categories and archive semantics are [TBD].
Đường dẫn/DTO là đề xuất; trường sản phẩm, biến thể, danh mục và quy tắc lưu trữ [CHỜ XÁC NHẬN].

## `GET /api/v1/products`
Query: `page`, `pageSize`, `search`, `sku`, `status`, `branchId` (only if product visibility is branch-scoped).
Response [PROPOSED]:
```json
{"items":[{"id":"prd_123","sku":"SKU-001","name":"Sample product","unitPrice":100000,"status":"Active"}],"page":1,"pageSize":20,"totalCount":1}
```

## `GET /api/v1/products/{productId}`
Returns tenant-scoped product details.

## `POST /api/v1/products` [PROPOSED]
```json
{"sku":"SKU-001","name":"Sample product","unitPrice":100000,"description":null}
```
Validation: required fields, SKU uniqueness scope, non-negative price and decimal precision are [TBD] and must align with Domain rules.

## `PUT /api/v1/products/{productId}` [PROPOSED]
Updates mutable product fields only. Inventory ledger/cost history must not be modified through product endpoints.
Chỉ cập nhật trường sản phẩm được phép; không sửa lịch sử ledger/giá vốn qua API sản phẩm.

## `POST /api/v1/products/{productId}/archive` [PROPOSED, TBD]
Use archive/deactivation instead of hard delete when referenced by orders or ledger entries. Whether archive is in scope requires team approval.

## Authorization / Phân quyền
- Owner: full catalog control within tenant [SOURCE role principle].
- Staff: operational access only as approved [TBD].
- Cashier: product lookup for POS; catalog mutation is not presumed.
- All writes validate tenant ownership server-side.
