# ✅ Acceptance Criteria Writing (Tiêu chí chấp nhận) - POS PWA Project

Tài liệu này xác định các tiêu chí chấp nhận (**Acceptance Criteria**) cho từng câu chuyện người dùng (User Stories) trong hệ thống **POS PWA (Point of Sale Progressive Web App)**, sử dụng cú pháp chuẩn **Given-When-Then** (Behavior-Driven Development - BDD) làm căn cứ để lập trình và kiểm thử.

---

## 1. Phân hệ Bán hàng & Giỏ hàng (Sales & Shopping Cart)

### AC-01: Tìm kiếm và lọc sản phẩm (Cho US-01)
* **Scenario 1: Lọc sản phẩm theo danh mục**
  * **Given** thu ngân đang ở màn hình bán hàng chính (`Bán Hàng`),
  * **When** thu ngân bấm vào thẻ danh mục `[Sản phẩm]` hoặc `[Khác]`,
  * **Then** hệ thống sẽ lọc và chỉ hiển thị danh sách các sản phẩm thuộc danh mục tương ứng trên giao diện lưới.
* **Scenario 2: Tìm kiếm sản phẩm bằng thanh tìm kiếm**
  * **Given** thu ngân nhập từ khóa vào ô tìm kiếm ở phía trên,
  * **When** hệ thống nhận diện từ khóa (ví dụ: tên hoặc mã sản phẩm),
  * **Then** danh sách sản phẩm hiển thị sẽ tự động cập nhật các món khớp với từ khóa tìm kiếm.

### AC-02: Thêm sản phẩm vào giỏ hàng bằng nút `GET` (Cho US-02)
* **Scenario 1: Thêm thành công sản phẩm vào giỏ**
  * **Given** thu ngân đang nhìn thấy danh sách các thẻ sản phẩm (chứa nút đỏ `GET`),
  * **When** thu ngân bấm vào nút `GET` trên một sản phẩm bất kỳ,
  * **Then** sản phẩm đó lập tức được đưa vào khu vực giỏ hàng (`Shopping Cart`) ở cột bên phải, đồng thời cập nhật số lượng và tổng tiền tạm tính.

### AC-03: Quản lý chi tiết giỏ hàng (Cho US-03)
* **Scenario 1: Tăng hoặc giảm số lượng sản phẩm trong giỏ**
  * **Given** sản phẩm đã có trong giỏ hàng với số lượng lớn hơn 1,
  * **When** thu ngân bấm nút cộng `+` hoặc trừ `-` trên dòng sản phẩm đó,
  * **Then** số lượng sản phẩm và giá tiền tổng cộng của dòng đó được tính toán lại ngay lập tức.
* **Scenario 2: Xóa sản phẩm khỏi giỏ hàng**
  * **Given** sản phẩm đang nằm trong giỏ hàng,
  * **When** thu ngân thực hiện thao tác xóa sản phẩm khỏi giỏ,
  * **Then** sản phẩm biến mất khỏi danh sách và tổng tiền của đơn hàng được cập nhật lại tương ứng.

---

## 2. Phân hệ Thanh toán & Hóa đơn (Checkout & Receipt Preview)

### AC-04: Xem trước hóa đơn - Receipt Preview (Cho US-04)
* **Scenario 1: Chuyển sang màn hình xem trước hóa đơn**
  * **Given** thu ngân đã hoàn tất việc chọn món vào giỏ hàng và kiểm tra thông tin đơn hàng,
  * **When** thu ngân bấm nút **Thanh Toán** (màu xanh lá),
  * **Then** giao diện cột bên phải chuyển sang chế độ xem trước hóa đơn (**Receipt Preview**), hiển thị mã đơn hàng (ví dụ: `ORD#0001-14102026`), danh sách chi tiết sản phẩm, khoản tạm tính, giảm giá và tổng tiền cần thanh toán.

### AC-05: Lựa chọn phương thức thanh toán (Cho US-05)
* **Scenario 1: Chọn hình thức thanh toán linh hoạt**
  * **Given** hệ thống đang ở màn hình thanh toán,
  * **When** thu ngân chọn một trong các nút phương thức (`TIỀN MẶT / CASH`, `CHUYỂN KHOẢN`, hoặc `THẺ ATM`),
  * **Then** hệ thống ghi nhận phương thức thanh toán được chọn và làm nổi bật nút đó trên giao diện.

### AC-06: In hoặc Gửi hóa đơn (Cho US-06)
* **Scenario 1: In hóa đơn giấy qua máy in nhiệt**
  * **Given** giao dịch thanh toán đã được xác nhận thành công,
  * **When** thu ngân bấm vào nút **In hóa đơn** (`Print Invoice`),
  * **Then** lệnh in được gửi trực tiếp đến máy in nhiệt POS để xuất bản chứng từ giấy cho khách hàng.
* **Scenario 2: Gửi hóa đơn điện tử**
  * **Given** giao dịch đã hoàn tất,
  * **When** thu ngân bấm nút **Gửi hóa đơn** (`Send Invoice`),
  * **Then** hệ thống kích hoạt hộp thoại nhập thông tin để gửi biên lai điện tử qua email/SMS cho khách.

---
