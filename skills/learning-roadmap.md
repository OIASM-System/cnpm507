# 🗺️ Learning Roadmap (Lộ trình học tập) - POS PWA Project

Tài liệu này vạch ra lộ trình học tập, nghiên cứu công nghệ và nâng cao kỹ năng cho từng thành viên trong nhóm theo các giai đoạn (Sprint) của đồ án **POS PWA (Point of Sale Progressive Web App)**.

---

## 📅 Lộ trình chi tiết theo các giai đoạn Sprint

### Giai đoạn 1: Phân tích nghiệp vụ & Thiết kế hệ thống (Sprint 1 - 2)
* **Mục tiêu:** Thống nhất nghiệp vụ bán hàng tại quầy (POS), chuẩn hóa tài liệu đặc tả và thiết kế giao diện trực quan.
* **Nội dung tự học & nghiên cứu:**
  * Ôn tập kỹ năng viết **User Stories** và tiêu chí chấp nhận **Acceptance Criteria (Given-When-Then)** (`01-business-analysis/`).
  * Thực hành mô hình hóa quy trình hệ thống bằng chuẩn UML: **Use Case Diagram, Class Diagram, Sequence Diagram** (`02-system-analysis-and-uml/`).
  * Thành thạo công cụ **Figma** để thiết kế giao diện người dùng (UI/UX) cho màn hình POS di động và máy tính (`13-documentation-and-presentation/`).

### Giai đoạn 2: Xây dựng Core Backend & Cơ sở dữ liệu (Sprint 3 - 4)
* **Mục tiêu:** Thiết lập nền tảng backend vững chắc, quản lý dữ liệu hiệu quả và xử lý đồng thời tránh tranh chấp kho.
* **Nội dung tự học & nghiên cứu:**
  * Nghiên cứu kiến trúc **Clean Architecture**, **CQRS với MediatR** trong .NET Core (`03-backend-dotnet/`).
  * Thiết kế cơ sở dữ liệu quan hệ với **PostgreSQL** và **Entity Framework Core**, cấu hình Database Migrations (`04-database/`).
  * Tìm hiểu cơ chế khóa lạc quan/bi quan (**Optimistic & Pessimistic Locking**) để chống bán quá mức (anti-oversell) khi nhiều thu ngân cùng thao tác (`04-database/`, `06-inventory-and-order-domain/`).

### Giai đoạn 3: Phát triển Frontend & Tính năng PWA (Sprint 5 - 6)
* **Mục tiêu:** Xây dựng giao diện tương tác mượt mà bằng React và khai thác sức mạnh của Progressive Web App.
* **Nội dung tự học & nghiên cứu:**
  * Lập trình component với **ReactJS & TypeScript**, quản lý state giỏ hàng và tích hợp gọi API (`07-frontend-react/`).
  * Nghiên cứu cấu hình **Service Worker** giúp ứng dụng POS hoạt động ngoại tuyến cơ bản (`08-pwa-pos/`).
  * Tìm hiểu cách kết nối máy in nhiệt trực tiếp từ trình duyệt (**Browser Printing**) và tích hợp quét mã vạch (`08-pwa-pos/`).

### Giai đoạn 4: Realtime, Kiểm thử & DevOps (Sprint 7 - 8)
* **Mục tiêu:** Đồng bộ hóa dữ liệu thời gian thực giữa các thiết bị thu ngân, kiểm tra chất lượng phần mềm và tự động hóa triển khai.
* **Nội dung tự học & nghiên cứu:**
  * Sử dụng **SignalR** để cập nhật trạng thái đơn hàng thời gian thực (realtime kitchen/cashier sync) (`09-realtime-and-background-jobs/`).
  * Viết **Unit Testing** và **Integration Testing** cho các API thanh toán quan trọng (`10-testing/`).
  * Cấu hình **Docker, Docker Compose** và thiết lập quy trình **CI/CD** cơ bản bằng GitHub Actions (`11-devops/`).

### Giai đoạn 5: Tích hợp AI Dự báo & Hoàn thiện báo cáo (Sprint 9 - 10)
* **Mục tiêu:** Bổ sung tính năng thông minh cho hệ thống và hoàn thiện toàn bộ hồ sơ báo cáo đồ án.
* **Nội dung tự học & nghiên cứu:**
  * Khám phá phương pháp chuẩn bị dữ liệu bán hàng và tích hợp mô đun AI gợi ý nhập hàng (**Demand Forecasting**) (`12-ai-demand-forecasting/`).
  * Rèn luyện kỹ năng viết tài liệu kỹ thuật, chuẩn bị slide và luyện tập thuyết trình bảo vệ đồ án trước hội đồng (`13-documentation-and-presentation/`).

---

## 📌 Nguyên tắc học tập và chia sẻ trong nhóm
1. **Học qua thực chiến (Learning by Doing):** Mỗi lý thuyết học được phải được áp dụng ngay vào việc code và làm tài liệu cho đồ án POS PWA.
2. **Chia sẻ kiến thức (Knowledge Sharing):** Thành viên nào nghiên cứu thành công một công nghệ mới (ví dụ: cấu hình SignalR hay Service Worker) sẽ tổ chức một buổi workshop ngắn 15 phút để hướng dẫn lại cho cả team.

---
