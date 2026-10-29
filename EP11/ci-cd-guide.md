# HƯỚNG DẪN QUY TRÌNH CI/CD VỚI GITHUB ACTIONS

1. TỔNG QUAN PIPELINE
Hệ thống OISM tích hợp tự động hóa xây dựng và triển khai (CI/CD) thông qua GitHub Actions workflows đặt tại thư mục .github/workflows/.

2. CÁC WORKFLOW CHÍNH
• backend-ci.yml:
  - Trigger: Khi có Pull Request hoặc Push vào nhánh main/develop thuộc thư mục backend/.
  - Nhiệm vụ: Restore Packages -> Build Solution .NET 8 -> Chạy Unit Tests & Integration Tests -> Báo cáo Code Coverage.
• frontend-ci.yml:
  - Trigger: Khi có PR/Push thuộc thư mục frontend/.
  - Nhiệm vụ: ESLint -> Type Check (TypeScript) -> Build Admin Dashboard & POS PWA -> Chạy E2E Tests (Playwright).
• docker-build.yml:
  - Trigger: Khi nhãn (Tag) phiên bản mới được tạo (VD: v1.0.0).
  - Nhiệm vụ: Đóng gói Docker Images -> Push lên GitHub Container Registry (GHCR) hoặc Docker Hub.
• deployment.yml:
  - Trigger: Sau khi docker-build.yml hoàn tất thành công.
  - Nhiệm vụ: SSH vào máy chủ Production -> Pull Docker Image mới -> Chạy Database Migrations -> Restart Containers.

3. QUẢN LÝ SECRETS TRÊN GITHUB REPOSITORY
Cần cấu hình các hằng số bảo mật trong Settings -> Secrets and variables -> Actions:
• DOCKER_USERNAME & DOCKER_PASSWORD: Tài khoản đăng nhập Docker Registry.
• PROD_SERVER_HOST: Địa chỉ IP máy chủ Production.
• PROD_SERVER_SSH_KEY: Khóa SSH riêng tư để kết nối máy chủ.
• PROD_JWT_SECRET: Chuỗi khóa bí mật cho xác thực JWT Token.