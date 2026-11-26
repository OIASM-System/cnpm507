# ✅ Master Project Checklist & Deliverable Tracker - OISM System

**Đề tài:** Omnichannel Inventory and Sales Management System (OISM)  
**Kiến trúc:** Multi-Tenant SaaS • Clean Architecture (.NET 8) • PostgreSQL 16 • React 18 PWA • SignalR • AI Reordering

---

## 📊 1. Tổng quan Tiến độ 5 Gói Công việc (Work Packages)

- [x] **Gói công việc 1:** Thiết lập nền tảng Clean Architecture (.NET 8), Multi-Tenancy (`TenantId` + EF Core Global Query Filter), PostgreSQL 16 và JWT/RBAC (`Owner`, `Staff`, `Cashier`).
- [x] **Gói công việc 2:** Quản lý Danh mục, Thương hiệu, Sản phẩm, Biến thể (`SKU`), Mã vạch (`EAN-13`/`Code128`), Giá niêm yết, **Sổ cái Tồn kho chỉ ghi thêm (`Append-Only Ledger`)** và **Giá vốn Bình quân Gia quyền (`WAC`)**.
- [x] **Gói công việc 3:** Trung tâm Tiếp nhận Đơn hàng (`Order Ingestion Hub`), Máy trạng thái (`Pending -> Reserved -> Confirmed -> Completed / Cancelled`), Cơ chế chống bán vượt (`Anti-Oversell Lock`) và Trình giả lập Webhook (Shopee/TikTok/Lazada).
- [x] **Gói công việc 4:** Giao diện **Admin Dashboard** (ReactJS), Ứng dụng **PWA POS** (Quét mã vạch, Browser Print API, Atomic Checkout) và đồng bộ thời gian thực qua **SignalR**.
- [x] **Gói công việc 5:** Báo cáo Doanh thu/COGS/Lợi nhuận gộp, Đặc tả **AI Dự báo nhu cầu & Điểm đặt hàng lại (ROP)**, Kiểm thử (Unit, API, Concurrency Flash Sale), CI/CD GitHub Actions và Docker.

---

## 🎯 2. Checklist Yêu cầu Chức năng (Functional Requirements - `FR`)

### 🔐 FR-AUTH: Đa khách hàng & Xác thực
- [x] `FR-AUTH-01`: Đăng ký Tenant mới với không gian dữ liệu cô lập (`TenantId` duy nhất).
- [x] `FR-AUTH-02`: Đăng nhập/Đăng xuất (Email/SĐT + Mật khẩu), cấp JWT chứa `TenantId`, `UserId`, `Role` + Refresh Token Rotation.
- [x] `FR-AUTH-03`: Phân quyền RBAC chặt chẽ cho 3 vai trò: `Owner`, `Staff`, `Cashier`.
- [x] `FR-AUTH-04`: Quản lý Chi nhánh (`Branch`) và Kho (`Warehouse`) thuộc Tenant.

### 📦 FR-PROD: Sản phẩm & Biến thể (SKU)
- [x] `FR-PROD-01`: Quản lý Danh mục phân cấp (`Category`) và Thương hiệu (`Brand`).
- [x] `FR-PROD-02`: Quản lý Sản phẩm đơn giản & Sản phẩm đa biến thể (`ProductVariant` / `SKU` duy nhất trong mỗi Tenant).
- [x] `FR-PROD-03`: Sinh tự động hoặc nhập thủ công Mã vạch (`EAN-13` / `Code128`) cho từng SKU.
- [x] `FR-PROD-04`: Thiết lập Giá bán lẻ & Giá bán sỉ tách biệt hoàn toàn với Giá vốn (`COGS`).

