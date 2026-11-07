**# Use Case Specification: UC-POS-02 Process POS Payment**



**## 1. Details**

**- \*\*ID \& Name:\*\* `UC-POS-02 Process POS Payment`**

**- \*\*Primary Actor:\*\* \*\*Thu ngân (Cashier)\*\***

**- \*\*Goal in Context:\*\* Thực thi chuỗi giao dịch nguyên tử \*\*Reserve -> Confirm -> Deduct\*\* trong một Database Transaction duy nhất khi thanh toán.**



**## 2. Main Success Flow**

**1. Cashier chọn hình thức (Tiền mặt / Mã QR) và nhấn "Thanh toán".**

**2. Hệ thống thực thi trong 1 Database Transaction nguyên tử duy nhất:**

&#x20;  **- Khóa bản ghi `InventoryBalance`.**

&#x20;  **- Snapshot COGS WAC vào `OrderItem.CostPrice`.**

&#x20;  **- Trừ kho thực tế `on\_hand = on\_hand - Qty`.**

&#x20;  **- Ghi nhật ký xuất Sổ cái `InventoryTransaction`.**

&#x20;  **- Chuyển đơn sang trạng thái `Completed`.**

**3. Commit Transaction và kích hoạt `UC-POS-03`.**



**## 3. Business Rules \& NFRs**

**- \*\*FR-POS-04:\*\* Quy trình thanh toán nguyên tử đơn lẻ.**

**- \*\*NFR-SEC-02:\*\* Bảo đảm tính toàn vẹn ACID.**

