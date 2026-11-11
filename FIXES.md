# OISM backend fixes

## Changes made
1. Restored `InventoryResponse` in `OISM.Application/DTOs/Inventory/InventoryResponse.cs` with the fields used by `InventoryService`.
2. Added `InventoryLedgerResponse` as a separate DTO in `DTOs/Inventory/InventoryLedgerResponse.cs`.
3. Added `IInventoryLedgerService` under `Interfaces/Services`.
4. Added `InventoryLedgerService` under `Services`; it validates tenant/branch/filter IDs and maps ledger entities to response DTOs.
5. Kept the existing `IInventoryLedgerRepository.GetHistoryAsync`, its EF Core implementation, the ledger controller, and DI registration.

## Build verification
The source was reviewed for matching namespaces, signatures, and dependency registrations. A .NET build could not be executed in this environment because the `dotnet` CLI is not installed. Run this on the Windows development machine:

```powershell
dotnet build .\backend\src\OISM.WebAPI\OISM.WebAPI.csproj
```

Then run:

```powershell
dotnet run --project .\backend\src\OISM.WebAPI\OISM.WebAPI.csproj
```

No database migration was added or changed.
