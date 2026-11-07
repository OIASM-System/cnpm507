# Use Case Specification: UC-INV-04 View Inventory Ledger

## 1. Details
- **ID & Name:** `UC-INV-04 View Inventory Ledger`
- **Primary Actor:** **Quản lý / Nhân viên (Manager / Staff)**
- **Goal in Context:** Truy vấn Sổ cái giao dịch tồn kho chỉ-ghi-thêm phục vụ kiểm toán.

## 2. Main Success Flow
1. Người dùng chọn bộ lọc: Chi nhánh, SKU, Khoảng thời gian, Loại giao dịch.
2. Hệ thống thực hiện truy vấn trên chỉ mục tối ưu: `CREATE INDEX ix_ledger_tenant_created ON inventory_transactions (tenant_id, created_at DESC)`.
3. Hiển thị danh sách lịch sử biến động kho kèm `BalanceAfter` và `ReferenceId`.

## 3. Business Rules & NFRs
- **NFR-TENANT-02:** Tối ưu hóa truy vấn trên hàng triệu dòng Sổ cái.