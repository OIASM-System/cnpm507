# 👥 Team Skill Assignment (Phân công nhiệm vụ & Năng lực) - OISM System

Tài liệu này xác định rõ vai trò, thế mạnh, danh sách đầu việc thực tế trên Jira (`SCRUM-25` – `SCRUM-99`) và sự phân công phụ trách các phân môn/thư mục kỹ thuật trong dự án **OISM (Omnichannel Inventory and Sales Management System)** cho **6 thành viên** trong nhóm, đảm bảo phối hợp hiệu quả theo mô hình Agile Scrum.

---

## 🎯 Phân chia Vai trò & Trách nhiệm chính (Core Roles)

### 1. Lê Trương Đức Chính — Team Lead / System Architect & QA Reviewer
* **Thế mạnh:** Kiến trúc phần mềm (.NET 8 Clean Architecture), thiết kế hệ thống phân tán, bảo mật, đối soát yêu cầu và điều phối dự án.
* **Các thư mục/phân môn phụ trách chính:**
  * `EP01/` & `EP02/` (Đặc tả đề tài, bối cảnh kinh doanh và cơ sở lý thuyết kiến trúc).
  * `EP-06/` (Sơ đồ kiến trúc hệ thống C4, UML, Sequence Diagrams).
  * `EP13/` & `FULL-DOCS/` (Quản lý kế hoạch dự án Scrum, Ma trận truy vết RTM và tổng hợp báo cáo).
* **Nhiệm vụ cụ thể:**
  * Soạn tài liệu Kiến trúc Clean Architecture .NET 8 & SaaS Multi-tenant (`SCRUM-25`), vẽ Sơ đồ Kiến trúc Hệ thống (`SCRUM-26`).
  * Thiết kế cơ chế Bảo mật JWT Token, phân quyền RBAC và vẽ Sơ đồ Tuần tự Xác thực (`SCRUM-27`, `SCRUM-28`).
  * Lập Ma trận truy vết yêu cầu RTM đối soát toàn dự án (`SCRUM-98`) và kiểm duyệt chéo toàn bộ Sprint Backlog.

### 2. Võ Nguyễn Ngọc Hân — POS PWA Frontend Developer & Release Acceptance Lead
* **Thế mạnh:** Thiết kế trải nghiệm điểm bán hàng (POS UX), phát triển giao diện ReactJS/PWA, tích hợp đồng bộ thời gian thực SignalR và nghiệm thu sản phẩm.
* **Các thư mục/phân môn phụ trách chính:**
  * `08-ui-ux-design/pos-pwa/` & `08-ui-ux-design/figma/` (Wireframe, Mockup Figma, luồng thanh toán `CHECKOUT-FLOW` và mẫu hóa đơn).
  * `frontend/` (Phát triển phân hệ bán hàng tại quầy POS PWA, tích hợp SignalR Client).
* **Nhiệm vụ cụ thể:**
  * Soạn tài liệu kỹ thuật PWA POS & SignalR (`SCRUM-40`), vẽ Sơ đồ Tuần tự Thanh toán POS (`SCRUM-41`) và thiết kế giao diện POS (`SCRUM-42`).
  * Lập trình màn hình Bán hàng POS PWA (`SCRUM-80`), giỏ hàng, thanh toán 1 chạm & in hóa đơn (`SCRUM-81`).
  * Tích hợp âm thanh chuông báo, Toast thông báo real-time (`SCRUM-92`), ráp nối luồng POS bán hàng trừ tồn kho (`SCRUM-94`) và nghiệm thu toàn bộ tiêu chí trong `Checklist.md` (`SCRUM-99`).

### 3. Nguyễn Trần Sĩ Hào — Admin Portal BA, Backend Order/SignalR & DevOps Engineer
* **Thế mạnh:** Phân tích yêu cầu quản trị, thiết kế giao diện Admin, lập trình API xử lý trạng thái đơn hàng/SignalR và triển khai Docker.
* **Các thư mục/phân môn phụ trách chính:**
  * `EP-04/` & `Ep05 Thiết kế hệ thống và thiết kế cơ sở dữ liệu/` (Đặc tả yêu cầu URS/SRS và sơ đồ Use Case).
  * `08-ui-ux-design/admin-dashboard/` (Thiết kế Wireframe, Screen Flow và Mockup giao diện quản trị).
  * `backend/src/OISM.WebAPI/` & `EP11/` (Triển khai SignalR Hub, cấu hình CORS/Proxy và đóng gói Docker).
* **Nhiệm vụ cụ thể:**
  * Soạn tài liệu Admin URS (`SCRUM-37`), vẽ Sơ đồ Luồng Màn hình Admin (`SCRUM-38`) và thiết kế giao diện Web Admin (`SCRUM-39`).
  * Lập trình Backend Máy trạng thái Đơn hàng (`SCRUM-86`), cấu hình CORS/Proxy (`SCRUM-89`) và triển khai SignalR Hub `OrderHub` (`SCRUM-91`).
  * Đóng gói triển khai hệ thống tự động bằng `docker-compose` (`SCRUM-97`).