### 📒 FR-INV & FR-COST: Sổ cái Tồn kho & Giá vốn WAC
- [x] `FR-INV-01`: Mọi biến động (`IN`/`OUT`) bắt buộc ghi vào bảng Append-Only `InventoryLedger` (`TenantId`, `BranchId`, `SKUId`, `Type`, `Quantity`, `BalanceAfter`, `ReferenceId`, `CreatedAt`). Nghiêm cấm sửa/xóa trực tiếp.
- [x] `FR-INV-02`: Phiếu nhập hàng (`GoodsReceipt`) $\rightarrow$ Tăng `on_hand` + Cập nhật giá vốn WAC.
- [x] `FR-INV-03`: Chuyển kho 2 bước giữa 2 chi nhánh (`StockTransfer`: Xuất vận chuyển $\rightarrow$ Xác nhận nhập).
- [x] `FR-INV-04`: Phiên kiểm kê (`StocktakeSession`) $\rightarrow$ Đối chiếu lệch kho $\rightarrow$ Sinh bút toán điều chỉnh (`Adjustment Ledger`).
- [x] `FR-COST-01`: Tính lại WAC chính xác khi nhập hàng: $\text{WAC}_{\text{mới}} = \frac{(\text{Tồn cũ} \times \text{Giá vốn cũ}) + (\text{SL nhập} \times \text{Giá nhập})}{\text{Tồn cũ} + \text{SL nhập}}$.
- [x] `FR-COST-02`: Chụp nhanh (`Snapshot`) đơn giá vốn vào `OrderItem.CostPrice` khi đơn `Confirmed` hoặc thanh toán tại POS.

### 🛒 FR-ORD & FR-RSE: Trung tâm Đơn hàng & Chống bán vượt
- [x] `FR-ORD-01`: Chuẩn hóa đơn hàng đa kênh (POS, Admin, Webhook Shopee/TikTok/Lazada) về `Canonical Order Model`.
- [x] `FR-ORD-02`: Thực thi máy trạng thái đơn hàng: `Pending -> Reserved -> Confirmed -> Completed` (hoặc `Cancelled`).
- [x] `FR-ORD-03`: Xử lý duyệt đơn, in phiếu giao hàng và hủy đơn.
- [x] `FR-RSE-01`: Tính động tồn kho khả dụng: `available = on_hand - reserved`.
- [x] `FR-RSE-02`: Giữ hàng (`StockReservation`) khi đơn online vào trạng thái `Reserved`; từ chối ngay nếu `available < số lượng mua`.
- [x] `FR-RSE-03`: `Confirmed` $\rightarrow$ Trừ `on_hand`, giảm `reserved`, ghi Ledger; `Cancelled` $\rightarrow$ Giảm `reserved` hoàn lại `available`.

### 🖥️ FR-POS, FR-REP & FR-SIM: POS PWA, Báo cáo, Webhook & AI
- [x] `FR-POS-01`: Giao diện POS cảm ứng + phím tắt, tìm kiếm tức thì theo Tên / SKU / Mã vạch.
- [x] `FR-POS-02`: Chặn bán vượt `available` tại quầy để bảo vệ lượng hàng đã giữ cho đơn online.
- [x] `FR-POS-03`: Thanh toán Tiền mặt, QR Code và in biên lai qua Browser Print API.
- [x] `FR-POS-04`: Thực hiện `Reserve -> Confirm -> Deduct` trong **1 Atomic Database Transaction** duy nhất tại POS.
- [x] `FR-REP-01`: Báo cáo Doanh thu thuần, Tổng COGS, Lợi nhuận gộp lọc theo Thời gian / Chi nhánh / Kênh bán / SKU.
- [x] `FR-REP-02`: Báo cáo giá trị tồn kho, hàng bán chạy và hàng chậm luân chuyển.
- [x] `FR-REP-03`: Cảnh báo tự động trên Dashboard khi `available <= ReorderPoint` (kết hợp đặc tả gợi ý nhập hàng AI).
- [x] `FR-SIM-01`: Trình giả lập Webhook TMĐT (`webhook-simulator` cho Shopee/TikTok/Lazada) kiểm thử tải & giữ hàng.
- [x] `FR-SIM-02`: Đẩy thông báo đơn mới & cập nhật tồn kho real-time qua **SignalR**.
- [ ] `FR-SIM-03`: Tác vụ nền tự động hủy đơn giữ hàng quá hạn (`TTL`) & tổng hợp báo cáo ngày *(Hạng mục mở rộng giai đoạn 2)*.

---

## 🛡️ 3. Checklist Yêu cầu Phi chức năng (Non-Functional Requirements - `NFR`)

