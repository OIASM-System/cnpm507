# Yêu cầu dữ liệu

> **Dự án:** Omnichannel Inventory and Sales Management System (OISM)  
> **Phiên bản:** 1.0  
> **Trạng thái:** Bản đặc tả cơ sở  
> **Ngày cập nhật:** 29/10/2026  
> **Phạm vi:** SaaS đa khách hàng, Backend .NET 8, PostgreSQL, ReactJS Admin, PWA POS, SignalR, Hangfire và Docker.

---

## 1. Nguyên tắc dữ liệu

- PostgreSQL là hệ quản trị dữ liệu giao dịch chính.
- Mọi bảng nghiệp vụ có `TenantId`; khóa/unique/index phải xét tenant scope.
- ID dùng UUID/ULID; thời gian lưu UTC (`timestamptz`).
- Tiền và cost dùng `numeric/decimal`; không dùng float/double.
- Bản ghi đã phát sinh giao dịch ưu tiên soft-disable; transaction/ledger không xóa cứng.
- `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy` áp dụng phù hợp; ledger không có thao tác cập nhật.

## 2. Cụm thực thể

### 2.1 Identity và tenant

- **Tenant:** TenantId, Name, Code, TimeZone, Currency, Status, CreatedAt.
- **User:** UserId, TenantId, Email, Phone, PasswordHash, Role, Status, LastLoginAt.
- **RefreshToken:** TokenId, TenantId, UserId, TokenHash, ExpiresAt, RevokedAt, ReplacedBy.
- **Branch:** BranchId, TenantId, Code, Name, Address, Status.
- **Warehouse:** WarehouseId, TenantId, BranchId, Code, Name, Status.

### 2.2 Catalog

- **Category:** CategoryId, TenantId, ParentId, Name, Path/Level, Status.
- **Brand:** BrandId, TenantId, Name, Status.
- **Product:** ProductId, TenantId, CategoryId, BrandId, Name, Description, ProductType, Status.
- **ProductVariant/SKU:** SKUId, TenantId, ProductId, SKUCode, VariantAttributes, Unit, Status.
- **Barcode:** BarcodeId, TenantId, SKUId, Value, Symbology, IsPrimary.
- **Price:** PriceId, TenantId, SKUId, PriceType, Amount, Currency, EffectiveFrom, EffectiveTo.

### 2.3 Inventory và cost

- **StockBalance:** TenantId, BranchId/WarehouseId, SKUId, OnHand, Reserved, Version, UpdatedAt.
- **InventoryTransaction:** TransactionId, TenantId, BranchId, SKUId, Type, Reason, Quantity, BalanceAfter, UnitCost, ReferenceType, ReferenceId, ReversalOfId, CreatedAt, CreatedBy.
- **GoodsReceipt/Header-Line:** ReceiptId, SupplierId, BranchId, Status; SKUId, Qty, UnitCost.
- **StockTransfer/Header-Line:** TransferId, FromBranchId, ToBranchId, Status; SKUId, DispatchedQty, ReceivedQty.
- **Stocktake/Header-Line:** StocktakeId, BranchId, Status, SnapshotAt; SKUId, SystemQty, CountedQty, Variance.
- **SKUCost:** TenantId, BranchId hoặc tenant-level theo quyết định thiết kế, SKUId, AverageCost, Version, UpdatedAt.
- **CostHistory:** CostHistoryId, SKUId, OldCost, NewCost, SourceReceiptId, EffectiveAt.

### 2.4 Order, reservation và payment

- **Order:** OrderId, TenantId, BranchId, Channel, ExternalOrderId, Status, Customer fields tối thiểu, Subtotal, Discount, NetTotal, Currency, IdempotencyKey, CreatedAt, ConfirmedAt, CompletedAt.
- **OrderItem:** OrderItemId, OrderId, SKUId, Quantity, UnitPrice, Discount, CostPrice, LineTotal.
- **OrderStatusHistory:** HistoryId, OrderId, FromStatus, ToStatus, Reason, ChangedBy, ChangedAt.
- **StockReservation:** ReservationId, TenantId, BranchId, OrderId, SKUId, Quantity, Status, ExpiresAt, ReleasedAt, Version.
- **Payment:** PaymentId, OrderId, Method, Amount, Status, ExternalReference, PaidAt.
- **WebhookInbox:** InboxId, TenantId, Channel, ExternalEventId, IdempotencyKey, PayloadHash/EncryptedPayload, Status, ReceivedAt, ProcessedAt, Error.
- **OutboxMessage:** MessageId, TenantId, Type, AggregateId, Payload, OccurredAt, PublishedAt, RetryCount.

### 2.5 Reporting, alert và audit

- **LowStockAlert:** AlertId, TenantId, BranchId, SKUId, Threshold, AvailableAtCreation, Status, CreatedAt, ResolvedAt.
- **DailySalesSummary:** TenantId, Date, BranchId, Channel, Revenue, COGS, GrossProfit, OrderCount.
- **AuditLog:** AuditId, TenantId, UserId, Action, EntityType, EntityId, Result, Metadata, TraceId, CreatedAt.
- **ForecastRecommendation:** RecommendationId, TenantId, BranchId, SKUId, Horizon, SuggestedQty, Inputs, Confidence/Reason, Status, CreatedAt.

