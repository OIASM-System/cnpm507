# Use Case Specification: UC-ORD-03 Confirm Order & Deduct Stock

## 1. Details
- **ID & Name:** `UC-ORD-03 Confirm Order & Deduct Stock`
- **Primary Actor:** **Nhân viên xử lý đơn hàng (Order Staff)**
- **Goal in Context:** Duyệt đơn, chụp nhanh đơn giá vốn COGS vào `OrderItem.CostPrice`, trừ `on_hand` và giảm `reserved`.

## 2. Main Success Flow
1. Staff nhấn "Xác nhận đơn hàng" ở trạng thái `Reserved`.
2. Hệ thống mở Database Transaction nguyên tử:
   - Chụp nhanh giá vốn WAC hiện tại: `OrderItem.CostPrice = AverageCost` (`FR-COST-02`).
   - Trừ kho thực tế: `on_hand = on_hand - Qty`.
   - Giải phóng giữ chỗ: `reserved = reserved - Qty`.
   - Ghi nhật ký xuất hàng Sổ cái `InventoryTransaction` (`Type = OUT`).
   - Đổi trạng thái đơn sang `Confirmed`.
3. Commit Transaction.

## 3. Business Rules & NFRs
- **FR-COST-02:** Snapshot đơn giá vốn COGS khi xác nhận xuất kho.
- **NFR-SEC-02:** Tuân thủ tính nguyên tử ACID.