- [x] `NFR-PERF-01`: Tối ưu truy vấn và chỉ mục đảm bảo độ trễ `p95` tìm kiếm SKU/quét mã vạch $< 200\text{ms}$; tạo đơn hàng $< 500\text{ms}$; báo cáo $< 2\text{s}$.
- [x] `NFR-PERF-02`: Kịch bản kiểm thử Flash Sale (`concurrency-runner` / k6) mô phỏng đơn hàng đồng thời nhắm vào SKU cuối cùng bằng khóa giao dịch / Optimistic Locking (0% âm kho).
- [x] `NFR-TENANT-01` & `02`: Áp dụng EF Core Global Query Filter theo `TenantId` và tối ưu Composite Index `(TenantId, CreatedAt)`, `(TenantId, SKUId)`.
- [x] `NFR-SEC-01` & `02` & `03`: Mật khẩu băm `BCrypt`/`Argon2`; JWT + Refresh Token; tuân thủ ACID và cơ chế chặn sửa/xóa trực tiếp trên `InventoryLedger`.
- [x] `NFR-MAINT-01` & `02`: Tuân thủ Clean Architecture 4 tầng và xây dựng bộ Unit Test (`OISM.Domain.Tests`) cho các thực thể cốt lõi (`Inventory`, `Order`, `OrderItem`).

---

## 📂 4. Checklist Hoàn thiện Tài liệu & Sơ đồ (`EP01` – `14-ai-reordering`)

- [x] `EP01/` & `EP02/`: Hoàn thiện đặc tả đề tài, bối cảnh nghiệp vụ và cơ sở lý thuyết (Clean Architecture, Multi-Tenancy, Anti-Oversell, WAC, SignalR, PWA).
- [x] `EP-03/` & `EP-04/`: Hoàn thiện phân tích quy trình nghiệp vụ (`As-Is` / `To-Be`), sơ đồ luồng `.drawio.png`, đặc tả URS, SRS, User Stories và Business Rules.
- [x] `Ep05 Thiết kế hệ thống và thiết kế cơ sở dữ liệu/`: Hoàn thiện 7 sơ đồ Use Case (`UseCaseDiagrams/`), mô tả chi tiết 21 đặc tả Use Case (`specifications/`) và tài liệu `Use Case Decriptions.pdf`.
- [x] `EP-06/` & `07-database-design/`: Hoàn thiện kiến trúc hệ thống (C4, UML, Sequence Diagrams), sơ đồ ERD (`erd.drawio.png`), script SQL (`database-schema.sql`) và dữ liệu mẫu 30 SKU thời trang (`seed-fashion-30-skus.sql`).
- [x] `08-ui-ux-design/`: Hoàn thiện Design System, Wireframes, Screen Flow, Checkout Flow, Mockups (Admin Dashboard & POS PWA) và tài liệu hướng dẫn Responsive/Accessibility.
- [x] `EP-09/` đến `14-ai-reordering/`: Hoàn thiện tài liệu API (`openapi.json`, `OISM.postman_collection.json`), kế hoạch kiểm thử (`EP10`), hướng dẫn triển khai (`EP11`), hướng dẫn sử dụng (`EP12`), quản lý dự án Scrum (`EP13`) và đặc tả AI Reordering (`14-ai-reordering`).
- [x] `FULL-DOCS/`: Tổng hợp đầy đủ tài liệu báo cáo (`OISM_DOCUMENTATION.md`, `OISM_Project_PDF.pdf`, `USER-MANUAL.md`).

---

## 🚀 5. Checklist Gói Đóng gói & Bàn giao Cuối kỳ (Release Readiness)

- [x] Mã nguồn Backend (`backend/OISM.sln` + `backend/Dockerfile`) và Frontend (`frontend/` React + Vite PWA) đóng gói đầy đủ, biên dịch thành công.
- [x] Bộ công cụ kiểm thử tự động (`backend/oism-backend-tools/`: `data-generator`, `webhook-simulator`, `concurrency-runner`) hoạt động ổn định.
- [x] Bộ kiểm thử API (`EP-09/OISM.postman_collection.json` và `openapi.json`) khớp với các endpoint thực tế.
- [x] Báo cáo đồ án đầy đủ sơ đồ thiết kế, đặc tả kỹ thuật, dữ liệu mẫu và hướng dẫn sử dụng cho từng vai trò (`Owner`, `Staff`, `Cashier`).