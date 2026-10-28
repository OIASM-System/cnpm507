# Mô tả sơ đồ Use Case tổng quan – OISM

## 1. Mục đích
Sơ đồ tổng quan mô tả phạm vi chức năng chính của **Omnichannel Inventory and Sales Management System (OISM)** và cách các nhóm người dùng hoặc hệ thống bên ngoài tương tác với hệ thống.

## 2. System Boundary
Ranh giới hệ thống là **Omnichannel Inventory and Sales Management System**. Các chức năng nằm bên trong ranh giới gồm xác thực tài khoản, bán hàng POS, quản lý sản phẩm, quản lý kho, xử lý đơn đa kênh, quản lý người dùng/chi nhánh và báo cáo.

## 3. Actors
- **Account:** tài khoản người dùng tương tác với các chức năng tài khoản như đăng nhập/đăng xuất và xem hồ sơ/đổi mật khẩu.
- **Cashier / POS Staff:** thực hiện bán hàng tại quầy, quét mã vạch/tìm SKU, thanh toán và in hóa đơn.
- **Warehouse Staff:** thực hiện nghiệp vụ kho như nhập hàng, chuyển kho, kiểm kê và xem sổ cái tồn kho.
- **Store Owner / Admin:** quản trị tenant, người dùng, vai trò, chi nhánh, sản phẩm, giá và theo dõi báo cáo.
- **Store Manager:** xử lý/duyệt đơn hàng trực tuyến và theo dõi báo cáo, cảnh báo.
- **E-Com Platform / Simulator:** gửi đơn hàng từ các kênh thương mại điện tử hoặc mô phỏng webhook.

## 4. Các nhóm Use Case
### Tài khoản và quản trị
- Login / Logout
- View Profile / Change Password
- Register Tenant Space
- Manage Users & RBAC Roles
- Manage Stores & Branches

### Bán hàng POS
- Create POS Checkout Order
- Scan Barcode / Search SKU
- Process Payment (Cash / QR)
- Print Receipt via Browser API
- Check Real-time Stock at POS

### Quản lý kho và giá vốn
- Create Goods Import Receipt
- Calculate Weighted Average Cost
- Process Warehouse Transfer
- Perform Physical Stocktake
- View Append-Only Inventory Ledger

### Danh mục sản phẩm
- Manage Products & Variants (SKU)
- Generate / Import Barcodes
- Manage Retail / Wholesale Prices
- Manage Categories & Brands

### Đơn hàng đa kênh và báo cáo
- Ingest Multi-Channel Orders
- Execute Anti-Oversell Stock Reserve
- Approve / Process Online Order
- Simulate E-Com Webhook Payload
- View Revenue & Gross Profit Report
- View AI Low-Stock & Reorder Alerts

## 5. Quan hệ được thể hiện
- `Ingest Multi-Channel Orders` **include** `Execute Anti-Oversell Stock Reserve`: tiếp nhận đơn hàng đa kênh bao gồm bước giữ hàng nhằm hạn chế bán vượt tồn kho.
- Sơ đồ còn thể hiện mối liên hệ giữa Warehouse Staff và chức năng tính giá vốn bình quân; cần kiểm tra lại đường nối nếu ý định là use case nhập hàng bao gồm tính giá vốn, vì quan hệ `include` UML thông thường nối giữa hai Use Case, không nối Actor với Use Case.

## 6. Luồng nghiệp vụ khái quát
Người dùng đăng nhập và được phân quyền; Admin quản lý dữ liệu nền; nhân viên kho cập nhật số lượng và lịch sử tồn kho; thu ngân bán hàng qua POS; đơn hàng trực tuyến được tiếp nhận và giữ hàng; quản lý theo dõi doanh thu, lợi nhuận và cảnh báo tồn kho.

## 7. Lưu ý
Sơ đồ tổng quan cho biết phạm vi và các chức năng lớn. Luồng chi tiết, điều kiện trước/sau và xử lý ngoại lệ cần được mô tả trong đặc tả Use Case của từng phân hệ.
