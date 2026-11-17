# 🔄 Database Transactions & Isolation Levels - POS PWA Project

Tài liệu này quy định cơ chế quản lý giao dịch cơ sở dữ liệu (**Database Transactions**), chuẩn **ACID** và lựa chọn mức cô lập (**Isolation Levels**) trên **PostgreSQL 16** kết hợp **Entity Framework Core 8** cho hệ thống **POS PWA (Point of Sale Progressive Web App)**. Tại quầy thu ngân, một thao tác thanh toán (`Checkout`) đồng thời ghi dữ liệu vào nhiều bảng (`orders`, `order_details`, `payments`, `products`); việc kiểm soát chặt chẽ ranh giới giao dịch đảm bảo hệ thống không bao giờ rơi vào trạng thái dữ liệu nửa vời (đã trừ kho nhưng chưa tạo được hóa đơn, hoặc ngược lại).

---

## 🛡️ 1. Đảm bảo tính chất ACID tại quầy POS

| Thuộc tính | Ý nghĩa kỹ thuật | Áp dụng thực tế trong giao dịch POS PWA |
| :--- | :--- | :--- |
| **Atomicity (Nguyên tử)** | Tất cả thao tác trong giao dịch hoặc cùng thành công (`Commit`), hoặc cùng hủy bỏ (`Rollback`). | Tạo đơn hàng (`orders`), lưu danh sách món (`order_details`), ghi nhận thanh toán (`payments`) và trừ tồn kho (`products`) nằm chung một Transaction. Nếu bất kỳ bước nào lỗi, toàn bộ giao dịch tự động hoàn tác. |
| **Consistency (Nhất quán)** | Dữ liệu chuyển từ trạng thái hợp lệ này sang trạng thái hợp lệ khác, tuân thủ mọi ràng buộc. | Tổng tiền `total_amount` luôn bằng `sub_total - discount`, và `stock_quantity` sau khi trừ không bao giờ vi phạm ràng buộc `CHECK (stock_quantity >= 0)`. |
| **Isolation (Cô lập)** | Các giao dịch đồng thời từ nhiều quầy thu ngân không làm sai lệch kết quả của nhau. | Hai thu ngân cùng thanh toán món cuối cùng trong kho tại cùng một mili-giây sẽ được tuần tự hóa qua khóa dòng (`Row Lock`), chỉ một người thành công và người còn lại nhận thông báo hết hàng. |
| **Durability (Bền vững)** | Dữ liệu đã `Commit` được lưu vĩnh viễn trên đĩa cứng kể cả khi máy chủ mất điện đột ngột. | PostgreSQL ghi nhật ký giao dịch xuống **WAL (Write-Ahead Logging)** trước khi phản hồi `201 Created` về màn hình POS để in hóa đơn nhiệt. |

---

## ⚖️ 2. Lựa chọn mức cô lập giao dịch (Transaction Isolation Levels)

PostgreSQL hỗ trợ 3 mức cô lập thực tế (`Read Committed`, `Repeatable Read`, `Serializable`). Hệ thống **POS PWA** cấu hình phân tầng theo đặc thù từng luồng nghiệp vụ:

1. **`Read Committed` (Mức mặc định cho các giao dịch POS thông thường & Tìm kiếm):**
   * Đảm bảo giao dịch chỉ đọc được dữ liệu đã `Commit`, loại bỏ hoàn toàn hiện tượng **Dirty Read**.
   * Khi kết hợp với khóa bi quan (`SELECT ... FOR UPDATE`), mức `Read Committed` cho phép PostgreSQL đọc lại phiên bản dòng mới nhất ngay sau khi giao dịch trước vừa nhả khóa, đạt thông lượng (Throughput) cao nhất cho quầy bán hàng.
