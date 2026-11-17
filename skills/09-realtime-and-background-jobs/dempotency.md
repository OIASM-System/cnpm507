# 🛡️ End-to-End Idempotency Architecture - POS PWA Project

Tài liệu này quy định kiến trúc đảm bảo **Tính Lũy Đẳng (Idempotency)** trên toàn bộ các điểm giao tiếp dễ xảy ra gửi trùng gói tin trong hệ thống **POS PWA (Point of Sale Progressive Web App)**. Trong môi trường thực tế tại cửa hàng, kết nối Wi-Fi/4G thường xuyên chập chờn khiến ứng dụng React PWA gửi lại cùng một yêu cầu thanh toán khi chưa kịp nhận phản hồi `200 OK`, hoặc cổng thanh toán ngân hàng gửi lại cùng một gói tin Webhook nhiều lần. Cơ chế Idempotency đảm bảo **một yêu cầu dù được gửi lại $N$ lần vẫn chỉ tạo ra duy nhất 1 hóa đơn, trừ kho đúng 1 lần và trả về cùng một kết quả nhất quán**.

---

## 🎯 1. Phạm vi Áp dụng Idempotency trong Hệ thống POS PWA

| Luồng giao dịch | Nguồn sinh khóa (`Idempotency Key`) | Cơ chế lưu trữ & Khóa trùng lặp | Hành vi khi nhận Request trùng lặp |
| :--- | :--- | :--- | :--- |
| **1. Thanh toán đơn Online (`POST /api/v1/orders`)** | Header `X-Idempotency-Key` (UUID v4 sinh khi bấm nút Thanh toán) | Bảng `idempotency_keys` trên PostgreSQL (`UNIQUE (tenant_id, key)`) | Trả về nguyên vẹn `HTTP Status Code` và `Response JSON` đã lưu từ lần xử lý đầu tiên. |
| **2. Đồng bộ đơn Ngoại tuyến (`POST /api/v1/orders/sync`)** | Thuộc tính `ClientOfflineId` (UUID v4 sinh lúc tạo đơn Offline) | Chỉ mục duy nhất `UNIQUE (tenant_id, client_offline_id)` trên bảng `orders` | Bỏ qua bước tạo mới & trừ kho, trả về thông tin hóa đơn đã đồng bộ trước đó. |
| **3. Tiếp nhận Webhook Ngân hàng (`POST /api/v1/webhooks/...`)** | Mã giao dịch duy nhất của ngân hàng (`BankTransactionId`) | Bảng `processed_webhooks` (`UNIQUE (provider, external_transaction_id)`) | Ghi nhận đã xử lý và trả về `200 OK` ngay lập tức. |

---

## 🗄️ 2. Thiết kế Bảng `idempotency_keys` (PostgreSQL 16)

```sql
CREATE TABLE idempotency_keys (
    id uuid PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    idempotency_key varchar(100) NOT NULL,
    request_path varchar(200) NOT NULL,
    status varchar(20) NOT NULL, -- 'Processing', 'Completed'
    response_status_code integer NULL,
    response_body jsonb NULL,
    created_at timestamptz NOT NULL,
    expires_at timestamptz NOT NULL
);

-- Ràng buộc duy nhất cấp độ Database chống Race Condition khi 2 request trùng gửi tới cùng 1 mili-giây
CREATE UNIQUE INDEX ux_idempotency_keys_tenant_key 
ON idempotency_keys (tenant_id, idempotency_key);
```

---

## 💻 3. Triển khai `IdempotencyBehavior` trong MediatR Pipeline (.NET 8)

Thay vì viết lặp lại logic kiểm tra trùng lặp ở từng Handler, hệ thống sử dụng **MediatR Pipeline Behavior (`IdempotencyBehavior<TRequest, TResponse>`)** cho mọi Command triển khai giao diện đánh dấu `IIdempotentCommand`:

```csharp
public interface IIdempotentCommand
{
    string IdempotencyKey { get; }
}

public sealed class IdempotencyBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IIdempotentCommand
{
    private readonly AppDbContext _dbContext;
    private readonly ITenantContext _tenantContext;

    public IdempotencyBehavior(AppDbContext dbContext, ITenantContext tenantContext)
    {
        _dbContext = dbContext;
        _tenantContext = tenantContext;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.IdempotencyKey))
            return await next();

        var tenantId = _tenantContext.TenantId;

        // 1. Kiểm tra xem khóa đã tồn tại trong DB chưa
        var existingRecord = await _dbContext.IdempotencyKeys
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.IdempotencyKey == request.IdempotencyKey, ct);

        if (existingRecord is not null)
        {
            if (existingRecord.Status == "Processing")
            {
                // Request đầu tiên vẫn đang chạy -> Trả về 409 Conflict để Client chờ
                throw new ConcurrencyConflictException("Giao dịch đang được hệ thống xử lý, vui lòng không gửi lại.");
            }

            // Trả về kết quả đã lưu từ lần thực thi thành công trước đó
            return JsonSerializer.Deserialize<TResponse>(existingRecord.ResponseBody!)!;
        }

        // 2. Đăng ký khóa ở trạng thái 'Processing' (Ràng buộc UNIQUE Index sẽ chặn nếu có luồng đua tranh)
        var newRecord = IdempotencyRecord.Start(tenantId, request.IdempotencyKey, typeof(TRequest).Name);
        _dbContext.IdempotencyKeys.Add(newRecord);
        await _dbContext.SaveChangesAsync(ct);

        try
        {
            // 3. Thực thi Command Handler nghiệp vụ
            var response = await next();

            // 4. Lưu kết quả phản hồi để phục vụ các lần gọi lại sau
            newRecord.Complete(200, JsonSerializer.Serialize(response));
            await _dbContext.SaveChangesAsync(ct);

            return response;
        }
        catch
        {
            // Nếu nghiệp vụ thất bại (VD: hết tồn kho), xóa khóa Processing để người dùng có thể sửa đơn và thử lại
            _dbContext.IdempotencyKeys.Remove(newRecord);
            await _dbContext.SaveChangesAsync(ct);
            throw;
        }
    }
}
```

---

## 🧹 4. Vòng đời Lưu trữ & Dọn dẹp Khóa Idempotency

* **Thời gian hiệu lực (`TTL = 24 giờ`):** Mỗi bản ghi `IdempotencyRecord` có `expires_at = created_at + 24 hours`.
* Tác vụ nền Hangfire chạy vào **03:00 sáng hàng ngày** tự động xóa các bản ghi `idempotency_keys` đã quá hạn 24 giờ để duy trì kích thước bảng và chỉ mục nhỏ gọn.

---
