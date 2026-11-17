# 🔗 Requirement Traceability Matrix (Ma trận truy xuất nguồn gốc yêu cầu) - POS PWA Project

Tài liệu này thiết lập mối liên kết xuyên suốt giữa các yêu cầu hệ thống (**Functional Requirements**), các câu chuyện người dùng (**User Stories**), các Use Case đặc tả và các tiêu chí chấp nhận (**Acceptance Criteria**), đảm bảo không có tính năng nào bị bỏ sót trong quá trình phát triển ứng dụng **POS PWA (Point of Sale Progressive Web App)**.

---

## 📊 Bảng Ma trận Truy xuất Nguồn gốc (Traceability Matrix)

| Mã yêu cầu<br>(Requirement ID) | Yêu cầu chức năng tương ứng<br>(Functional Requirement) | User Story<br>(Agile US) | Use Case<br>(UML / Specification) | Acceptance Criteria<br>(BDD Criteria) | Trạng thái thiết kế & code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-01** | Tìm kiếm và lọc danh mục sản phẩm | US-01: Tìm kiếm & lọc sản phẩm nhanh | UC-01 (Bước 1-2) | AC-01 (Scenario 1 & 2) | ✅ Hoàn thành (UI & API) |
| **REQ-02** | Thêm sản phẩm vào giỏ hàng bằng nút `GET` | US-02: Thêm sản phẩm bằng thao tác nhanh | UC-01 (Bước 3-4) | AC-02 (Scenario 1) | ✅ Hoàn thành (UI & State) |
| **REQ-03** | Quản lý giỏ hàng (Tăng/giảm số lượng, xóa) | US-03: Quản lý chi tiết giỏ hàng | UC-01 (Bước 5-6, 5a) | AC-03 (Scenario 1 & 2) | ✅ Hoàn thành (UI & State) |
| **REQ-04** | Xem trước hóa đơn (Receipt Preview) trước khi thanh toán | US-04: Xem trước hóa đơn trước khi chốt | UC-02 (Bước 1-2) | AC-04 (Scenario 1) | ✅ Hoàn thành (UI Component) |
| **REQ-05** | Lựa chọn phương thức thanh toán (Tiền mặt, Chuyển khoản, Thẻ) | US-05: Lựa chọn phương thức thanh toán | UC-02 (Bước 3) | AC-05 (Scenario 1) | ✅ Hoàn thành (UI & Logic) |
| **REQ-06** | In hoặc gửi hóa đơn điện tử sau giao dịch | US-06: In hoặc gửi hóa đơn | UC-03 (Bước 1) | AC-06 (Scenario 1 & 2) | 🔄 Đang phát triển (PWA Print) |
| **REQ-07** | Hoạt động ngoại tuyến cơ bản qua PWA | US-07: Hoạt động ngoại tuyến (Offline) | N/A (Non-Functional) | N/A | 🔄 Đang lên kế hoạch Service Worker |

---

## 🔍 Ý nghĩa và Cách sử dụng Ma trận
1. **Kiểm soát phạm vi (Scope Management):** Giúp nhóm trưởng và giảng viên hướng dẫn đối chiếu xem mọi tính năng hiển thị trên giao diện (UI) đều có nguồn gốc từ yêu cầu kinh doanh thực tế.
2. **Hỗ trợ kiểm thử (QA Testing):** Dựa vào bảng này, bộ phận kiểm thử có thể dễ dàng map từ một Test Case ngược lại xem nó kiểm tra cho User Story và Acceptance Criteria nào.
3. **Đảm bảo tính đồng bộ:** Khi có sự thay đổi về yêu cầu (Change Request), ma trận này giúp xác định ngay lập tức các tệp tài liệu và module code nào cần phải cập nhật theo.

---
