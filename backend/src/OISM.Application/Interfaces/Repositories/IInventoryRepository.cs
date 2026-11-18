
using OISM.Domain.Entities;
using OISM.Application.DTOs.Inventory;

namespace OISM.Application.Interfaces.Repositories;

public interface IInventoryRepository
{
    Task<Inventory?> GetByProductAndBranchAsync(
        Guid tenantId,
        Guid branchId,
        Guid productId,
        CancellationToken cancellationToken = default);

    Task<Inventory?> GetForUpdateAsync(
        Guid tenantId,
        Guid branchId,
        Guid productId,
        CancellationToken cancellationToken = default);

    Task<List<InventoryListResponse>> GetAllByBranchAsync(
        Guid tenantId,
        Guid branchId,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Inventory inventory,
        CancellationToken cancellationToken = default);
}