## 3. Quan hệ và bội số chính

- Tenant 1–N User/Branch/Product/Order/InventoryTransaction.
- Product 1–N SKU; SKU 1–N Barcode/Price/OrderItem/InventoryTransaction.
- Branch + SKU 1–1 StockBalance.
- Order 1–N OrderItem, StatusHistory, Reservation và Payment.
- Receipt/Transfer/Stocktake 1–N line; mỗi line tham chiếu SKU.
- InventoryTransaction N–1 chứng từ qua ReferenceType/ReferenceId hoặc FK chuyên biệt.

## 4. Ràng buộc dữ liệu

| ID | Ràng buộc |
|---|---|
| DR-01 | `OnHand >= 0`, `Reserved >= 0`, `Reserved <= OnHand` trong baseline |
| DR-02 | Quantity của order/receipt/reservation > 0 |
| DR-03 | Monetary amount >= 0 và cùng currency trong một đơn |
| DR-04 | Unique `(TenantId, SKUCode)` |
| DR-05 | Unique `(TenantId, Barcode.Value)` khi không null |
| DR-06 | Unique `(TenantId, BranchId, SKUId)` cho StockBalance |
| DR-07 | Unique `(TenantId, Channel, ExternalOrderId)` khi external ID có giá trị |
| DR-08 | Unique idempotency key trong phạm vi endpoint/tenant phù hợp |
| DR-09 | `ExpiresAt > CreatedAt` cho reservation có expiry |
| DR-10 | TenantId của quan hệ cha/con phải trùng; ngăn liên kết chéo tenant |

## 5. Chỉ mục đề xuất

- InventoryTransaction: `(TenantId, SKUId, CreatedAt DESC)`, `(TenantId, BranchId, CreatedAt DESC)`, `(TenantId, ReferenceType, ReferenceId)`.
- Orders: `(TenantId, CreatedAt DESC)`, `(TenantId, Status, CreatedAt)`, `(TenantId, BranchId, Channel, CreatedAt)`.
- StockBalance: unique `(TenantId, BranchId, SKUId)`; index tìm barcode đi qua Barcode.
- Reservation: `(TenantId, Status, ExpiresAt)` phục vụ Hangfire.
- WebhookInbox: unique `(TenantId, Channel, ExternalEventId)` và/hoặc idempotency key.
- Outbox: `(PublishedAt, OccurredAt)` lọc bản ghi chưa phát.

Index cuối cùng phải được xác nhận bằng query plan và workload, tránh tạo index dư làm chậm ghi.

## 6. Append-only và đối soát

- Chặn UPDATE/DELETE InventoryTransaction bằng quyền DB và, nếu cần, trigger bảo vệ.
- Mỗi bút toán có reference, actor/source và thời gian.
- Có truy vấn kiểm tra StockBalance so với ledger theo branch/SKU.
- Rebuild projection chạy có kiểm soát, không sửa ledger gốc.
- Bút toán đảo tham chiếu bút toán bị đảo và dùng quantity tương ứng.

## 7. Concurrency và transaction

- StockBalance và SKUCost có `Version` hoặc được khóa bằng `FOR UPDATE`.
- Các dòng nhiều SKU được khóa theo thứ tự ổn định.
- Ledger, balance, reservation, cost snapshot và outbox cần cùng transaction theo use case.
- Isolation level lựa chọn phải được kiểm thử; mặc định Read Committed + row lock có thể phù hợp, nhưng kết luận dựa trên test thực tế.

## 8. Vòng đời và lưu giữ

- Ledger, order và audit giữ theo chính sách pháp lý/nghiệp vụ; baseline đồ án không tự xóa.
- Raw webhook chứa dữ liệu nhạy cảm phải tối thiểu hóa, mã hóa hoặc chỉ lưu hash/tham chiếu.
- Refresh token hết hạn/thu hồi có thể dọn theo lịch sau thời gian lưu vết.
- Dữ liệu báo cáo tổng hợp được tái tạo từ nguồn chuẩn hoặc có version logic.
- Seed demo tách khỏi production và không chứa dữ liệu cá nhân thực.

## 9. Chất lượng, import và migration

- Validate encoding, timezone, decimal separator và mapping SKU khi import.
- Import hàng loạt có chế độ dry-run, báo lỗi theo dòng và không commit nửa vời nếu chọn atomic batch.
- Migration có số phiên bản, chạy một lần, có log; thay đổi schema lớn dùng chiến lược tương thích ngược.
- Kiểm tra định kỳ: orphan FK, duplicate business key, negative balance, reservation hết hạn chưa release, ledger/reference thiếu.

## 10. Từ điển thuật ngữ dữ liệu

- **On-hand:** lượng vật lý đã ghi nhận tại chi nhánh/kho.
- **Reserved:** lượng đang giữ cho đơn chưa trừ kho.
- **Available:** lượng có thể bán, bằng on-hand trừ reserved.
- **In-transit:** lượng đã xuất kho nguồn nhưng chưa nhập kho đích.
- **COGS:** giá vốn snapshot cho lượng hàng đã bán.
- **Ledger:** chuỗi bút toán tồn kho chỉ thêm mới.
- **Canonical Order:** mô hình đơn chuẩn độc lập định dạng từng kênh.
