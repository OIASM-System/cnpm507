# 📑 Academic Project Report Outline & Writing Standards - POS PWA Project

Tài liệu này quy định **Đề cương Chi tiết Báo cáo Đồ án Học phần (Project Report Structure)** theo chuẩn học thuật của **Trường Đại học Giao thông Vận tải TP.HCM (UTH)** cho hệ thống **POS PWA (Point of Sale Progressive Web App)**. Cấu trúc báo cáo được tổ chức chặt chẽ từ phân tích bài toán thực tế, thiết kế kiến trúc phần mềm chuyên sâu, triển khai kỹ thuật cho đến đánh giá thực nghiệm bằng số liệu kiểm thử tự động.

---

## 📚 1. Cấu trúc Đề cương Chi tiết 6 Chương

### **CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI & KHẢO SÁT NGHIỆP VỤ**
* **1.1. Bối cảnh & Tính cấp thiết của đề tài:** Hạn chế của sổ sách thủ công và các phần mềm POS truyền thống (phụ thuộc kết nối Internet liên tục, khó triển khai đa chi nhánh, dễ sai lệch tồn kho giờ cao điểm).
* **1.2. Mục tiêu & Phạm vi nghiên cứu:** Xây dựng nền tảng POS đa cửa hàng (**Multi-Tenant SaaS**) theo kiến trúc **Progressive Web App (Offline-First)**, tích hợp thanh toán **VietQR động**, **SignalR Real-time** và **AI dự báo nhu cầu nhập hàng**.
* **1.3. Khảo sát & So sánh các hệ thống hiện có:** Đối chiếu tính năng và kiến trúc kỹ thuật với KiotViet, Sapo POS, Square POS để làm nổi bật điểm mạnh của giải pháp đề xuất.
* **1.4. Kế hoạch thực hiện dự án (Agile / Scrum với Jira):** Phân chia các Sprint, quản lý Product Backlog và phân công nhiệm vụ trong nhóm.

### **CHƯƠNG 2: PHÂN TÍCH YÊU CẦU HỆ THỐNG**
* **2.1. Yêu cầu chức năng (Functional Requirements):**
  * Phân hệ Quản trị đa cửa hàng & Phân quyền (`Tenant`, `Manager`, `Cashier`).
  * Phân hệ Bán hàng tại quầy POS (Quét mã vạch, Giỏ hàng đa tab, Chiết khấu, In hóa đơn nhiệt, Bán hàng Offline).
  * Phân hệ Thanh toán đa phương thức (Tiền mặt, Thẻ, Chuyển khoản VietQR động tự động xác nhận).
  * Phân hệ Quản lý Kho & Sổ cái (Nhập kho tính giá vốn WAC, Thẻ kho bất biến, Hoàn trả hàng).
  * Phân hệ Thống kê & AI Gợi ý nhập hàng tối ưu.
* **2.2. Yêu cầu phi chức năng (Non-Functional Requirements):** Hiệu năng phản hồi API ($p95 < 120\text{ms}$), tính toàn vẹn dữ liệu đồng thời (chống âm kho), bảo mật (JWT, BCrypt, HMAC Webhook, cô lập dữ liệu Tenant) và khả năng chịu lỗi mất mạng.
* **2.3. Mô hình hóa Use Case:** Sơ đồ Use Case tổng quát và bảng đặc tả chi tiết các Use Case cốt lõi.

### **CHƯƠNG 3: THIẾT KẾ KIẾN TRÚC & CƠ SỞ DỮ LIỆU**
* **3.1. Kiến trúc tổng thể & Lựa chọn công nghệ:** Clean Architecture + DDD (.NET 8), React 18 TypeScript PWA, PostgreSQL 16, SignalR, Hangfire, Docker.
* **3.2. Thiết kế Cơ sở dữ liệu Đa cửa hàng (Multi-Tenant ERD):** Chi tiết 10 bảng dữ liệu, ràng buộc toàn vẹn, chỉ mục tối ưu và Trigger bảo vệ bảng Sổ cái Append-Only.
* **3.3. Thiết kế Chi tiết Nghiệp vụ Lõi:**
  * Thuật toán tính Giá vốn bình quân gia quyền (**WAC**) và khóa dòng bi quan **`SELECT ... FOR UPDATE`**.
  * Máy trạng thái đơn hàng (**Order State Machine**) và cơ chế **Idempotency**.
  * Kiến trúc **Offline-First PWA** (Service Worker + IndexedDB Sync Queue).
  * Mô hình **AI Dự báo nhu cầu & Điểm đặt hàng lại (ROP)**.
* **3.4. Sơ đồ Tuần tự (Sequence Diagrams) & Thiết kế Giao diện (UI/UX Wireframes).**

### **CHƯƠNG 4: TRIỂN KHAI XÂY DỰNG HỆ THỐNG**
* **4.1. Tổ chức cấu trúc mã nguồn (Monorepo: Backend, Frontend, AI Service).**
* **4.2. Hiện thực hóa các phân hệ tiêu biểu:** Trình bày mã nguồn cốt lõi kèm giải thích kỹ thuật (EF Core Global Query Filter, `Product.DeductStock`, Single-Flight Refresh Token, `useBarcodeScanner`, SignalR Hub).
* **4.3. Đóng gói & Tự động hóa CI/CD:** Cấu hình Docker Multi-Stage, Docker Compose và GitHub Actions.

### **CHƯƠNG 5: KIỂM THỬ & ĐÁNH GIÁ KẾT QUẢ THỰC NGHIỆM**
* **5.1. Chiến lược & Môi trường kiểm thử:** xUnit, FluentAssertions, **Testcontainers (PostgreSQL 16)**, Vitest, Playwright và Grafana k6.
* **5.2. Kết quả kiểm thử chức năng & bảo mật:** Bảng tổng hợp kết quả kiểm thử RBAC, cô lập Tenant và luồng Offline Sync.
* **5.3. Kết quả kiểm thử chịu tải đồng thời & hiệu năng:** Chứng minh bằng số liệu thực nghiệm kịch bản 20 thu ngân cùng mua 5 sản phẩm cuối cùng (**0 lỗi âm kho**) và biểu đồ độ trễ `k6` dưới tải 100 VUs.
* **5.4. Đánh giá độ chính xác mô hình AI Dự báo nhu cầu:** Kết quả chỉ số `WMAPE`, `MAE` qua Backtesting.

### **CHƯƠNG 6: KẾT LUẬN & HƯỚNG PHÁT TRIỂN**
* **6.1. Kết quả đạt được & Hạn chế còn tồn tại.**
* **6.2. Hướng phát triển mở rộng:** Tích hợp hóa đơn điện tử (VNPT/Viettel e-Invoice), quản lý chuỗi nhiều kho tổng, và mở rộng ứng dụng AI gợi ý bán chéo sản phẩm (**Market Basket Analysis**).

---
