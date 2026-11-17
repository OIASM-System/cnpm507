# 📐 System Diagrams & Draw.io Modeling Standards - POS PWA Project

Tài liệu này quy định danh mục toàn bộ **Sơ đồ Phân tích & Thiết kế Hệ thống (System Architecture & UML Diagrams)** được biên soạn bằng công cụ **Draw.io (`diagrams.net`)** cho dự án **POS PWA (Point of Sale Progressive Web App)**. Các sơ đồ tuân thủ nghiêm ngặt ký pháp chuẩn **UML 2.5** và **C4 Architecture Model**, được xuất đồng thời dưới hai định dạng: tệp nguồn có thể chỉnh sửa (`.drawio` / `.drawio.xml`) và hình ảnh vector/độ phân giải cao (`.svg` / `.png` 300 DPI) để chèn vào Báo cáo đồ án và Slide thuyết trình.

---

## 🗂️ 1. Danh mục Bộ Sơ đồ Bắt buộc của Dự án (`docs/diagrams/`)

| Mã sơ đồ | Tên tệp Draw.io chuẩn | Loại sơ đồ (UML / C4) | Nội dung kỹ thuật trọng tâm cần thể hiện |
| :--- | :--- | :--- | :--- |
| **`DIAG-01`** | `01-system-context-c4.drawio` | **C4 Context & Container Diagram** | Toàn cảnh tương tác giữa Thu ngân, Quản lý, Khách hàng với React PWA, Nginx, .NET 8 Web API, PostgreSQL 16, Python AI Service và Bank Webhook. |
| **`DIAG-02`** | `02-clean-architecture-layers.drawio` | **Package & Dependency Diagram** | Cấu trúc 4 tầng (`Domain`, `Application`, `Infrastructure`, `WebApi`) chứng minh chiều phụ thuộc hướng tâm (Dependency Inversion). |
| **`DIAG-03`** | `03-use-case-diagram.drawio` | **UML Use Case Diagram** | Phân tách rõ quyền hạn của 2 tác nhân **`Cashier`** (Bán hàng, Quét mã, Thanh toán tiền mặt/QR, Bán hàng Offline) và **`Manager`** (Quản lý SP, Nhập kho WAC, Hoàn tiền, Xem báo cáo AI). |
| **`DIAG-04`** | `04-database-erd.drawio` | **Entity-Relationship Diagram (ERD)** | Lược đồ 10 bảng PostgreSQL (`Tenants`, `Users`, `RefreshTokens`, `Categories`, `Products`, `InventoryTransactions`, `StockReservations`, `Orders`, `OrderDetails`, `Payments`) kèm khóa chính, khóa ngoại và chỉ mục Multi-Tenant. |
| **`DIAG-05`** | `05-domain-class-diagram.drawio` | **UML Class Diagram** | Thiết kế chi tiết các Aggregate Roots (`Order`, `Product`), Value Objects, Enums và phương thức nghiệp vụ đóng gói bên trong tầng Domain. |
| **`DIAG-06`** | `06-seq-online-checkout.drawio` | **UML Sequence Diagram** | Luồng thanh toán trực tuyến tại quầy: React PWA $\rightarrow$ Idempotency Guard $\rightarrow$ Khóa dòng `FOR UPDATE` $\rightarrow$ Ghi sổ cái `Ledger` $\rightarrow$ Phát SignalR `StockUpdated`. |
| **`DIAG-07`** | `07-seq-offline-sync.drawio` | **UML Sequence Diagram** | Luồng bán hàng khi mất mạng (`IndexedDB`) và tự động đồng bộ nền khi có mạng trở lại kèm phát hiện xung đột tồn kho (`RequiresInventoryReconciliation`). |
| **`DIAG-08`** | `08-seq-vietqr-webhook.drawio` | **UML Sequence Diagram** | Luồng tạo mã VietQR động, giữ chỗ tồn kho TTL 5 phút, tiếp nhận Bank Webhook (HMAC-SHA256 + Hangfire) và tự động đóng modal qua SignalR. |
| **`DIAG-09`** | `09-order-state-machine.drawio` | **UML State Machine Diagram** | Vòng đời trạng thái đơn hàng (`Draft`, `PendingPayment`, `Completed`, `Cancelled`, `Refunded`) và các điều kiện chuyển đổi hợp lệ. |

---

## 🎨 2. Quy chuẩn Trình bày & Phối màu Thống nhất trên Draw.io

Để bộ sơ đồ trong báo cáo có tính thẩm mỹ cao, đồng bộ và in ấn rõ nét:
* **Phông chữ chuẩn:** Sử dụng thống nhất font **`Inter`** hoặc **`Segoe UI`** (cỡ chữ tiêu đề `14pt Bold`, nội dung thành phần `11pt–12pt Regular`).
* **Bảng màu phân tầng kiến trúc (`Color Palette`):**
  * **Tầng Giao diện / Client (`React PWA`):** Xanh dương nhạt (`Fill: #EFF6FF`, `Stroke: #2563EB`).
  * **Tầng Ứng dụng / API (`.NET 8 Web API`):** Tím nhạt (`Fill: #F5F3FF`, `Stroke: #7C3AED`).
  * **Tầng Dữ liệu / Lưu trữ (`PostgreSQL` / `IndexedDB`):** Xanh ngọc lục bảo (`Fill: #ECFDF5`, `Stroke: #059669`).
  * **Tác nhân bên ngoài (`Bank Webhook` / `AI Service`):** Cam hổ phách (`Fill: #FFFBEB`, `Stroke: #D97706`).
* **Quy tắc đường nối (`Connectors`):** Sử dụng đường vuông góc (`Orthogonal`), tránh tuyệt đối việc các đường mũi tên cắt chéo đè lên chữ hoặc đi xuyên qua hộp thành phần.

---
