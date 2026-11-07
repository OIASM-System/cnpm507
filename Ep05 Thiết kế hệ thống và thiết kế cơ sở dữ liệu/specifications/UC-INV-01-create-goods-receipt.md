# Use Case Specification: UC-INV-01 Create Goods Receipt

## 1. Details
- **ID & Name:** `UC-INV-01 Create Goods Receipt`
- **Primary Actor:** **Nhân viên kho (Warehouse Staff)**
- **Secondary Actors:** WAC Calculator, PostgreSQL Ledger Engine
- **Goal in Context:** Nhập hàng từ nhà cung cấp, tăng tồn kho vật lý (`on_hand`), tự động tính lại Giá vốn bình quân gia quyền (WAC) và ghi vào Sổ cái Append-only.

## 2. Conditions
- **Preconditions:** SKU và Nhà cung cấp đã tồn tại trong hệ thống.
- **Postconditions:** `on_hand` tăng, `AverageCost` được tính lại, 1 dòng `InventoryTransaction` loại `IN` được thêm vào.

## 3. Main Success Flow
1. Staff lập Phiếu nhập kho: Chọn Chi nhánh, Nhà cung cấp, danh sách SKU, Số lượng nhập và Giá nhập.
2. Hệ thống mở Database Transaction.
3. Tăng tồn kho thực tế: `on_hand = on_hand + Import Qty`.
4. Tự động tính đơn giá vốn WAC mới theo công thức:
$$\text{New Cost} = \frac{(\text{Old Stock} \times \text{Old Cost}) + (\text{Import Qty} \times \text{Import Price})}{\text{Old Stock} + \text{Import Qty}}$$
5. Ghi 1 dòng vào `InventoryTransaction` ledger (`Type = IN`, `BalanceAfter = new_on_hand`).
6. Commit Transaction.

## 4. Business Rules & NFRs
- **FR-INV-01 / NFR-SEC-03:** Sổ cái Append-only nghiêm cấm UPDATE/DELETE.
- **FR-COST-01:** Tự động tính COGS khi nhập hàng.