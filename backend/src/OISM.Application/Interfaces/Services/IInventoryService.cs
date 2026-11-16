
using OISM.Application.DTOs.Inventory;

namespace OISM.Application.Interfaces.Services;

public interface IInventoryService
{
    Task<InventoryResponse?> GetInventoryAsync(
        Guid tenantId,
        Guid branchId,
        Guid productId,
        CancellationToken cancellationToken = default);

    Task<List<InventoryListResponse>> GetAllInventoryAsync(
        Guid tenantId,
        Guid branchId,
        CancellationToken cancellationToken = default);

    Task AdjustInventoryAsync(
        Guid tenantId,
        AdjustInventoryRequest request,
        CancellationToken cancellationToken = default);
}
