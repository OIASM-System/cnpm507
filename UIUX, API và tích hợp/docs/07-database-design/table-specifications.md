Đặc tả chi tiết các bảng dữ liệu (Table Specifications)

1. Bảng sku
- Tên bảng: sku
- Mục đích: Lưu trữ các biến thể sản phẩm (màu sắc, kích thước) và mã vạch phục vụ bán hàng tại quầy.
- Quy tắc nghiệp vụ: Mỗi SKU thuộc một sản phẩm gốc; mã SKU và mã vạch không được trùng lặp.
- Danh sách các trường dữ liệu:
  - id: Kiểu BIGSERIAL | Null: NO | Mặc định: Auto-increment | Primary Key: CÓ | Foreign Key: KHÔNG | Unique Constraint: KHÔNG | Index: CÓ | Quy tắc nghiệp vụ: Định danh duy nhất SKU
  - product_id: Kiểu BIGSERIAL | Null: NO | Mặc định: Không | Primary Key: KHÔNG | Foreign Key: CÓ (product.id) | Unique Constraint: KHÔNG | Index: CÓ | Quy tắc nghiệp vụ: Thuộc sản phẩm gốc nào
  - sku_code: Kiểu VARCHAR(50) | Null: NO | Mặc định: Không | Primary Key: KHÔNG | Foreign Key: KHÔNG | Unique Constraint: CÓ | Index: CÓ | Quy tắc nghiệp vụ: Mã SKU nội bộ của hệ thống
  - barcode: Kiểu VARCHAR(100) | Null: YES | Mặc định: NULL | Primary Key: KHÔNG | Foreign Key: KHÔNG | Unique Constraint: CÓ | Index: CÓ | Quy tắc nghiệp vụ: Mã vạch quét sản phẩm tại quầy
  - attributes: Kiểu VARCHAR(255) | Null: YES | Mặc định: NULL | Primary Key: KHÔNG | Foreign Key: KHÔNG | Unique Constraint: KHÔNG | Index: KHÔNG | Quy tắc nghiệp vụ: Thuộc tính màu sắc, kích thước

2. Bảng order
- Tên bảng: order
- Mục đích: Lưu trữ thông tin hóa đơn giao dịch bán hàng tại quầy POS.
- Quy tắc nghiệp vụ: Tổng tiền hóa đơn phải bằng tổng tiền các mặt hàng chi tiết; hóa đơn gắn liền với thu ngân lập đơn và chi nhánh.
- Danh sách các trường dữ liệu:
  - id: Kiểu BIGSERIAL | Null: NO | Mặc định: Auto-increment | Primary Key: CÓ | Foreign Key: KHÔNG | Unique Constraint: KHÔNG | Index: CÓ | Quy tắc nghiệp vụ: Mã định danh hóa đơn
  - tenant_id: Kiểu BIGSERIAL | Null: NO | Mặc định: Không | Primary Key: KHÔNG | Foreign Key: CÓ (tenant.id) | Unique Constraint: KHÔNG | Index: CÓ | Quy tắc nghiệp vụ: Phân quyền theo tổ chức
  - branch_id: Kiểu BIGSERIAL | Null: NO | Mặc định: Không | Primary Key: KHÔNG | Foreign Key: CÓ (branch.id) | Unique Constraint: KHÔNG | Index: CÓ | Quy tắc nghiệp vụ: Chi nhánh thực hiện đơn hàng
  - user_id: Kiểu BIGSERIAL | Null: NO | Mặc định: Không | Primary Key: KHÔNG | Foreign Key: CÓ (app_user.id) | Unique Constraint: KHÔNG | Index: CÓ | Quy tắc nghiệp vụ: Thu ngân lập hóa đơn
  - customer_id: Kiểu BIGSERIAL | Null: YES | Mặc định: NULL | Primary Key: KHÔNG | Foreign Key: CÓ (customer.id) | Unique Constraint: KHÔNG | Index: CÓ | Quy tắc nghiệp vụ: Khách hàng mua (nếu có)
  - total_amount: Kiểu DECIMAL(12,2) | Null: NO | Mặc định: 0.00 | Primary Key: KHÔNG | Foreign Key: KHÔNG | Unique Constraint: KHÔNG | Index: KHÔNG | Quy tắc nghiệp vụ: Tổng tiền thanh toán
  - created_at: Kiểu TIMESTAMP | Null: NO | Mặc định: CURRENT_TIMESTAMP | Primary Key: KHÔNG | Foreign Key: KHÔNG | Unique Constraint: KHÔNG | Index: CÓ | Quy tắc nghiệp vụ: Thời gian tạo hóa đơn

3. Bảng supplier
- Tên bảng: supplier
- Mục đích: Lưu trữ thông tin đối tác cung cấp hàng hóa cho kho.
- Quy tắc nghiệp vụ: Phục vụ cho phân hệ quản lý nhập kho hàng hóa từ bên ngoài.
- Danh sách các trường dữ liệu:
  - id: Kiểu BIGSERIAL | Null: NO | Mặc định: Auto-increment | Primary Key: CÓ | Foreign Key: KHÔNG | Unique Constraint: KHÔNG | Index: CÓ | Quy tắc nghiệp vụ: Định danh nhà cung cấp
  - tenant_id: Kiểu BIGSERIAL | Null: NO | Mặc định: Không | Primary Key: KHÔNG | Foreign Key: CÓ (tenant.id) | Unique Constraint: KHÔNG | Index: CÓ | Quy tắc nghiệp vụ: Thuộc tổ chức nào
  - name: Kiểu VARCHAR(150) | Null: NO | Mặc định: Không | Primary Key: KHÔNG | Foreign Key: KHÔNG | Unique Constraint: KHÔNG | Index: CÓ | Quy tắc nghiệp vụ: Tên nhà cung cấp
  - phone: Kiểu VARCHAR(20) | Null: YES | Mặc định: NULL | Primary Key: KHÔNG | Foreign Key: KHÔNG | Unique Constraint: KHÔNG | Index: KHÔNG | Quy tắc nghiệp vụ: Số điện thoại liên hệ
  - address: Kiểu TEXT | Null: YES | Mặc định: NULL | Primary Key: KHÔNG | Foreign Key: KHÔNG | Unique Constraint: KHÔNG | Index: KHÔNG | Quy tắc nghiệp vụ: Địa chỉ nhà cung cấp