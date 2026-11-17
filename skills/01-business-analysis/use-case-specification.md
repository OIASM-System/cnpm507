# 📑 Use Case Specification (Đặc tả Use Case) - POS PWA Project

Tài liệu này mô tả đặc tả chi tiết cho các Use Case cốt lõi của hệ thống **POS PWA (Point of Sale Progressive Web App)**, cụ thể hóa luồng sự kiện chính, luồng ngoại lệ và điều kiện tiên quyết khi thu ngân thao tác trên ứng dụng.

---

## 🛒 UC-01: Quản lý giỏ hàng và Thêm sản phẩm (Manage Shopping Cart)

### 1. Mô tả ngắn (Brief Description)
Cho phép thu ngân tìm kiếm sản phẩm, thêm sản phẩm vào giỏ hàng bằng thao tác nhanh, điều chỉnh số lượng hoặc xóa món hàng trước khi tiến hành thanh toán.

### 2. Tác nhân (Actors)
* **Thu ngân (Cashier)**

### 3. Điều kiện tiên quyết (Preconditions)
* Thu ngân đã đăng nhập thành công vào hệ thống POS PWA và đang ở giao diện màn hình bán hàng (`Bán Hàng`).

### 4. Luồng sự kiện chính (Main Flow)
1. Thu ngân tìm kiếm sản phẩm bằng cách nhập từ khóa hoặc lọc theo danh mục (`[Tất cả]`, `[Sản phẩm]`, `[Khác]`).
2. Hệ thống hiển thị danh sách các thẻ sản phẩm phù hợp.
3. Thu ngân bấm vào nút `GET` trên thẻ sản phẩm cần mua.
4. Hệ thống tự động thêm sản phẩm vào khu vực **Giỏ hàng (`Shopping Cart`)** ở cột bên phải, khởi tạo số lượng là `1` và cập nhật giá trị tạm tính.
5. Nếu thu ngân muốn thay đổi, họ bấm nút cộng `+` hoặc trừ `-` trên dòng sản phẩm trong giỏ hàng.
6. Hệ thống cập nhật lại số lượng và tổng tiền tương ứng ngay lập tức.

### 5. Luồng ngoại lệ / Thay thế (Alternative Flows)
* **5a. Xóa sản phẩm khỏi giỏ hàng:**
  * 1. Thu ngân chọn biểu tượng xóa hoặc giảm số lượng về `0` trên dòng sản phẩm.
  * 2. Hệ thống gỡ bỏ sản phẩm khỏi danh sách giỏ hàng và cập nhật lại tổng tiền.

### 6. Điều kiện sau (Postconditions)
* Giỏ hàng lưu trữ chính xác danh sách sản phẩm, số lượng và tổng tiền tạm tính để sẵn sàng chuyển sang bước thanh toán.

---

## 💳 UC-02: Thanh toán và Xem trước hóa đơn (Checkout & Receipt Preview)

### 1. Mô tả ngắn (Brief Description)
Cho phép thu ngân rà soát lại thông tin đơn hàng thông qua màn hình xem trước hóa đơn (**Receipt Preview**), chọn phương thức thanh toán và xác nhận hoàn tất giao dịch.

### 2. Tác nhân (Actors)
* **Thu ngân (Cashier)**

### 3. Điều kiện tiên quyết (Preconditions)
* Giỏ hàng (`Shopping Cart`) đã có ít nhất một sản phẩm hợp lệ.

### 4. Luồng sự kiện chính (Main Flow)
1. Thu ngân kiểm tra lại các món trong giỏ và bấm nút **Thanh Toán** (màu xanh lá cây) ở cuối cột bên phải.
2. Hệ thống chuyển đổi giao diện sang màn hình **Xem trước hóa đơn (Receipt Preview)**, hiển thị:
   * Mã đơn hàng tự động (Ví dụ: `ORD#0001-14102026`).
   * Chi tiết danh sách sản phẩm đã mua kèm đơn giá và thành tiền.
   * Khoản tạm tính, giảm giá (nếu có) và **TỔNG CẦN THANH TOÁN**.
3. Thu ngân chọn phương thức thanh toán (Tiền mặt `CASH`, Chuyển khoản, hoặc Thẻ ATM).
4. Thu ngân xác nhận hoàn tất thanh toán.
5. Hệ thống ghi nhận đơn hàng thành công vào cơ sở dữ liệu và trừ kho tự động.

### 5. Luồng ngoại lệ / Thay thế (Alternative Flows)
* **3a. Hủy hoặc quay lại chỉnh sửa giỏ hàng:**
  * Thu ngân bấm quay lại màn hình bán hàng để chỉnh sửa thêm bớt sản phẩm trước khi chốt đơn.

### 6. Điều kiện sau (Postconditions)
* Đơn hàng được lưu trữ ở trạng thái hoàn thành (`Completed`) và chuyển sang giai đoạn in chứng từ.

---

## 🖨️ UC-03: In hoặc Gửi hóa đơn (Print / Send Receipt)

### 1. Mô tả ngắn (Brief Description)
Cho phép thu ngân xuất bản chứng từ hóa đơn giấy qua máy in nhiệt hoặc gửi biên lai điện tử cho khách hàng sau khi thanh toán thành công.

### 2. Tác nhân (Actors)
* **Thu ngân (Cashier)**, **Khách hàng**

### 3. Điều kiện tiên quyết (Preconditions)
* Giao dịch thanh toán (UC-02) đã được xử lý và ghi nhận thành công trên hệ thống.

### 4. Luồng sự kiện chính (Main Flow)
1. Sau khi màn hình **Receipt Preview** hiển thị kết quả giao dịch thành công, thu ngân có hai lựa chọn hành động:
   * **Lựa chọn A (In giấy):** Thu ngân bấm nút **In hóa đơn** (`Print Invoice`). Hệ thống gọi API trình duyệt kích hoạt máy in nhiệt POS để xuất biên lai giấy.
   * **Lựa chọn B (Gửi điện tử):** Thu ngân bấm nút **Gửi hóa đơn** (`Send Invoice`), nhập thông tin liên hệ để gửi hóa đơn qua email/SMS cho khách hàng.
2. Hệ thống hoàn tất tác vụ và làm mới màn hình để chuẩn bị tiếp nhận đơn hàng tiếp theo.

### 5. Điều kiện sau (Postconditions)
* Hóa đơn được in ra thành công hoặc gửi đi điện tử, kết thúc vòng đời của một phiên giao dịch bán hàng tại quầy.

---
