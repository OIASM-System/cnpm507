# 📚 Technical Documentation, Reporting & Project Presentation - POS PWA Project

Thư mục này tổng hợp toàn bộ quy chuẩn **Biên soạn Tài liệu Kỹ thuật (Technical Writing)**, **Đặc tả Tài liệu API (OpenAPI / Swagger)**, **Hướng dẫn Sử dụng (User Manual)**, **Thiết kế Sơ đồ Hệ thống (Draw.io & UML)**, **Cấu trúc Báo cáo Đồ án** và **Kịch bản Thuyết trình Bảo vệ (Project Presentation)** cho hệ thống **POS PWA (Point of Sale Progressive Web App)**. Mục tiêu là chuyển hóa toàn bộ các quyết định kiến trúc, mô hình dữ liệu và mã nguồn thành hệ thống tài liệu chuyên nghiệp, nhất quán, phục vụ đồng thời cả đội ngũ kỹ thuật bảo trì sau này, người dùng cuối tại cửa hàng và Hội đồng chấm đồ án tại **Trường Đại học Giao thông Vận tải TP.HCM (UTH)**.

---

## 📂 Cấu trúc thư mục `13-documentation-and-presentation/`

```text
13-documentation-and-presentation/
├── README.md                 # Tổng quan bộ quy chuẩn tài liệu, báo cáo & thuyết trình dự án
├── technical-writing.md      # Tiêu chuẩn viết tài liệu kiến trúc Markdown, ADR & Quy tắc trình bày
├── api-documentation.md      # Quy chuẩn đặc tả REST API & SignalR Events với OpenAPI 3.1 / Scalar
├── user-guide-writing.md     # Cấu trúc tài liệu Hướng dẫn sử dụng theo vai trò (Cashier & Manager)
├── drawio-diagrams.md        # Bộ quy chuẩn vẽ sơ đồ kiến trúc, ERD, Use Case & Sequence trên Draw.io
├── report-writing.md         # Đề cương chi tiết Báo cáo Đồ án học phần chuẩn học thuật UTH
└── project-presentation.md   # Cấu trúc Slide thuyết trình, Kịch bản Demo Live & Câu hỏi phản biện
```

---

## 🎯 Bản đồ Đối tượng Đọc & Sản phẩm Tài liệu Tương ứng

| Đối tượng tiếp nhận | Tài liệu phục vụ chính | Mục tiêu truyền đạt cốt lõi |
| :--- | :--- | :--- |
| **Lập trình viên & Người bảo trì hệ thống** | `technical-writing.md`, `api-documentation.md`, `drawio-diagrams.md` | Hiểu rõ ranh giới Clean Architecture, luồng dữ liệu Multi-Tenant, hợp đồng API và sơ đồ tuần tự. |
| **Chủ cửa hàng & Nhân viên Thu ngân** | `user-guide-writing.md` | Nắm bắt nhanh cách cài đặt PWA, quét mã vạch, thanh toán tiền mặt/VietQR, bán hàng khi mất mạng và in hóa đơn. |
| **Giảng viên hướng dẫn & Hội đồng chấm thi** | `report-writing.md`, `project-presentation.md` | Đánh giá tính hoàn thiện của giải pháp kỹ thuật, độ sâu giải quyết bài toán thực tế (Concurrency, Offline Sync, WAC, AI) và demo vận hành trơn tru. |

---
