# ⚡ Concurrency & Anti-Oversell Stress Testing - POS PWA Project

Tài liệu này quy định các bài **Kiểm thử Chịu tải Đồng thời (Concurrency & Race Condition Testing)** nhằm chứng minh tính đúng đắn tuyệt đối của cơ chế khóa dòng bi quan (`SELECT ... FOR UPDATE`), khóa lạc quan (`Optimistic Locking - xmin`) và chỉ mục lũy đẳng (`Idempotency`) trong hệ thống **POS PWA (Point of Sale Progressive Web App)**. Trong môi trường chuỗi cửa hàng bán lẻ hoặc giờ cao điểm khuyến mãi, nhiều quầy thu ngân có thể đồng loạt chốt đơn trên cùng một mã hàng cuối cùng chỉ cách nhau vài mili-giây.

---

## 🎯 1. Các Kịch bản Đua tranh Đồng thời Bắt buộc Kiểm chứng

| Kịch bản Race Condition | Mô hình giả lập đồng thời | Cơ chế phòng vệ được kiểm thử | Tiêu chí nghiệm thu bắt buộc (Assertions) |
| :--- | :--- | :--- | :--- |
| **1. Chống bán vượt tồn kho (`Anti-Oversell`)** | Tồn kho ban đầu `stock_quantity = 5`. Bắn đồng thời **20 HTTP Request `POST /api/v1/orders`** (mỗi đơn mua `1` sản phẩm) tại cùng một thời điểm qua `Task.WhenAll`. | PostgreSQL Row-Level Lock (`FOR UPDATE`) + `CHECK (stock_quantity >= 0)` | • Đúng **5 request** thành công (`201 Created`).<br>• Đúng **15 request** bị từ chối (`409 Conflict`).<br>• `stock_quantity` cuối cùng bằng đúng **`0`** (không bao giờ âm).<br>• Bảng `inventory_transactions` có đúng **5 bút toán `-1`**. |
| **2. Chống Deadlock khi mua chéo sản phẩm** | Quầy 1 mua `[Sản phẩm A, Sản phẩm B]` đồng thời với Quầy 2 mua `[Sản phẩm B, Sản phẩm A]` lặp lại 50 vòng. | Sắp xếp danh sách `ProductId` theo thứ tự tăng dần (`OrderBy(id)`) trước khi khóa dòng `FOR UPDATE`. | **0 lỗi PostgreSQL Deadlock (`40P01`)** phát sinh trong toàn bộ quá trình chạy. |
| **3. Chống trùng lặp Idempotency Key đồng thời** | Bắn đồng thời **10 request** mang cùng một header `X-Idempotency-Key` trong cùng 1 mili-giây. | `UNIQUE INDEX (tenant_id, idempotency_key)` + `IdempotencyBehavior` | Chỉ tạo **duy nhất 1 hóa đơn** trong DB; tồn kho chỉ bị trừ **1 lần**. |
| **4. Chống hoàn tiền 2 lần (`Double Refund`)** | Hai Quản lý cùng bấm duyệt hoàn tiền cho 1 hóa đơn `Completed` tại cùng một thời điểm. | Optimistic Concurrency Token (`xmin`) + Order State Machine | Đúng **1 request** thành công (`200 OK`), request còn lại nhận `409 Conflict`; kho chỉ được cộng trả lại **1 lần**. |

---

## 💻 2. Triển khai Bài Kiểm thử Chống Âm Kho (`AntiOversellConcurrencyTests.cs`)

Chạy trực tiếp trên cơ sở dữ liệu **PostgreSQL 16 thực tế** thông qua **Testcontainers**:

```csharp
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PosPwa.Infrastructure.Persistence;
using Xunit;

[Collection("PosIntegrationTests")]
public sealed class AntiOversellConcurrencyTests
{
    private readonly PosApiWebApplicationFactory _factory;

    public AntiOversellConcurrencyTests(PosApiWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CreateOrder_When20CashiersBuyLast5ItemsSimultaneously_AllowsExactly5AndNeverGoesNegative()
    {
        // Arrange: Khởi tạo cửa hàng với 1 sản phẩm chỉ còn đúng 5 đơn vị tồn kho
        const int initialStock = 5;
        const int concurrentRequests = 20;

        var seed = await TestDataSeeder.SeedStoreWithProductAsync(
            _factory.Services,
            tenantCode: "race-test-store",
            initialStock: initialStock);

        // Sử dụng Barrier để đảm bảo toàn bộ 20 luồng cùng xuất phát tại đúng 1 thời điểm (Maximum Contention)
        using var startBarrier = new Barrier(concurrentRequests);

        var tasks = Enumerable.Range(1, concurrentRequests).Select(async index =>
        {
            var client = _factory.CreateClient();
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", seed.CashierToken);
            client.DefaultRequestHeaders.Add("X-Idempotency-Key", $"race-order-{index}-{Guid.NewGuid()}");

            var payload = new
            {
                paymentMethod = "Cash",
                amountPaid = 100_000m,
                discountAmount = 0m,
                items = new[]
                {
                    new { productId = seed.ProductId, quantity = 1 }
                }
            };

            // Đợi đủ 20 luồng sẵn sàng rồi mới đồng loạt gửi HTTP POST
            startBarrier.SignalAndWait();
            return await client.PostAsJsonAsync("/api/v1/orders", payload);
        });

        // Act
        var responses = await Task.WhenAll(tasks);

        // Assert 1: Đúng 5 giao dịch thành công (201 Created) và 15 giao dịch bị chặn hết hàng (409 Conflict)
        responses.Count(r => r.StatusCode == HttpStatusCode.Created).Should().Be(initialStock);
        responses.Count(r => r.StatusCode == HttpStatusCode.Conflict).Should().Be(concurrentRequests - initialStock);

        // Assert 2: Kiểm tra trực tiếp trạng thái thực tế trong PostgreSQL
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var finalProduct = await dbContext.Products
            .IgnoreQueryFilters()
            .SingleAsync(p => p.Id == seed.ProductId);

        finalProduct.StockQuantity.Should().Be(0);

        var ledgerCount = await dbContext.InventoryTransactions
            .IgnoreQueryFilters()
            .CountAsync(t => t.ProductId == seed.ProductId && t.QuantityDelta == -1);

        ledgerCount.Should().Be(initialStock);
    }
}
```

---
