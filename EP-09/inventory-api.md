# Inventory API / API tồn kho

**Critical invariant:** Inventory Ledger is append-only; no update/delete operations are defined for ledger records.
**Bất biến:** Inventory Ledger chỉ ghi nối tiếp; không định nghĩa API sửa/xóa bản ghi ledger.

## `GET /api/v1/inventory/stock` [PROPOSED]
Filters: `branchId`, `warehouseId`, `sku`, `page`, `pageSize`.
Response should distinguish on-hand, reserved and available only if the domain model defines these values separately.
Chỉ phân biệt on-hand/reserved/available nếu mô hình domain định nghĩa riêng.

## `GET /api/v1/inventory/ledger` [PROPOSED]
Read-only paginated ledger history: reference, movement type, quantity delta, timestamp, source/actor and correlation ID where available.
Lịch sử chỉ đọc gồm tham chiếu, loại biến động, lượng thay đổi, thời gian, nguồn/người thực hiện và correlation ID nếu có.

## `POST /api/v1/inventory/adjustments` [PROPOSED]
Creates a compensating ledger movement after authorization and validation; it does not edit historical entries.
Tạo bút toán bù sau kiểm tra quyền và dữ liệu; không chỉnh sửa lịch sử.
```json
{"branchId":"br_123","warehouseId":"wh_123","sku":"SKU-001","quantityDelta":-2,"reason":"Damaged stock","reference":"ADJ-001"}
```
Reason codes, approval threshold and negative-stock policy are [TBD].

## `POST /api/v1/inventory/receipts` [PROPOSED]
Records accepted incoming stock and cost inputs. Supplier procurement is not assumed to be a complete module; receipt payload and partial receipt handling are [TBD].

## WAC / COGS
Weighted-average cost is calculated in the application/domain transaction, not trusted from client input. Order line CostPrice snapshots should preserve the cost basis used for COGS. Exact formula, precision and rounding are [TBD].
WAC tính trong domain/application transaction; không tin giá vốn do client gửi. Snapshot CostPrice ở dòng đơn giữ cơ sở tính COGS; công thức/độ chính xác/làm tròn [CHỜ XÁC NHẬN].

## Invariants / Bất biến
- Ledger writes and stock balance updates must be atomic.
- Corrections use new compensating entries.
- Tenant/branch/warehouse ownership is validated.
- Prevent overselling using transactional reservation/stock checks, not UI-only checks.
- Ledger và số dư cập nhật nguyên tử; sửa sai bằng bút toán bù; xác minh quyền sở hữu; chống bán vượt tồn bằng transaction, không dựa riêng UI.
