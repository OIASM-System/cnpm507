# Use Case Specification: UC-POS-03 Print POS Receipt

## 1. Details
- **ID & Name:** `UC-POS-03 Print POS Receipt`
- **Primary Actor:** **Thu ngân (Cashier)**
- **Secondary Actors:** Browser Print API, Thermal Printer
- **Goal in Context:** Kích hoạt ngay lập tức hộp thoại in hóa đơn nhiệt ngay sau khi thanh toán POS thành công.

## 2. Main Success Flow
1. Sau khi `UC-POS-02` commit thành công, hệ thống gọi Browser Print API.
2. Máy in nhiệt in hóa đơn cho khách hàng dưới 3 cú nhấp chuột/phím Enter (`NFR-USA-02`).

## 3. Business Rules & NFRs
- **FR-POS-03 / NFR-USA-02:** Thanh toán & in hóa đơn tối giản.