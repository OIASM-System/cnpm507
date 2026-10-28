# Mô tả sơ đồ Use Case – Product Catalog

## 1. Mục đích
Sơ đồ mô tả chức năng quản lý danh mục sản phẩm và các thông tin định danh/bán hàng liên quan trong OISM.

## 2. System Boundary
Ranh giới là **Product Catalog Subsystem**.

## 3. Actors
- **Warehouse Staff:** nhân viên kho, thao tác với dữ liệu sản phẩm theo quyền được cấp.
- **Store Owner / Admin:** quản trị dữ liệu danh mục sản phẩm.

## 4. Các Use Case
- **UC-PROD-01: Manage Categories & Brands:** quản lý danh mục và thương hiệu.
- **UC-PROD-02: Manage Products & Variants:** tạo/cập nhật thông tin sản phẩm và biến thể.
- **UC-PROD-02-SKU: Manage SKU Attributes:** quản lý thuộc tính SKU/biến thể để phân biệt từng mặt hàng.
- **UC-PROD-03: Generate / Import Barcodes:** tạo hoặc nhập mã vạch.
- **UC-PROD-04: Manage Retail & Wholesale Prices:** quản lý giá bán lẻ và bán sỉ.

## 5. Quan hệ
- `Manage Products & Variants` **include** `Manage SKU Attributes`: quản lý sản phẩm/biến thể bao gồm việc xác định thuộc tính SKU theo sơ đồ.

## 6. Quy tắc dữ liệu
- SKU cần định danh rõ ràng trong phạm vi tenant.
- Mã vạch cần được kiểm tra tính duy nhất theo quy tắc nghiệp vụ.
- Giá bán lẻ và bán sỉ nên được xác thực về định dạng, giá trị và thời điểm áp dụng.
- Việc sửa dữ liệu sản phẩm không được làm thay đổi ngược các thông tin lịch sử đơn hàng đã ghi nhận.

## 7. Kết quả
Sơ đồ xác định phạm vi danh mục sản phẩm. Các ràng buộc như SKU trùng, mã vạch trùng, sản phẩm ngừng kinh doanh và quyền sửa giá cần được bổ sung trong đặc tả chức năng.
