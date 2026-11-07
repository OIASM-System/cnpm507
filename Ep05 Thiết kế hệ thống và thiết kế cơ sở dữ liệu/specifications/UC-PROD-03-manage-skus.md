# Use Case Specification: UC-PROD-03 Manage SKUs

## 1. Details
- **ID & Name:** `UC-PROD-03 Manage SKUs`
- **Primary Actor:** **Nhân viên (Staff)**
- **Goal in Context:** Gán mã SKU duy nhất cho từng biến thể sản phẩm trong cùng một thuê bao.

## 2. Main Success Flow
1. Staff nhập mã SKU thủ công hoặc kích hoạt quy chuẩn tự động sinh SKU của hệ thống.
2. Hệ thống kiểm tra chỉ mục duy nhất: `CREATE UNIQUE INDEX ux_sku_tenant_code ON skus (tenant_id, sku_code)`.
3. Lưu mã SKU vào bản ghi `ProductVariant`.

## 3. Alternative Flows
- **2a. Trùng mã SKU trong Tenant:** Hệ thống báo lỗi `"Mã SKU đã tồn tại trong hệ thống cửa hàng"`.

## 4. Business Rules & NFRs
- **FR-PROD-02:** Mã SKU phải là duy nhất trong phạm vi một `TenantId`.