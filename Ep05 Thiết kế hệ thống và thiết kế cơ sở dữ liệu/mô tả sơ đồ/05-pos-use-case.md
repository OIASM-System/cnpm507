# Mô tả sơ đồ Use Case – Progressive Web App POS

## 1. Mục đích
Sơ đồ mô tả quy trình bán hàng tại quầy thông qua ứng dụng POS dạng Progressive Web App (PWA).

## 2. System Boundary
Ranh giới là **Progressive Web App POS Subsystem**.

## 3. Actor
- **Cashier / POS Staff:** nhân viên thu ngân thao tác trên POS để tìm hàng, kiểm tra tồn, thanh toán và in hóa đơn.

## 4. Các Use Case
- **UC-POS-01: Scan Barcode / Search SKU:** quét mã vạch hoặc tìm SKU để thêm hàng vào giỏ.
- **UC-POS-02: Check Available Stock Bound:** kiểm tra lượng tồn khả dụng trước khi hoàn tất bán.
- **UC-POS-03: Process Cash / QR Payment:** xử lý thanh toán tiền mặt hoặc QR.
- **UC-POS-04: Atomic POS Quick Checkout:** hoàn tất giao dịch POS theo một quy trình nguyên tử.
- **Print Receipt via Browser API:** in hóa đơn bằng API in của trình duyệt.

## 5. Luồng nghiệp vụ đề xuất để đọc sơ đồ
1. Thu ngân quét mã vạch hoặc tìm SKU.
2. POS kiểm tra tồn khả dụng.
3. Thu ngân xác nhận giỏ hàng và phương thức thanh toán.
4. Hệ thống kiểm tra lại tồn ở backend, xử lý thanh toán và cập nhật đơn/tồn kho nhất quán.
5. Khi giao dịch thành công, POS hiển thị kết quả và cho phép in hóa đơn.

## 6. Quy tắc nghiệp vụ
- Kiểm tra tồn ở giao diện không thay thế kiểm tra tồn ở backend tại thời điểm checkout.
- Checkout cần tránh ghi nhận một phần: cập nhật đơn, thanh toán, tồn kho và ledger phải tuân theo quy tắc transaction đã thống nhất.
- Có thể dùng idempotency key để ngăn giao dịch bị tạo trùng khi người dùng gửi lại yêu cầu.
- In hóa đơn là hành vi sau khi giao dịch hoàn tất thành công.

## 7. Lưu ý
Sơ đồ đặt tên Use Case thanh toán và checkout riêng biệt. Khi hoàn thiện quan hệ UML, cần xác định rõ thanh toán có phải là bước bắt buộc (`include`) trong checkout hay là một nhánh/điều kiện theo phương thức thanh toán.
