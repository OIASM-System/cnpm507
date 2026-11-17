# 📐 System Analysis & UML Modeling (Phân tích hệ thống & Mô hình hóa UML) - POS PWA Project

Thư mục này tập trung lưu trữ toàn bộ các tài liệu phân tích hệ thống và mô hình hóa bằng chuẩn **UML (Unified Modeling Language)** dành cho ứng dụng **POS PWA (Point of Sale Progressive Web App)**. Các sơ đồ này đóng vai trò cầu nối quan trọng giữa yêu cầu nghiệp vụ (Business Analysis) và kiến trúc lập trình mã nguồn thực tế (Backend .NET, Frontend React).

---

## 📂 Cấu trúc thư mục `02-system-analysis-and-uml/`

```text
02-system-analysis-and-uml/
├── README.md                   # Tài liệu hướng dẫn tổng quan phân môn Phân tích hệ thống & UML
├── use-case-diagram.md         # Sơ đồ Use Case tổng quát (Tác nhân và các chức năng hệ thống)
├── class-diagram.md            # Sơ đồ lớp (Cấu trúc các thực thể: Product, Order, OrderDetail, User,...)
├── sequence-diagram.md         # Sơ đồ tuần tự (Luồng tương tác chi tiết giữa UI, API và Database)
├── activity-diagram.md         # Sơ đồ hoạt động (Luồng xử lý nghiệp vụ bán hàng và thanh toán)
├── state-machine-diagram.md    # Sơ đồ chuyển đổi trạng thái (Vòng đời của Đơn hàng từ Pending đến Completed)
├── component-diagram.md        # Sơ đồ thành phần (Kiến trúc phân rã các module Frontend PWA & Backend API)
└── deployment-diagram.md       # Sơ đồ triển khai (Hạ tầng hosting, Database server và máy in nhiệt POS)