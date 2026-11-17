# 📋 Requirements Analysis (Phân tích yêu cầu hệ thống) - POS PWA Project

Tài liệu này xác định và phân tích chi tiết các yêu cầu chức năng (Functional Requirements) và yêu cầu phi chức năng (Non-Functional Requirements) đối với hệ thống **POS PWA (Point of Sale Progressive Web App)**.

---

## 1. Tổng quan hệ thống
Hệ thống POS PWA được thiết kế nhằm hỗ trợ các cửa hàng bán lẻ, quán cà phê hoặc dịch vụ ăn uống thực hiện quy trình bán hàng tại quầy nhanh chóng, quản lý giỏ hàng linh hoạt, xử lý thanh toán đa phương thức và in hóa đơn trực tiếp từ trình duyệt mà không cần cài đặt ứng dụng phức tạp.

---

## 2. Yêu cầu chức năng (Functional Requirements)

Các chức năng cốt lõi của hệ thống được chia thành các phân hệ chính sau:

### 2.1. Phân hệ Quản lý Danh mục & Bán hàng (Sales & Catalog)
* **FR-01 (Tìm kiếm & Lọc sản phẩm):** Thu ngân có thể tìm kiếm sản phẩm theo tên hoặc mã, lọc theo danh mục (`[Tất cả]`, `[Sản phẩm]`, `[Khác]`).
* **FR-02 (Thêm sản phẩm vào giỏ hàng):** Hỗ trợ nút thao tác nhanh (`GET`) trên giao diện màn hình chính để thêm sản phẩm vào đơn hàng hiện tại.
* **FR-03 (Quản lý giỏ hàng - Shopping Cart):** 
  * Hiển thị danh sách sản phẩm đã chọn (định danh dạng `Sản phẩm 1`, `Sản phẩm 2`,... kèm hình ảnh thu nhỏ).
  * Cho phép thay đổi số lượng sản phẩm trực tiếp (nút `+`, `-`) hoặc xóa sản phẩm khỏi giỏ hàng.
  * Tự động tính toán giá trị tạm tính và tổng tiền (`TỔNG TIỀN`).

### 2.2. Phân hệ Thanh toán & Hóa đơn (Checkout & Receipt)
* **FR-04 (Lựa chọn phương thức thanh toán):** Hỗ trợ các hình thức thanh toán linh hoạt bao gồm: Tiền mặt (`Cash`), Chuyển khoản ngân hàng (`Transfer`), và Thẻ ATM (`Card`).
* **FR-05 (Xem trước hóa đơn - Receipt Preview):** Trước khi hoàn tất giao dịch, hệ thống hiển thị màn hình xem trước chi tiết thông tin đơn hàng (Mã đơn hàng `ORD#...`, danh sách sản phẩm, giảm giá, tổng tiền, thông tin thu ngân).
* **FR-06 (Xử lý hóa đơn):** Hỗ trợ hai hành động chính sau khi thanh toán: **Gửi hóa đơn điện tử** (`Send Invoice` qua email/SMS) và **In hóa đơn giấy** (`Print Invoice` ra máy in nhiệt POS).

### 2.3. Phân hệ Quản trị & Vận hành (Management & Sync)
* **FR-07 (Đăng nhập & Phân quyền):** Phân biệt rõ vai trò thu ngân (`Thu ngân`) và quản lý cửa hàng.
* **FR-08 (Đồng bộ dữ liệu):** Cho phép đồng bộ trạng thái đơn hàng và tồn kho thời gian thực giữa các thiết bị thu ngân.

---

## 3. Yêu cầu phi chức năng (Non-Functional Requirements)

* **NFR-01 (Hiệu năng - Performance):** Thời gian phản hồi của các thao tác thêm sản phẩm vào giỏ hàng và tính toán tổng tiền dưới $200\text{ms}$. Giao diện tải lần đầu nhanh nhờ cấu trúc PWA.
* **NFR-02 (Khả năng hoạt động ngoại tuyến - Offline Capability):** Ứng dụng phải có khả năng hoạt động ngoại tuyến cơ bản (cached qua Service Worker) để thu ngân vẫn xem được giao diện và thao tác giỏ hàng khi mất kết nối internet tạm thời.
* **NFR-03 (Tính bảo mật - Security):** Dữ liệu truyền tải giữa Frontend và Backend phải được mã hóa qua HTTPS. Xác thực người dùng bằng JSON Web Token (JWT).
* **NFR-04 (Khả năng sử dụng - Usability):** Giao diện tối ưu cho màn hình cảm ứng tại quầy thu ngân (responsive trên cả máy tính bảng và PC), bố cục trực quan, hạn chế thao tác thừa giúp thu ngân thao tác nhanh chóng.

---
