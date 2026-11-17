# 🔌 API Integration, Token Refresh & SignalR Client - POS PWA Project

Tài liệu này quy định kiến trúc tầng giao tiếp mạng (**Network & Real-time Communication Layer**) giữa ứng dụng **React PWA** và **ASP.NET Core 8 Web API** trong hệ thống **POS PWA (Point of Sale Progressive Web App)**. Thiết kế tập trung vào việc tự động hóa gắn `JWT Bearer Token`, xử lý làm mới phiên làm việc không gián đoạn thông qua mẫu **Single-Flight Refresh Queue**, chuẩn hóa thông báo lỗi RFC 7807 (`ProblemDetails`) và duy trì kết nối thời gian thực **SignalR** tự động phục hồi sau khi mất mạng.

---

## 🌐 1. Cấu hình Axios Client & Single-Flight Refresh Interceptor

Tệp `src/lib/axiosInstance.ts` khởi tạo một thực thể Axios dùng chung cho toàn bộ ứng dụng với `withCredentials: true` (cho phép trình duyệt gửi kèm `HttpOnly Cookie` chứa `Refresh Token`).

### 1.1. Cơ chế Single-Flight Refresh Token (Chống gọi trùng `/auth/refresh`)
Khi `Access Token` (15 phút) hết hạn, nhiều API có thể cùng trả về lỗi `401 Unauthorized` tại một thời điểm. Bộ chặn phản hồi (**Response Interceptor**) sử dụng hàng đợi `failedQueue` để đảm bảo chỉ gửi **duy nhất 1 yêu cầu** `POST /api/v1/auth/refresh`, các request còn lại tạm dừng chờ token mới và tự động thực thi lại:

```typescript
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
  withCredentials: true, // Bắt buộc để gửi HttpOnly Refresh Token Cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Tự động đính kèm Access Token từ RAM
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Response Interceptor: Single-Flight Refresh Token khi gặp 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Không thử refresh nếu chính endpoint /auth/login hoặc /auth/refresh trả về 401
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        useAuthStore.getState().setSession(data.accessToken, data.user);
        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearSession();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 📡 2. Tích hợp SignalR Real-time Client (`usePosSignalR.ts`)

Sử dụng thư viện `@microsoft/signalr` để kết nối tới `/hubs/pos-sync`, truyền `accessTokenFactory` đọc trực tiếp từ `useAuthStore` trong RAM và kích hoạt cơ chế tự động kết nối lại (**Exponential Backoff Reconnect**) khi mạng chập chờn tại cửa hàng:

```typescript
import { useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';
import { posQueryKeys } from '@/lib/queryKeys';
import type { ProductDto } from '@/types/product.types';

export function usePosSignalR() {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user?.tenantId) return;

    const hubUrl = import.meta.env.VITE_SIGNALR_HUB_URL || '/hubs/pos-sync';

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        // Luôn lấy Access Token mới nhất từ RAM mỗi khi kết nối hoặc reconnect
        accessTokenFactory: () => useAuthStore.getState().accessToken ?? '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Lắng nghe sự kiện cập nhật tồn kho từ các quầy khác trong cùng cửa hàng
    connection.on('StockUpdated', (payload: { productId: string; newStockQuantity: number; newAvailableQuantity: number }) => {
      queryClient.setQueryData<ProductDto[]>(
        posQueryKeys.products(user.tenantId),
        (old) =>
          old?.map((item) =>
            item.id === payload.productId
              ? {
                  ...item,
                  stockQuantity: payload.newStockQuantity,
                  availableQuantity: payload.newAvailableQuantity,
                }
              : item
          )
      );
    });

    // Khi vừa kết nối lại sau khi rớt mạng -> làm mới toàn bộ tồn kho & lịch sử đơn
    connection.onreconnected(() => {
      queryClient.invalidateQueries({ queryKey: posQueryKeys.products(user.tenantId) });
    });

    connection.start().catch((err) => {
      console.warn('[SignalR] Không thể kết nối Real-time Hub (đang ở chế độ Offline):', err);
    });

    return () => {
      connection.stop();
    };
  }, [isAuthenticated, user?.tenantId, queryClient]);
}
```

---

## ⚠️ 3. Chuẩn hóa Xử lý Lỗi API (`ProblemDetails` Parser)

Mọi phản hồi lỗi từ Backend .NET 8 đều tuân theo định dạng chuẩn **RFC 7807 `ProblemDetails`** (`status`, `title`, `detail`, `errors`). Tầng API Integration cung cấp hàm trích xuất thông báo lỗi thân thiện tiếng Việt để hiển thị qua **Toast Notification** cho thu ngân:

* **`409 Conflict` (`InsufficientStockException` / `DbUpdateConcurrencyException`):** Hiển thị cảnh báo màu cam (*"Sản phẩm vừa hết hàng ở quầy khác"* hoặc *"Dữ liệu vừa được cập nhật, đang tải lại..."*) và tự động gọi `queryClient.invalidateQueries` để làm mới số lượng tồn kho trên màn hình.
* **`429 Too Many Requests`:** Hiển thị thông báo tạm khóa thao tác trong giây lát do vượt ngưỡng tần suất gọi API.
* **`Network Error` (Không có phản hồi từ Server):** Tự động chuyển luồng thanh toán sang chế độ lưu đơn ngoại tuyến (`IndexedDB Offline Queue`) mà không làm gián đoạn khách hàng đang đứng chờ tại quầy.

---