# OISM Inventory + Orders (NET 8)

Patch bổ sung vào solution hiện tại. Không tạo project mới.

## Cài đặt
1. Giải nén thư mục `oism-backend-implementation` vào thư mục `backend`.
2. Chép các file theo đúng đường dẫn, cho phép ghi đè `Program.cs` và `IInventoryRepository.cs`, `IUnitOfWork.cs`.
3. Thêm connection string vào `src/OISM.WebAPI/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "OismDb": "Host=localhost;Port=5432;Database=oism_db;Username=postgres;Password=YOUR_PASSWORD"
  }
}
```

Không commit mật khẩu lên Git.

## Build / migration
Chạy ở thư mục backend:

```powershell
dotnet build .\OISM.sln
dotnet tool install --global dotnet-ef
dotnet ef migrations add InitialOismSchema --project .\src\OISM.Infrastructure\OISM.Infrastructure.csproj --startup-project .\src\OISM.WebAPI\OISM.WebAPI.csproj --output-dir Persistence\Migrations
dotnet ef database update --project .\src\OISM.Infrastructure\OISM.Infrastructure.csproj --startup-project .\src\OISM.WebAPI\OISM.WebAPI.csproj
dotnet run --project .\src\OISM.WebAPI\OISM.WebAPI.csproj
```

Nếu DB đã có bảng/schema, kiểm tra trước khi tạo migration.

Swagger: `/swagger`

## API
- GET `/api/inventory?branchId={guid}&productId={guid}`
- PUT `/api/inventory/adjust`
- POST `/api/orders`
- GET `/api/orders/{orderId}`
- POST `/api/orders/{orderId}/confirm`
- POST `/api/orders/{orderId}/cancel`

Mỗi request cần header `X-Tenant-Id: <tenant-guid>`. Đây chỉ là cách test tạm khi JWT chưa được cấu hình; production phải lấy TenantId từ JWT claim.

## Logic
Tạo đơn giữ hàng và ghi Reservation; Confirm trừ OnHand và Reserved, ghi Sale; Cancel chỉ giải phóng Reserved, ghi Release. Các thao tác ghi chạy trong transaction và khóa dòng tồn kho bằng PostgreSQL `FOR UPDATE`.

## Chưa bao gồm
- Authentication/JWT, Branch entity/FK, idempotency cho webhook.
- Kiểm thử integration với database thực tế.
- Mapping sang schema DB đã tồn tại. Hãy kiểm tra schema trước khi chạy migration.
