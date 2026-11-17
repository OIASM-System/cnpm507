# ⚙️ Backend Development (.NET & Clean Architecture) - POS PWA Project

Thư mục này lưu trữ toàn bộ tài liệu kỹ thuật, chuẩn mực lập trình (Coding Standards) và hướng dẫn thiết kế kiến trúc phía máy chủ (**Backend**) cho hệ thống **POS PWA (Point of Sale Progressive Web App)**. Hệ thống được xây dựng trên nền tảng **.NET (C#)** áp dụng **Clean Architecture**, kết hợp **Domain-Driven Design (DDD)** và mô hình **CQRS** nhằm đảm bảo hiệu năng cao, dễ mở rộng và xử lý an toàn các giao dịch bán hàng đồng thời.

---

## 📂 Cấu trúc thư mục `03-backend-dotnet/`

```text
03-backend-dotnet/
├── README.md                   # Tài liệu tổng quan kiến trúc Backend & Tech Stack
├── csharp-fundamentals.md      # Quy chuẩn lập trình C# hiện đại (Async/Await, LINQ, Records)
├── dotnet-web-api.md           # Thiết kế RESTful API, Versioning, JWT Auth & SignalR Hub
├── clean-architecture.md       # Phân tầng kiến trúc sạch (Domain, Application, Infrastructure, API)
├── domain-driven-design.md     # Mô hình hóa nghiệp vụ cốt lõi (Aggregates, Entities, Value Objects)
├── cqrs-and-mediatr.md         # Tách biệt luồng Đọc/Ghi (Commands & Queries) với MediatR
├── dependency-injection.md     # Quản lý vòng đời dịch vụ (Scoped, Transient, Singleton)
├── validation.md               # Kiểm tra tính hợp lệ dữ liệu đầu vào với FluentValidation
├── exception-handling.md       # Xử lý ngoại lệ tập trung (Global Exception Handler & ProblemDetails)
└── logging.md                  # Ghi nhận nhật ký hệ thống có cấu trúc với Serilog
```

---

## 🛠️ Công nghệ & Thư viện cốt lõi (Backend Tech Stack)

| Thành phần | Công nghệ / Thư viện | Vai trò trong dự án POS PWA |
| :--- | :--- | :--- |
| **Framework** | **.NET 8 / ASP.NET Core Web API** | Nền tảng xây dựng RESTful API hiệu năng cao, đa nền tảng. |
| **Ngôn ngữ** | **C# 12** | Tận dụng `record`, `pattern matching`, `async/await` để viết code sạch và an toàn. |
| **Kiến trúc** | **Clean Architecture + DDD** | Tách biệt logic nghiệp vụ POS (tính tiền, trừ kho) khỏi cơ sở dữ liệu và framework. |
| **Design Pattern** | **CQRS (MediatR)** | Tách bạch truy vấn danh mục sản phẩm (Query) và giao dịch tạo đơn (Command). |
| **ORM & Database** | **Entity Framework Core + PostgreSQL** | Ánh xạ đối tượng, quản lý Migration và thực thi khóa giao dịch chống bán quá mức (Anti-oversell). |
| **Real-time** | **ASP.NET Core SignalR** | Đồng bộ tức thì số lượng tồn kho và trạng thái đơn hàng giữa các quầy thu ngân. |
| **Validation** | **FluentValidation** | Kiểm tra dữ liệu giỏ hàng, số lượng sản phẩm, phương thức thanh toán trước khi xử lý. |
| **Logging** | **Serilog** | Ghi log có cấu trúc (Structured Logging) phục vụ truy vết giao dịch và gỡ lỗi. |

---

## 🎯 Nguyên tắc kỹ thuật trọng tâm

1. **Tính toàn vẹn giao dịch (ACID & Anti-Oversell):** Mọi thao tác chốt đơn (`Checkout`) đều được bọc trong Database Transaction kết hợp cơ chế kiểm soát đồng thời (Concurrency Control), đảm bảo không bao giờ xảy ra tình trạng âm kho khi nhiều thu ngân thanh toán cùng lúc.
2. **Độc lập hạ tầng (Persistence Ignorance):** Tầng `Domain` và `Application` hoàn toàn không phụ thuộc vào PostgreSQL hay EF Core, giúp dễ dàng viết Unit Test cho các quy tắc tính chiết khấu, thuế và tồn kho.
3. **Phản hồi chuẩn hóa (Consistent API Contract):** Mọi phản hồi thành công hay lỗi đều tuân theo định dạng thống nhất (`Result<T>` hoặc chuẩn RFC 7807 `ProblemDetails`) để Frontend React PWA dễ dàng xử lý và hiển thị thông báo cho thu ngân.

---
