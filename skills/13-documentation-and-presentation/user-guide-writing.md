# 📖 End-User Manual & Operation Guide - POS PWA Project

Tài liệu này quy định cấu trúc và nội dung **Hướng dẫn Sử dụng Phần mềm (User Guide)** dành cho người dùng cuối tại cửa hàng trong hệ thống **POS PWA (Point of Sale Progressive Web App)**. Thay vì sử dụng thuật ngữ kỹ thuật lập trình phức tạp, tài liệu hướng dẫn được viết bằng ngôn ngữ nghiệp vụ trực quan, phân tách rõ ràng theo từng **Vai trò sử dụng thực tế tại cửa hàng**: **Nhân viên Thu ngân (`Cashier`)** và **Quản lý Cửa hàng (`Manager`)**, kèm theo sổ tay xử lý sự cố nhanh tại quầy (**Troubleshooting Playbook**).

---

## 📱 1. Hướng dẫn Cài đặt Ứng dụng POS PWA lên Thiết bị (Không qua App Store)

| Thiết bị sử dụng tại quầy | Trình duyệt khuyến nghị | Các bước cài đặt thành ứng dụng độc lập |
| :--- | :--- | :--- |
| **Máy tính Windows / macOS** | Google Chrome hoặc Microsoft Edge | 1. Truy cập địa chỉ hệ thống POS của cửa hàng.<br>2. Bấm biểu tượng **Cài đặt ứng dụng (`Install App`)** ở góc phải thanh địa chỉ.<br>3. Bấm **Cài đặt** $\rightarrow$ Biểu tượng **Smart POS** xuất hiện ngay ngoài màn hình Desktop. |
| **iPad / iPhone (iOS / iPadOS)** | Trình duyệt Safari | 1. Mở trang web POS trên Safari.<br>2. Bấm nút **Chia sẻ (`Share`)** ở thanh công cụ.<br>3. Chọn **Thêm vào Màn hình chính (`Add to Home Screen`)** $\rightarrow$ Bấm **Thêm**. |
| **Máy tính bảng Android** | Google Chrome | 1. Mở trang web POS trên Chrome.<br>2. Bấm biểu tượng menu **3 chấm (`⋮`)** ở góc trên bên phải.<br>3. Chọn **Cài đặt ứng dụng (`Install app`)**. |

---

## 🛒 2. Quy trình Vận hành Dành cho Nhân viên Thu ngân (`Cashier`)

### 2.1. Đăng nhập & Bắt đầu ca bán hàng
1. Nhập **Mã cửa hàng (`Tenant Code`)**, **Tên đăng nhập** và **Mật khẩu** được Quản lý cấp.
2. Quan sát đèn trạng thái ở góc trên màn hình:
   * 🟢 **Trực tuyến:** Hệ thống đang kết nối máy chủ, tồn kho đồng bộ tức thì với các quầy khác.
   * 🔴 **Chế độ Ngoại tuyến:** Quầy đang mất mạng Internet, thu ngân vẫn quét mã và thanh toán tiền mặt bình thường.

### 2.2. Thao tác Bán hàng & Thanh toán 3 Bước
1. **Thêm món vào giỏ:** Chạm trực tiếp vào thẻ sản phẩm trên màn hình, gõ tên/mã SKU (`F2`), hoặc dùng máy quét mã vạch quét trực tiếp lên tem sản phẩm (nghe tiếng *"Bíp"* ngắn là món đã vào giỏ).
2. **Điều chỉnh giỏ hàng:** Bấm `+` / `-` để đổi số lượng, bấm **Giữ đơn (`F4`)** nếu khách cần lấy thêm đồ và muốn phục vụ khách sau trước.
3. **Thanh toán & In biên lai (`F9`):**
   * **Tiền mặt:** Chọn nhanh mệnh giá tiền khách đưa (hệ thống tự tính chính xác tiền thối lại) $\rightarrow$ Bấm **Xác nhận thu tiền (`Enter`)**.
   * **Chuyển khoản VietQR:** Chọn phương thức **VietQR**, đưa mã QR hiển thị trên màn hình cho khách quét. Ngay khi tiền vào tài khoản cửa hàng, hộp thoại tự đóng và máy in nhiệt tự xuất biên lai.

---

## 📊 3. Quy trình Quản trị Dành cho Quản lý Cửa hàng (`Manager`)

1. **Quản lý Danh mục & Sản phẩm:** Thêm mới sản phẩm, cập nhật giá bán hoặc tạm ngưng kinh doanh các món hết mùa.
2. **Nhập kho & Theo dõi Giá vốn (WAC):** Vào mục **Kho hàng $\rightarrow$ Nhập kho**, nhập số lượng và đơn giá nhập thực tế từ nhà cung cấp; hệ thống tự động tính lại giá vốn bình quân gia quyền và ghi nhận vào **Thẻ kho**.
3. **Xem Gợi ý Nhập hàng Thông minh (AI):** Kiểm tra danh sách sản phẩm cảnh báo màu cam/đỏ do AI dự báo sắp hết hàng trong 7 ngày tới và bấm **Tạo phiếu nhập theo gợi ý** để đặt hàng kịp thời.
4. **Duyệt Hoàn tiền Hóa đơn:** Vào **Lịch sử hóa đơn**, mở hóa đơn cần hoàn trả, nhập lý do rõ ràng và xác nhận hoàn tiền (tồn kho tự động cộng trả lại quầy).

---

## 🛠️ 4. Xử lý Sự cố Nhanh tại Quầy (POS Troubleshooting Playbook)

| Tình huống gặp phải | Nguyên nhân phổ biến | Cách xử lý tức thì tại quầy |
| :--- | :--- | :--- |
| **Mất mạng Internet đột ngột giữa ca** | Đứt cáp quang hoặc mất Wi-Fi cửa hàng. | **Không cần tải lại trang.** Thu ngân tiếp tục bán hàng và thu tiền mặt bình thường; khi có mạng lại, hệ thống tự động đẩy toàn bộ đơn lưu tạm lên máy chủ. |
| **Quét mã vạch nhưng không thêm món** | Máy quét đang bật bộ gõ tiếng Việt (Unikey/EVKey) hoặc mã chưa khai báo. | Chuyển bộ gõ bàn phím sang tiếng Anh (`ENG`) hoặc kiểm tra lại mã SKU của sản phẩm trong danh mục. |
| **Bấm In hóa đơn nhưng máy in không chạy** | Máy in nhiệt hết giấy hoặc lỏng cáp USB/LAN. | Kiểm tra đèn báo giấy trên máy in nhiệt, sau đó vào **Lịch sử hóa đơn** bấm nút **In lại biên lai**. |

---
