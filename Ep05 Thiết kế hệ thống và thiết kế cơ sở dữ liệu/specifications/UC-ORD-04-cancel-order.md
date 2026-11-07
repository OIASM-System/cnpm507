# Use Case Specification: UC-ORD-04 Cancel Order & Release Stock

## 1. Details
- **ID & Name:** `UC-ORD-04 Cancel Order & Release Stock`
- **Primary Actor:** **Nhân viên / Hangfire Worker**
- **Goal in Context:** Hủy đơn hàng và giải phóng số lượng `reserved` trở lại quỹ tồn kho khả dụng `available`.

## 2. Main Success Flow
1. Đơn hàng bị hủy do Staff thao tác hoặc Hangfire quét hết hạn TTL (`FOR UPDATE SKIP LOCKED`).
2. Hệ thống mở Transaction:
   - Giảm lượng giữ chỗ: `reserved = reserved - Qty`.
   - Chuyển trạng thái `StockReservation` sang `Expired` hoặc `Cancelled`.
   - Đổi trạng thái đơn hàng sang `Cancelled`.
3. Commit Transaction (Tồn kho `available` tự động tăng trở lại).

## 3. Business Rules & NFRs
- **FR-RSE-03:** Hủy đơn hoàn trả `reserved` về `available`.
- **FR-SIM-03:** Tác vụ nền Hangfire tự động quét đơn hết hạn.