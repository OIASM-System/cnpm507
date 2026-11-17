# 🎯 POS Ergonomics, Sensory Feedback & Usability Standards - POS PWA Project

Tài liệu này quy định các tiêu chuẩn **Trải nghiệm Người dùng (UX) & Công thái học (Ergonomics)** đặc thù cho môi trường quầy thu ngân trong hệ thống **POS PWA (Point of Sale Progressive Web App)**. Khác với người dùng website thông thường có thời gian đọc nội dung thư thả, nhân viên thu ngân phải đứng thao tác liên tục dưới áp lực hàng dài khách chờ thanh toán trong điều kiện ánh sáng mạnh hoặc ánh đèn quán cà phê tối. Mọi chi tiết giao diện đều được thiết kế theo nguyên tắc **Tốc độ tối đa — Giảm mỏi mắt — Chống thao tác nhầm**.

---

## 🖐️ 1. Quy chuẩn Thiết kế Cảm ứng & Thị giác (Touch-First & Visual Ergonomics)

| Tiêu chuẩn thiết kế | Thông số quy định trong POS PWA | Lý do công thái học tại quầy |
| :--- | :--- | :--- |
| **Kích thước vùng chạm (Touch Target)** | Tối thiểu **`48px × 48px`** (khoảng cách giữa 2 nút $\ge 8\text{px}$). | Thu ngân thao tác nhanh bằng ngón tay trên màn hình cảm ứng không bị bấm nhầm sang món bên cạnh. |
| **Tương phản cao (High Contrast UI)** | Nền sáng trung tính (`#F8FAFC`), thẻ sản phẩm trắng (`#FFFFFF`), chữ đậm (`#0F172A`), nút thanh toán xanh dương đậm (`#2563EB`). | Đảm bảo hiển thị rõ nét dưới ánh đèn chói tại quầy thu ngân mà không gây lóa mắt khi làm việc ca 8 tiếng. |
| **Chữ số dạng bảng (`tabular-nums`)** | Áp dụng CSS `font-variant-numeric: tabular-nums` cho toàn bộ cột đơn giá, số lượng và tổng tiền. | Các chữ số có độ rộng bằng nhau giúp thu ngân dễ dàng dóng thẳng hàng cột tiền và không bị nhảy layout khi số lượng tăng giảm. |
| **Chống chọn nhầm văn bản (`select-none`)** | Áp dụng `user-select: none` trên các thẻ sản phẩm và nút tăng/giảm số lượng. | Ngăn tình trạng trình duyệt bôi đen xanh lè toàn bộ chữ trên thẻ sản phẩm khi thu ngân chạm liên tiếp nhiều lần để cộng dồn số lượng. |

---

## 🔊 2. Phản hồi Đa giác quan (Sensory Feedback: Audio & Micro-Animations)

Trong môi trường quầy thu ngân ồn ào, thu ngân thường vừa nhìn hàng hóa của khách vừa thao tác tay. Hệ thống cung cấp phản hồi tức thì bằng cả **thị giác** và **âm thanh** qua **Web Audio API** (không phụ thuộc tải file mạng):

* **Âm thanh phản hồi chuẩn hóa (`src/utils/posAudio.ts`):**
  * **Thêm món / Quét mã hợp lệ:** Tiếng *"Bíp"* ngắn (`1000Hz`, `70ms`) — xác nhận món đã vào giỏ mà thu ngân không cần ngước nhìn màn hình.
  * **Lỗi quét mã / Hết tồn kho:** Tiếng *"Bíp-Bíp"* trầm (`280Hz`, `180ms`) — cảnh báo ngay lập tức để thu ngân kiểm tra lại sản phẩm.
  * **Thanh toán thành công / Tiền về VietQR:** Chuỗi âm thanh *"Ting-Ting"* vui tai (`880Hz` $\rightarrow$ `1320Hz`) báo hiệu hoàn tất giao dịch.
* **Hiệu ứng phản hồi xúc giác thị giác:** Thẻ sản phẩm vừa được chạm có hiệu ứng co nhẹ (`active:scale-95`) và nháy viền xanh trong `150ms`, đồng thời dòng sản phẩm tương ứng trong giỏ hàng tự động cuộn tới (`scrollIntoView`) và highlight nhẹ để thu ngân dễ kiểm soát.

---

## 🛡️ 3. Cơ chế Chống Thao tác Nhầm & Bảo vệ Dữ liệu (Error Prevention)

1. **Khóa thao tác gửi trùng (Double-Submit Prevention):**
   Ngay khi thu ngân bấm nút **"Xác nhận thanh toán"** (hoặc nhấn `Enter`), nút lập tức chuyển sang trạng thái `disabled` kèm biểu tượng xoay (`isSubmitting = true`) cho đến khi API hoặc IndexedDB trả về kết quả, triệt tiêu hoàn toàn lỗi tạo 2 hóa đơn giống hệt nhau do nhấn đúp chuột hoặc chạm 2 lần.
2. **Cảnh báo rời trang khi giỏ hàng chưa thanh toán (`beforeunload`):**
   Nếu giỏ hàng hiện tại đang có sản phẩm (`items.length > 0`) và thu ngân vô tình bấm nút tải lại trang (`F5`) hoặc đóng cửa sổ trình duyệt, hệ thống kích hoạt hộp thoại xác nhận của trình duyệt để bảo vệ giỏ hàng đang phục vụ khách.
3. **Ngăn thiết bị tắt màn hình giữa ca (`Screen Wake Lock API`):**
   Trên máy tính bảng POS (iPad / Android Tablet), ứng dụng kích hoạt `navigator.wakeLock.request('screen')` khi mở màn hình bán hàng để màn hình quầy thu ngân luôn sáng sẵn sàng phục vụ khách mà không tự khóa màn hình sau vài phút không chạm.

---
