# 🎤 Project Defense Presentation & Live Demo Script - POS PWA Project

Tài liệu này quy định **Cấu trúc Bộ Slide Thuyết trình (15–18 Slides)**, **Kịch bản Trình diễn Trực tiếp (Live Demo Script trong 7 phút)** và **Bộ Câu hỏi Phản biện Trọng tâm (Q&A Defense Bank)** nhằm giúp nhóm đạt điểm tối đa trước Hội đồng chấm đồ án tại **Trường Đại học Giao thông Vận tải TP.HCM (UTH)**.

---

## 🖥️ 1. Cấu trúc Bộ Slide Thuyết trình Chuẩn (15 Slides — Tổng thời lượng 15 phút)

| Slide | Tiêu đề Slide | Thời lượng | Nội dung cốt lõi cần trình bày |
| :---: | :--- | :---: | :--- |
| **01** | **Trang bìa Đề tài** | `0:30` | Tên đề tài (*Xây dựng Hệ thống Quản lý Bán hàng POS PWA Đa chi nhánh Tích hợp AI Dự báo Nhu cầu*), thông tin nhóm sinh viên, GVHD, Logo UTH. |
| **02** | **Bài toán Thực tế & Động lực** | `1:00` | Nêu 3 nỗi đau tại cửa hàng: Rớt mạng không bán được hàng; Bán âm kho giờ cao điểm; Nhập hàng theo cảm tính gây tồn đọng. |
| **03** | **Mục tiêu & Điểm nổi bật Giải pháp** | `1:00` | 4 trụ cột giải pháp: **Offline-First PWA**, **Chống âm kho & Sổ cái bất biến**, **VietQR Real-time**, **AI Gợi ý nhập hàng**. |
| **04** | **Kiến trúc Tổng thể Hệ thống** | `1:15` | Sơ đồ C4 Container: React 18 PWA + .NET 8 Clean Architecture + PostgreSQL 16 + SignalR + Hangfire + Python AI. |
| **05** | **Thiết kế Multi-Tenant & Bảo mật** | `1:00` | Mô hình Shared Schema (`tenant_id`) + EF Core Global Query Filter + JWT RAM & HttpOnly Refresh Token Rotation. |
| **06** | **Kiến trúc Sổ cái Kho & WAC** | `1:15` | Nguyên lý Append-Only Ledger, công thức Giá vốn bình quân gia quyền (**WAC**) và khóa dòng `FOR UPDATE`. |
| **07** | **Cơ chế Bán hàng Ngoại tuyến (Offline PWA)** | `1:00` | Sơ đồ luồng Service Worker + IndexedDB Sync Queue + `ClientOfflineId` Idempotency. |
| **08** | **Thanh toán VietQR Động & SignalR** | `0:45` | Luồng xác nhận biến động số dư tự động qua Webhook HMAC-SHA256 + SignalR Push $< 2\text{s}$. |
| **09** | **Phân hệ AI Dự báo Nhu cầu & ROP** | `1:00` | Phân tầng mô hình (`WMA` $\rightarrow$ `Holt-Winters` $\rightarrow$ `LightGBM`) & Công thức tính Điểm đặt hàng lại (`ROP`). |
| **10–11** | **DEMO TRỰC TIẾP HỆ THỐNG (LIVE DEMO)** | `6:00` | Trình diễn thực tế trên 2 cửa sổ trình duyệt song song + ngắt mạng thật + giả lập thanh toán VietQR. |
| **12** | **Kết quả Kiểm thử Tự động & Hiệu năng** | `0:45` | Số liệu Testcontainers, biểu đồ `k6` ($p95 < 120\text{ms}$), kiểm thử chống âm kho đồng thời và độ bao phủ Code Coverage. |
| **13** | **Kết luận & Hướng phát triển** | `0:30` | Tổng kết các mục tiêu đã hoàn thành và lộ trình tích hợp Hóa đơn điện tử. |

---

## 🎬 2. Kịch bản Trình diễn Trực tiếp Ấn tượng (Live Demo Script — 6 Phút)

Để buổi Demo diễn ra trơn tru, không bị lúng túng và làm nổi bật ngay giá trị kỹ thuật của đồ án:

1. **Cảnh 1 — Đồng bộ Real-time giữa 2 quầy thu ngân (`1.5 phút`):**
   * Mở song song **2 cửa sổ trình duyệt** đăng nhập cùng cửa hàng (`uth-coffee`): Cửa sổ trái là **Quầy Thu ngân 1**, cửa sổ phải là **Quầy Thu ngân 2**.
   * Quét mã vạch (hoặc bấm chọn) 2 ly *Cà phê Sữa Đá* ở Quầy 1 và bấm thanh toán (`F9`).
   * **Điểm nhấn:** Chỉ vào Quầy 2 để Hội đồng thấy số lượng tồn kho của *Cà phê Sữa Đá* tự động giảm ngay lập tức mà **không cần tải lại trang** (nhờ SignalR).
