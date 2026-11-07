# Use Case Specification: UC-INV-03 Perform Stocktake

## 1. Details
- **ID & Name:** `UC-INV-03 Perform Stocktake`
- **Primary Actor:** **Nhân viên kiểm kê (Inventory Auditor)**
- **Goal in Context:** Đếm tồn kho thực tế, đối chiếu với số dư phần mềm và phát hành giao dịch Sổ cái điều chỉnh (Adjustment Ledger).

## 2. Main Success Flow
1. Khởi tạo phiên kiểm kê kho tại Chi nhánh.
2. Nhập số lượng thực tế kiểm đếm cho các SKU.
3. Hệ thống tính chênh lệch: $\Delta = \text{Physical Qty} - \text{Software Qty}$.
4. Khi Chốt kiểm kê: Hệ thống tạo bút toán `InventoryTransaction` loại `ADJUST_IN` (nếu thừa) hoặc `ADJUST_OUT` (nếu thiếu) để đưa `on_hand` về bằng số lượng đếm thực tế.

## 3. Business Rules & NFRs
- **FR-INV-04:** Cân bằng kho bằng bút toán bù trừ Sổ cái (Compensating Transaction).