### 4. Lâm Tuấn Anh — Order Domain Analyst & Admin Frontend Developer
* **Thế mạnh:** Chuẩn hóa dữ liệu đơn hàng đa kênh, phát triển giao diện quản trị ReactJS và biên soạn tài liệu hướng dẫn người dùng.
* **Các thư mục/phân môn phụ trách chính:**
  * `EP-03/` & `EP-09/` (Phân tích quy trình nghiệp vụ As-Is/To-Be, Business Rules và đặc tả API).
  * `frontend/` (Phát triển các màn hình quản trị trên Web Admin).
  * `EP12/` & `07-database-design/` (Tài liệu hướng dẫn sử dụng User Manual và dữ liệu mẫu Seed Data).
* **Nhiệm vụ cụ thể:**
  * Soạn tài liệu Mô hình Đơn hàng Chuẩn (`SCRUM-33`), vẽ Sơ đồ Máy Trạng thái Đơn hàng (`SCRUM-34`) và đặc tả luồng chống bán vượt (`SCRUM-35`, `SCRUM-36`).
  * Lập trình giao diện Quản lý Danh mục & Sản phẩm/SKU (`SCRUM-82`), Lập Phiếu nhập hàng (`SCRUM-83`) và Trung tâm Quản lý Đơn hàng tập trung (`SCRUM-88`).
  * Soạn thảo bộ dữ liệu mẫu thực tế (`SCRUM-95`) và viết cuốn Tài liệu Hướng dẫn sử dụng User Manual (`SCRUM-96`).

### 5. Cường Hoàng Phúc — Database Architect, Security Backend & Webhook Simulator Engineer
* **Thế mạnh:** Thiết kế cơ sở dữ liệu PostgreSQL, bảo mật xác thực đa thuê bao và phát triển công cụ giả lập tích hợp sàn TMĐT.
* **Các thư mục/phân môn phụ trách chính:**
  * `07-database-design/` (Sơ đồ ERD, Data Dictionary, chiến lược đánh chỉ mục và cô lập dữ liệu Tenant).
  * `backend/src/OISM.Infrastructure/` (Cấu hình EF Core, Global Query Filter, Migrations).
  * `backend/oism-backend-tools/webhook-simulator/` (Công cụ giả lập đơn hàng từ Shopee/TikTok/Lazada).
* **Nhiệm vụ cụ thể:**
  * Vẽ Sơ đồ ERD (`SCRUM-29`), soạn Data Dictionary PostgreSQL (`SCRUM-30`), đặc tả quy trình Nhật ký kho Append-Only & công thức giá vốn WAC (`SCRUM-31`, `SCRUM-32`).
  * Lập trình Backend xác thực JWT, băm mật khẩu BCrypt và EF Core Global Query Filter theo `TenantId` (`SCRUM-87`).
  * Xây dựng công cụ `Webhook Simulator` bắn đơn giả lập từ các sàn TMĐT (`SCRUM-90`).

### 6. Vương Phú Minh Hải — Core Inventory Backend & Performance QA Engineer
* **Thế mạnh:** Lập trình xử lý đồng thời (Concurrency Control), nghiệp vụ sổ cái kho bất biến và kiểm thử tải hiệu năng cao (k6).
* **Các thư mục/phân môn phụ trách chính:**
  * `backend/src/OISM.Domain/` & `backend/src/OISM.Application/` (Xử lý nghiệp vụ kho lõi, khóa bi quan chống bán vượt và sổ cái tồn kho).
  * `EP10/`, `backend/tests/` & `backend/oism-backend-tools/concurrency-runner/` (Kế hoạch kiểm thử, Unit Test và kiểm thử tải Flash Sale k6).
* **Nhiệm vụ cụ thể:**
  * Soạn tài liệu Kế hoạch Kiểm thử Test Plan (`SCRUM-43`).
  * Lập trình Backend cơ chế Khóa bi quan `SELECT ... FOR UPDATE` chống bán vượt (`SCRUM-84`) và Sổ cái tồn kho chỉ ghi thêm Append-Only Ledger (`SCRUM-85`).
  * Thực thi kịch bản kiểm thử tải k6 Flash Sale với 50 đơn hàng đồng thời vào 1 SKU (`SCRUM-93`).

---

## 🔄 Cơ chế phối hợp trong các Sprint (Agile Scrum Workflow)
1. **Sprint Planning:** Nhóm trưởng (`Lê Trương Đức Chính`) phân rã công việc trên Jira khớp với thế mạnh và phân môn kỹ thuật của từng thành viên từ giai đoạn phân tích thiết kế (`SCRUM-25` – `43`) đến lập trình, kiểm thử (`SCRUM-80` – `99`).
2. **Cross-Review:** Trước khi merge code lên nhánh chính, các cặp Frontend – Backend thực hiện kiểm thử chéo và tích hợp theo luồng nghiệp vụ khép kín (ví dụ: Hân phối hợp cùng Hào và Hải ráp nối luồng POS Checkout $\rightarrow$ Trừ tồn kho $\rightarrow$ Đẩy thông báo SignalR).
3. **Release Acceptance:** Nghiệm thu toàn bộ tính năng dựa trên Ma trận truy vết yêu cầu (`SCRUM-98`) và danh mục kiểm tra đầu ra `Checklist.md` (`SCRUM-99`).