# 👥 Team Skill Assignment (Phân công nhiệm vụ) - POS PWA Project

Tài liệu này xác định rõ vai trò, trách nhiệm và sự phân công phụ trách các phân môn/thư mục kỹ thuật trong dự án **POS PWA (Point of Sale Progressive Web App)** cho từng thành viên trong nhóm, đảm bảo phát huy tối đa thế mạnh cá nhân và phối hợp hiệu quả theo mô hình Agile Scrum.

---

## 🎯 Phân chia Vai trò & Trách nhiệm chính (Core Roles)

### 1. Thành viên 1: BA & UI/UX Lead (Product Owner / Business Analyst)
* **Thế mạnh:** Phân tích nghiệp vụ, thiết kế giao diện, trực quan hóa quy trình.
* **Các thư mục/phân môn phụ trách chính:**
  * `01-business-analysis/` (Đặc tả yêu cầu, User Stories, Acceptance Criteria).
  * `02-system-analysis-and-uml/` (Sơ đồ Use Case, Class Diagram, Sequence Diagram).
  * `13-documentation-and-presentation/` (Quản lý tài liệu kỹ thuật, sơ đồ Draw.io, slide báo cáo).
* **Nhiệm vụ cụ thể:** Chuyển đổi yêu cầu thực tế thành tài liệu nghiệp vụ, thiết kế toàn bộ luồng giao diện UI/UX trên Figma (Màn hình bán hàng, giỏ hàng, xem trước hóa đơn `Receipt Preview`).

### 2. Thành viên 2: Backend & Database Lead (.NET Engineer)
* **Thế mạnh:** Lập trình hướng đối tượng, kiến trúc phần mềm, quản trị cơ sở dữ liệu.
* **Các thư mục/phân môn phụ trách chính:**
  * `03-backend-dotnet/` (Xây dựng Clean Architecture, CQRS, MediatR cho Web API).
  * `04-database/` (Thiết kế PostgreSQL, EF Core, tối ưu truy vấn và Migrations).
  * `05-multi-tenancy-and-security/` (Xác thực JWT, phân quyền RBAC, bảo mật API).
  * `06-inventory-and-order-domain/` (Xử lý nghiệp vụ kho, sổ cái, chống bán quá mức - anti-oversell).
* **Nhiệm vụ cụ thể:** Thiết kế database schema, xây dựng các API xử lý giao dịch đơn hàng và kho hàng với độ đồng thời cao.

### 3. Thành viên 3: Frontend & PWA Lead (React Developer)
* **Thế mạnh:** Lập trình web hiện đại, tương tác người dùng, tối ưu trình duyệt di động/desktop.
* **Các thư mục/phân môn phụ trách chính:**
  * `07-frontend-react/` (Phát triển giao diện ReactJS, TypeScript, quản lý State).
  * `08-pwa-pos/` (Cấu hình Service Worker, quét mã vạch, in hóa đơn trực tiếp từ trình duyệt).
  * `09-realtime-and-background-jobs/` (Tích hợp SignalR cập nhật trạng thái đơn hàng thời gian thực).
* **Nhiệm vụ cụ thể:** Hiện thực hóa thiết kế Figma thành ứng dụng Web chạy mượt mà, hỗ trợ tính năng Progressive Web App (PWA) và đồng bộ real-time cho thu ngân.

### 4. Thành viên 4: Testing & DevOps Lead (QA & System Integrator)
* **Thế mạnh:** Kiểm thử phần mềm, tự động hóa, vận hành hệ thống và tích hợp AI.
* **Các thư mục/phân môn phụ trách chính:**
  * `10-testing/` (Viết Unit Test, Integration Test, kiểm thử hiệu năng và đồng thời).
  * `11-devops/` (Quản lý Git, phân nhánh, Docker, CI/CD GitHub Actions).
  * `12-ai-demand-forecasting/` (Hỗ trợ chuẩn bị dữ liệu và tích hợp mô đun AI dự báo).
* **Nhiệm vụ cụ thể:** Đảm bảo chất lượng mã nguồn qua các test cases, thiết lập môi trường chạy container hóa bằng Docker và duy trì quy trình CI/CD cho nhóm.

---

## 🔄 Cơ chế phối hợp trong các Sprint (Agile Scrum Workflow)
1. **Sprint Planning:** Dựa trên ma trận phân công, nhóm trưởng (Scrum Master luân phiên) giao các Task trong Jira khớp với các phân môn kỹ thuật tương ứng.
2. **Cross-Review:** Trước khi merge code lên nhánh chính (`main`/`develop`), các thành viên phải thực hiện Code Review chéo (Ví dụ: Thành viên Backend review logic API do Frontend gọi, hoặc ngược lại).
3. **Knowledge Transfer:** Các tài liệu kỹ thuật trong thư mục `Skills/` được cập nhật liên tục bởi người phụ trách chính sau mỗi buổi Sprint Review.

---
