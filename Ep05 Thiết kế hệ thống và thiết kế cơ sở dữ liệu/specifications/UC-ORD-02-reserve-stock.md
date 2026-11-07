# Use Case Specification: UC-ORD-02 Reserve Stock (Anti-Oversell Engine)

## 1. Details
- **ID & Name:** `UC-ORD-02 Reserve Stock`
- **Primary Actor:** **Order Application Engine**
- **Secondary Actors:** PostgreSQL Concurrency Lock Manager
- **Goal in Context:** Khóa giữ chỗ tồn kho `reserved` cho đơn hàng trực tuyến nhằm ngăn chặn tuyệt đối tình trạng bán quá hàng (Anti-Oversell).

## 2. Conditions
- **Preconditions:** Đơn hàng ở trạng thái `Draft`.
- **Postconditions:** `reserved` tăng, đơn chuyển sang `Reserved`. Nếu thiếu hàng, đơn chuyển sang `ReservationFailed`.

## 3. Main Success Flow (Anti-Oversell Core Flow)
1. Hệ thống mở Database Transaction.
2. Khóa dòng dữ liệu tồn kho bằng Khóa bi quan: `SELECT ... FOR UPDATE` trên bảng `InventoryBalance` theo thứ tự `SKUId` tăng dần (tránh Deadlock).
3. Tính tồn kho khả dụng: `available = on_hand - reserved`.
4. Kiểm tra điều kiện: Nếu `available >= Purchased Qty` trên tất cả OrderItems:
   - Tăng `reserved = reserved + Purchased Qty`.
   - Tạo bản ghi `StockReservation` kèm hạn TTL.
   - Đổi trạng thái đơn sang `Reserved`.
   - Ghi sự kiện vào Transactional Outbox.
5. Commit Transaction.

## 4. Exception Flows
- **4a. Tồn kho khả dụng không đủ (`available < Purchased Qty`):** Rollback Transaction, chuyển đơn sang `ReservationFailed`, trả về `409 Conflict`.

## 5. Business Rules & NFRs
- **FR-RSE-01 / FR-RSE-02:** Tính khả dụng và giữ chỗ tồn kho.
- **NFR-PERF-02:** Xử lý Flash Sale (50 request/SKU đồng thời) không âm kho.