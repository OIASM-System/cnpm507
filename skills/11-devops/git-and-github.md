# 🐙 Git Standards & GitHub Repository Management - POS PWA Project

Tài liệu này quy định các tiêu chuẩn quản lý mã nguồn bằng **Git** và tổ chức kho lưu trữ trên **GitHub** cho dự án **POS PWA (Point of Sale Progressive Web App)**. Việc tuân thủ nhất quán quy chuẩn Commit và tổ chức Monorepo giúp cả nhóm dễ dàng theo dõi lịch sử thay đổi theo từng phân hệ nghiệp vụ, tự động hóa việc tạo nhật ký phát hành (**Changelog**) và tránh xung đột mã nguồn khi làm việc song song.

---

## 📁 1. Cấu trúc Kho lưu trữ Monorepo (`pos-pwa-system/`)

Toàn bộ mã nguồn Backend, Frontend, kiểm thử hiệu năng và tài liệu kỹ thuật được quản lý tập trung trong một Monorepo duy nhất để đồng bộ phiên bản hợp đồng API giữa Client và Server:

```text
pos-pwa-system/
├── .github/
│   ├── workflows/            # Các tệp cấu hình CI/CD GitHub Actions
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/                     # Toàn bộ bộ tài liệu thiết kế kiến trúc hệ thống (01 -> 13)
├── src/
│   ├── backend/              # Solution .NET 8 (Domain, Application, Infrastructure, WebApi)
│   └── frontend/             # Ứng dụng React 18 + TypeScript + Vite PWA
├── tests/
│   ├── backend/              # Unit Tests & Integration Tests (Testcontainers)
│   └── performance/          # Kịch bản kiểm thử tải Grafana k6
├── docker-compose.yml        # Cấu hình chạy toàn bộ hệ thống bằng Docker
├── .env.example              # Mẫu biến môi trường chuẩn (không chứa giá trị thật)
└── .gitignore                # Quy tắc loại trừ tệp tạm, bin/obj, node_modules, .env
```

---

## ✍️ 2. Quy chuẩn Thông điệp Commit (`Conventional Commits v1.0.0`)

Mọi Commit trong dự án bắt buộc tuân theo định dạng chuẩn:

```text
<type>(<scope>): <mô tả ngắn gọn bằng tiếng Việt hoặc tiếng Anh, không viết hoa chữ đầu, không dấu chấm cuối>
```

### Bảng phân loại `type` và `scope` chuẩn của dự án:

| `type` | Ý nghĩa thay đổi | `scope` hợp lệ | Ví dụ Commit chuẩn |
| :--- | :--- | :--- | :--- |
| **`feat`** | Thêm tính năng nghiệp vụ mới | `domain`, `api`, `pos-ui`, `pwa`, `signalr`, `ai` | `feat(pos-ui): bổ sung phím tắt F9 mở hộp thoại thanh toán` |
| **`fix`** | Sửa lỗi logic hoặc giao diện | `inventory`, `order`, `auth`, `sync`, `print` | `fix(inventory): khắc phục lỗi làm tròn giá vốn WAC khi nhập lẻ` |
| **`refactor`** | Tối ưu cấu trúc code, không đổi hành vi | `domain`, `api`, `hooks`, `stores` | `refactor(order): tách logic tính chiết khấu sang Domain Service` |
| **`test`** | Bổ sung hoặc cập nhật kiểm thử tự động | `unit`, `integration`, `e2e`, `k6` | `test(integration): thêm kịch bản kiểm thử chống bán vượt tồn kho` |
| **`docs`** | Cập nhật tài liệu kiến trúc / hướng dẫn | `arch`, `api-docs`, `db`, `devops` | `docs(devops): bổ sung hướng dẫn cấu hình biến môi trường Docker` |
| **`chore`** | Cập nhật thư viện, cấu hình Docker / CI | `docker`, `ci`, `deps` | `chore(docker): tối ưu multi-stage build cho image .NET 8 Web API` |

---

## 🚫 3. Quy tắc Bảo vệ Tệp Nhạy cảm (`.gitignore` & Pre-commit Guard)

Tuyệt đối không đẩy lên GitHub các tệp sau:
1. Toàn bộ tệp cấu hình chứa bí mật thực tế: `.env`, `.env.local`, `.env.production`, `appsettings.Production.json`.
2. Thư mục biên dịch và gói thư viện: `bin/`, `obj/`, `node_modules/`, `dist/`, `.vite/`, `TestResults/`, `playwright-report/`.
3. Tệp cấu hình cá nhân của IDE: `.vs/`, `.idea/`, `*.user`.

---
