# 🗺️ Use Case Diagram (Sơ đồ Use Case tổng quát) - POS PWA Project

Tài liệu này mô tả sơ đồ Use Case tổng quát của hệ thống **POS PWA (Point of Sale Progressive Web App)**, xác định rõ các tác nhân (Actors) bên ngoài và các chức năng cốt lõi mà hệ thống cung cấp.

---

## 👥 1. Xác định tác nhân (Actors)

1. **Thu ngân (Cashier):** Tác nhân chính thực hiện các thao tác bán hàng hàng ngày tại quầy (tìm kiếm sản phẩm, thêm vào giỏ hàng, xem trước hóa đơn, thanh toán và in chứng từ).
2. **Quản lý cửa hàng (Store Manager):** Tác nhân quản lý danh mục sản phẩm, theo dõi báo cáo doanh thu và kiểm tra trạng thái tồn kho.
3. **Cổng thanh toán điện tử (Payment Gateway / Bank API):** Tác nhân phụ (hệ thống ngoài) hỗ trợ xử lý giao dịch chuyển khoản hoặc thẻ ATM.

---

## 📊 2. Sơ đồ Use Case (Biểu đồ dạng Mermaid)

Bạn có thể sử dụng đoạn mã Mermaid dưới đây để hiển thị trực quan sơ đồ Use Case trên các nền tảng hỗ trợ (như GitHub, Notion, hoặc Markdown Viewer):

```mermaid
graph TD
    %% Actors
    actor Cashier as "Thu ngân (Cashier)"
    actor Manager as "Quản lý cửa hàng"
    actor Bank as "Cổng thanh toán"

    %% System Boundary
    subgraph POS_PWA_System ["Hệ thống POS PWA"]
        UC01["UC01: Đăng nhập / Phân quyền"]
        UC02["UC02: Tìm kiếm & Lọc sản phẩm"]
        UC03["UC03: Quản lý giỏ hàng (Shopping Cart)"]
        UC04["UC04: Xem trước hóa đơn (Receipt Preview)"]
        UC05["UC05: Thanh toán đơn hàng (Cash / Card / Transfer)"]
        UC06["UC06: In hoặc Gửi hóa đơn (Print / Send Receipt)"]
        UC07["UC07: Đồng bộ dữ liệu ngoại tuyến (Offline PWA)"]
        UC08["UC08: Quản lý kho & Báo cáo doanh thu"]
    end

    %% Cashier Associations
    Cashier --> UC01
    Cashier --> UC02
    Cashier --> UC03
    Cashier --> UC04
    Cashier --> UC05
    Cashier --> UC06
    Cashier --> UC07

    %% Manager Associations
    Manager --> UC01
    Manager --> UC08

    %% Bank Associations
    UC05 -.->|Xác nhận giao dịch| Bank

---
## 3. Tóm tắt USECASE chính 
| Mã Use Case | Tên Use Case | Tác nhân chính | Mô tả ngắn gọn |
| :--- | :--- | :--- | :--- |
| **UC01** | Đăng nhập hệ thống | Thu ngân, Quản lý | Xác thực tài khoản người dùng và phân quyền truy cập tính năng POS. |
| **UC02** | Tìm kiếm & Lọc sản phẩm | Thu ngân | Gõ từ khóa hoặc chọn danh mục (`[Tất cả]`, `[Sản phẩm]`, `[Khác]`) để tìm món. |
| **UC03** | Quản lý giỏ hàng | Thu ngân | Thêm sản phẩm bằng nút `GET`, tăng/giảm số lượng (`+`, `-`) hoặc xóa món. |
| **UC04** | Xem trước hóa đơn | Thu ngân | Hiển thị màn hình `Receipt Preview` rà soát đơn hàng trước khi chốt. |
| **UC05** | Thanh toán đơn hàng | Thu ngân, Bank | Chọn phương thức (Tiền mặt, Chuyển khoản, Thẻ ATM) và hoàn tất giao dịch. |
| **UC06** | In / Gửi hóa đơn | Thu ngân | Kích hoạt máy in nhiệt POS (`Print Invoice`) hoặc gửi biên lai điện tử. |
| **UC07** | Đồng bộ ngoại tuyến | Thu ngân | Lưu trữ cache qua Service Worker giúp thao tác cơ bản khi mất kết nối mạng. |
| **UC08** | Quản lý kho & Báo cáo | Quản lý | Theo dõi tồn kho, kiểm tra báo cáo doanh thu và đồng bộ dữ liệu hệ thống. |