2. **`Repeatable Read` (Dành cho xuất báo cáo doanh thu cuối ca / đối soát tài chính):**
   * Đảm bảo toàn bộ các câu lệnh `SELECT` tổng hợp doanh thu theo ca, theo phương thức thanh toán (`Cash`, `BankTransfer`) và thống kê tồn kho trong cùng một báo cáo nhìn thấy một bức ảnh chụp dữ liệu (**Snapshot**) nhất quán tại thời điểm bắt đầu xuất báo cáo, tránh sai lệch số liệu khi thu ngân vẫn đang tiếp tục bán hàng.

---

## ⚙️ 3. Triển khai Transaction trong .NET 8 & EF Core 8

### 3.1. Giao dịch ngầm định của `SaveChangesAsync()`
Mặc định trong Entity Framework Core 8, mỗi lần gọi `await _unitOfWork.SaveChangesAsync(ct)` đã tự động được bọc trong một Database Transaction duy nhất. Nếu mọi thay đổi đều đi qua `ChangeTracker` của một `AppDbContext`, EF Core tự động `Commit` khi thành công và `Rollback` nếu gặp ngoại lệ.

### 3.2. Giao dịch tường minh (`BeginTransactionAsync`) cho luồng phức tạp
Đối với các luồng kết hợp câu lệnh khóa bi quan (`FromSqlRaw("SELECT ... FOR UPDATE")`), đồng bộ hàng loạt đơn Offline (`SyncOfflineOrdersCommand`) hoặc hoàn tiền (`RefundOrderCommand`), hệ thống bắt buộc mở Transaction tường minh:

```csharp
using System.Data;
using Microsoft.EntityFrameworkCore;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _dbContext;

    public UnitOfWork(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task ExecuteInTransactionAsync(
        Func<CancellationToken, Task> operation,
        IsolationLevel isolationLevel = IsolationLevel.ReadCommitted,
        CancellationToken cancellationToken = default)
    {
        // Tương thích với cơ chế tự động thử lại khi mất kết nối tạm thời (EnableRetryOnFailure)
        var strategy = _dbContext.Database.CreateExecutionStrategy();

        await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _dbContext.Database
                .BeginTransactionAsync(isolationLevel, cancellationToken);

            try
            {
                await operation(cancellationToken);
                await _dbContext.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw; // Ném lại ngoại lệ để GlobalExceptionHandler xử lý
            }
        });
    }
}
```

---

## 🚨 4. Quy tắc vàng tránh Deadlock & Nghẽn cổ chai giao dịch

1. **Giữ thời gian sống của Transaction ngắn nhất có thể ($< 100\text{ms}$):**
   * **Tuyệt đối không** gọi các API bên ngoài qua mạng (như gọi API sinh mã VietQR, gửi Email/SMS hóa đơn, hay đẩy thông báo SignalR) ở bên trong khối `BeginTransactionAsync` ... `CommitAsync`.
   * Mọi tác vụ giao tiếp mạng ngoài chỉ được phép thực thi **sau khi** giao dịch cơ sở dữ liệu đã `Commit` thành công (thông qua **Domain Events**).
2. **Sắp xếp thứ tự khóa tài nguyên nhất quán (Deadlock Prevention):**
   * Khi một giỏ hàng có nhiều sản phẩm cần khóa để trừ kho, danh sách `ProductId` bắt buộc phải được sắp xếp tăng dần (`OrderBy(id => id)`) trước khi thực hiện truy vấn khóa trong PostgreSQL. Quy tắc này đảm bảo hai thu ngân cùng thanh toán hai giỏ hàng chứa các món trùng nhau sẽ luôn yêu cầu khóa theo cùng một chiều, triệt tiêu hoàn toàn nguy cơ khóa chéo (**Deadlock**).
3. **Bắt buộc dùng `CreateExecutionStrategy()`:**
   * Vì `AppDbContext` kích hoạt `EnableRetryOnFailure` để tự phục hồi khi mạng nội bộ Docker chập chờn, mọi giao dịch thủ công (`BeginTransactionAsync`) phải được bọc bên trong `CreateExecutionStrategy().ExecuteAsync(...)` để tránh lỗi `InvalidOperationException` của EF Core.

---
