# 📝 User Story Writing (Viết câu chuyện người dùng) - POS PWA Project

Tài liệu này định nghĩa các câu chuyện người dùng (**User Stories**) theo chuẩn Agile Scrum cho hệ thống **POS PWA (Point of Sale Progressive Web App)**, giúp đội ngũ phát triển hiểu rõ góc nhìn của người dùng cuối (Thu ngân, Quản lý) khi thao tác trên ứng dụng.

---

## 🎯 Cấu trúc chuẩn của một User Story
Mỗi User Story được viết theo cấu trúc quen thuộc:
> **Là một** [Vai trò người dùng], **tôi muốn** [Tính năng/Hành động muốn thực hiện], **để** [Lợi ích/Giá trị mang lại].

---

## 📋 Danh sách User Stories cốt lõi cho hệ thống POS PWA

### 1. Phân hệ Bán hàng & Giỏ hàng (Sales & Shopping Cart)

* **US-01: Tìm kiếm và lọc sản phẩm nhanh**
  * **Là một** Thu ngân,
  * **Tôi muốn** tìm kiếm sản phẩm theo tên/mã hoặc lọc theo danh mục (`[Tất cả]`, `[Sản phẩm]`, `[Khác]`),
  * **Để** nhanh chóng tìm thấy món hàng mà khách hàng yêu cầu mà không mất thời gian lật tìm thủ công.

* **US-02: Thêm sản phẩm vào giỏ hàng bằng thao tác nhanh**
  * **Là một** Thu ngân,
  * **Tôi muốn** bấm vào nút `GET` trên các thẻ sản phẩm ở màn hình chính,
  * **Để** đưa ngay sản phẩm đó vào danh sách đơn hàng hiện tại (`Shopping Cart`) một cách mượt mà.

* **US-03: Quản lý chi tiết giỏ hàng**
  * **Là một** Thu ngân,
  * **Tôi muốn** xem danh sách sản phẩm trong giỏ (`Sản phẩm 1`, `Sản phẩm 2`,...), điều chỉnh tăng/giảm số lượng (`+`, `-`) hoặc xóa món,
  * **Để** dễ dàng cập nhật lại đơn hàng nếu khách đổi ý trước khi thanh toán.

---

### 2. Phân hệ Thanh toán & Hóa đơn (Checkout & Receipt Preview)

* **US-04: Xem trước hóa đơn trước khi chốt đơn**
  * **Là một** Thu ngân,
  * **Tôi muốn** hệ thống hiển thị màn hình xem trước hóa đơn (**Receipt Preview**) bao gồm mã đơn hàng (`ORD#...`), danh sách sản phẩm, tạm tính và tổng tiền cần trả,
  * **Để** rà soát lại thông tin chính xác với khách hàng trước khi bấm nút thanh toán.

* **US-05: Lựa chọn phương thức thanh toán linh hoạt**
  * **Là một** Thu ngân,
  * **Tôi muốn** chọn nhanh các hình thức thanh toán (Tiền mặt `CASH`, Chuyển khoản ngân hàng, hoặc Thẻ ATM),
  * **Để** phục vụ đa dạng nhu cầu trả tiền của khách hàng tại quầy.

* **US-06: In hoặc gửi hóa đơn điện tử**
  * **Là một** Thu ngân,
  * **Tôi muốn** bấm nút in hóa đơn (`Print Invoice`) để máy in nhiệt xuất giấy ra ngay hoặc gửi hóa đơn qua email (`Send Invoice`),
  * **Để** hoàn tất giao dịch và cung cấp chứng từ mua hàng cho khách.

---

### 3. Phân hệ Vận hành & Hệ thống (Operations)

* **US-07: Hoạt động ngoại tuyến cơ bản (Offline PWA)**
  * **Là một** Thu ngân,
  * **Tôi muốn** ứng dụng vẫn mở được giao diện và thao tác tạm thời ngay cả khi mạng Internet bị chập chờn hoặc mất kết nối,
  * **Để** không làm gián đoạn quá trình phục vụ khách hàng tại quầy.

---