2. **Cảnh 2 — Thử thách Ngắt mạng Internet (`Offline-First PWA`) (`2.0 phút`):**
   * Mở Chrome DevTools $\rightarrow$ Tab Network $\rightarrow$ Bật chế độ **`Offline`** (hoặc tắt Wi-Fi thật).
   * Trên màn hình hiện nhãn cảnh báo **"Chế độ Ngoại tuyến"**. Thu ngân tiếp tục tạo đơn hàng mới, thanh toán tiền mặt và xuất mẫu biên lai nhiệt bình thường.
   * Bật lại mạng **`Online`** $\rightarrow$ Chỉ vào thanh trạng thái tự động chuyển sang *"Đang đồng bộ..."* và cập nhật đơn hàng lên máy chủ thành công.
3. **Cảnh 3 — Thanh toán VietQR Động Tự động Xác nhận (`1.5 phút`):**
   * Tạo đơn hàng mới $\rightarrow$ Chọn thanh toán **VietQR** $\rightarrow$ Hiển thị mã QR động chứa sẵn số tiền và mã đơn `POS ORD...`.
   * Gửi request giả lập Webhook ngân hàng (kèm chữ ký HMAC) $\rightarrow$ **Điểm nhấn:** Hộp thoại QR trên màn hình thu ngân tự động đóng lại kèm âm thanh *"Ting-Ting"* và hiển thị hóa đơn đã thanh toán.
4. **Cảnh 4 — Quản lý Kho (WAC), Thẻ kho & Gợi ý nhập hàng AI (`1.0 phút`):**
   * Chuyển sang tài khoản **Quản lý (`Manager`)**, mở **Thẻ kho** để chứng minh mọi giao dịch vừa demo đều được ghi sổ cái bất biến; sau đó mở tab **Gợi ý Nhập hàng AI** và thực hiện thao tác **1-Click tạo phiếu nhập kho**.

---

## ❓ 3. Ngân hàng Câu hỏi Phản biện Thường gặp & Gợi ý Trả lời Chuẩn

| Câu hỏi từ Hội đồng chấm thi | Trọng tâm câu trả lời kỹ thuật sắc bén |
| :--- | :--- |
| **1. Nếu đang mất mạng (Offline), 2 quầy cùng bán món cuối cùng thì khi có mạng lại xử lý xung đột tồn kho thế nào?** | *"Dạ thưa thầy/cô, ở chế độ Offline ưu tiên hàng đầu của POS là không từ chối khách đang đứng tại quầy. Khi có mạng trở lại, Server nhận đơn đầu tiên sẽ trừ kho bình thường; đơn thứ hai vẫn được ghi nhận doanh thu để khớp tiền mặt thu ngân đã thu, đồng thời hệ thống tự động bật cờ `RequiresInventoryReconciliation = true` và bắn cảnh báo đỏ qua SignalR cho Quản lý kiểm kê nhập bổ sung."* |
| **2. Tại sao nhóm lại lưu lịch sử kho bằng bảng Append-Only thay vì chỉ cập nhật trực tiếp cột `StockQuantity`?** | *"Dạ vì trong kế toán và bán lẻ, nếu chỉ lưu một con số tồn kho hiện tại thì khi xảy ra thất thoát hàng hóa sẽ không thể truy vết được mất vào lúc nào, do đơn bán, hoàn trả hay nhập kho. Bảng `inventory_transactions` kết hợp Trigger chặn `UPDATE/DELETE` đóng vai trò như sổ cái ngân hàng giúp đối soát chính xác 100% số dư tại mọi thời điểm."* |
| **3. Làm sao đảm bảo cửa hàng A không bao giờ xem trộm được dữ liệu của cửa hàng B khi dùng chung 1 Database?** | *"Dạ nhóm áp dụng phòng vệ 3 lớp: (1) Lấy `tenant_id` trực tiếp từ chữ ký JWT Token chứ không tin tưởng tham số từ Client; (2) Áp dụng EF Core Global Query Filter tự động chèn điều kiện `WHERE tenant_id = ...` vào mọi câu SQL; (3) Cô lập nhóm SignalR theo `tenant-{tenantId}` và đã viết bộ kiểm thử tích hợp tự động trên Testcontainers để xác minh."* |
| **4. Tại sao lại dùng `Access Token` lưu trong RAM thay vì lưu vào `localStorage` cho tiện?** | *"Dạ vì lưu JWT trong `localStorage` rất dễ bị đánh cắp nếu ứng dụng dính lỗi XSS. Nhóm lưu `Access Token` ngắn hạn (15 phút) trong RAM của Zustand và lưu `Refresh Token` dài hạn trong `HttpOnly + Secure + SameSite=Strict Cookie` kết hợp cơ chế xoay vòng Token để đạt mức bảo mật cao nhất trên trình duyệt."* |

---
