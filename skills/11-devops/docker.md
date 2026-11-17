# 🐳 Docker Multi-Stage Build & Container Security - POS PWA Project

Tài liệu này quy định kiến trúc đóng gói **Docker Images** theo chuẩn **Multi-Stage Build** cho cả hai thành phần cốt lõi của hệ thống **POS PWA (Point of Sale Progressive Web App)**: **Backend ASP.NET Core 8 Web API** và **Frontend React PWA (phục vụ qua Nginx Alpine)**. Kỹ thuật Multi-Stage Build tách biệt hoàn toàn môi trường biên dịch nặng nề (`SDK`, `Node.js`) khỏi môi trường vận hành gọn nhẹ (`ASP.NET Runtime`, `Nginx Alpine`), giúp giảm kích thước Image xuống dưới **120MB** và loại bỏ toàn bộ công cụ biên dịch khỏi môi trường Production để tăng cường bảo mật.

---

## ⚙️ 1. Multi-Stage Dockerfile cho Backend (.NET 8 Web API)

Tệp `src/backend/Dockerfile` tối ưu hóa cơ chế **Layer Caching** bằng cách sao chép các tệp `.csproj` và chạy `dotnet restore` trước khi sao chép toàn bộ mã nguồn C#, đồng thời cấu hình chạy container bằng người dùng không đặc quyền (`non-root user`):

```dockerfile
# ==============================================================================
# GIAI ĐOẠN 1: RESTORE & BUILD (Sử dụng .NET 8 SDK)
# ==============================================================================
FROM [mcr.microsoft.com/dotnet/sdk:8.0-alpine](https://mcr.microsoft.com/dotnet/sdk:8.0-alpine) AS build
WORKDIR /src

# Sao chép riêng các tệp định nghĩa dự án để tận dụng Docker Layer Cache
COPY ["PosPwa.Domain/PosPwa.Domain.csproj", "PosPwa.Domain/"]
COPY ["PosPwa.Application/PosPwa.Application.csproj", "PosPwa.Application/"]
COPY ["PosPwa.Infrastructure/PosPwa.Infrastructure.csproj", "PosPwa.Infrastructure/"]
COPY ["PosPwa.WebApi/PosPwa.WebApi.csproj", "PosPwa.WebApi/"]

RUN dotnet restore "PosPwa.WebApi/PosPwa.WebApi.csproj"

# Sao chép toàn bộ mã nguồn và biên dịch bản Release
COPY . .
WORKDIR "/src/PosPwa.WebApi"
RUN dotnet publish "PosPwa.WebApi.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore \
    /p:UseAppHost=false

# ==============================================================================
# GIAI ĐOẠN 2: RUNTIME IMAGE (Sử dụng ASP.NET Core 8 Alpine siêu nhẹ ~110MB)
# ==============================================================================
FROM [mcr.microsoft.com/dotnet/aspnet:8.0-alpine](https://mcr.microsoft.com/dotnet/aspnet:8.0-alpine) AS final
WORKDIR /app

# Cài đặt thư viện ICU để hỗ trợ đầy đủ định dạng tiếng Việt (vi-VN) và múi giờ
RUN apk add --no-cache icu-libs tzdata curl
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
ENV TZ=Asia/Ho_Chi_Minh

# Tạo người dùng không đặc quyền (Non-root user) để bảo mật container
RUN addgroup -S posgroup && adduser -S posuser -G posgroup

COPY --from=build --chown=posuser:posgroup /app/publish .

USER posuser
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# Kiểm tra sức khỏe container tự động (Docker Healthcheck)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "PosPwa.WebApi.dll"]
```

---

## 🌐 2. Multi-Stage Dockerfile & Nginx Config cho Frontend (React PWA)

### 2.1. `src/frontend/Dockerfile`
```dockerfile
# ==============================================================================
# GIAI ĐOẠN 1: BUILD REACT PWA BUNDLE (Node 20 Alpine)
# ==============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ==============================================================================
# GIAI ĐOẠN 2: SERVE STATIC PWA & REVERSE PROXY (Nginx Alpine ~40MB)
# ==============================================================================
FROM nginx:1.27-alpine AS production

# Xóa cấu hình mặc định và nạp cấu hình tối ưu cho React SPA + Service Worker + SignalR
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/pos-pwa.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2.2. Quy tắc Cache quan trọng trong `src/frontend/nginx.conf`
Để cơ chế cập nhật phiên bản mới của **Progressive Web App** hoạt động chính xác tuyệt đối và kết nối **SignalR WebSocket** không bị ngắt:
* **`sw.js` và `manifest.webmanifest`:** Bắt buộc gắn Header `Cache-Control: no-cache, no-store, must-revalidate` để trình duyệt luôn kiểm tra bản Service Worker mới nhất trên máy chủ.
* **Các tệp tĩnh có mã Hash (`/assets/*.js`, `*.css`):** Gắn `Cache-Control: public, max-age=31536000, immutable` để tăng tốc độ tải tối đa.
* **Reverse Proxy cho `/api/` và `/hubs/`:** Chuyển tiếp lưu lượng tới container Backend kèm các Header nâng cấp giao thức WebSocket (`Upgrade`, `Connection "upgrade"`).

---
