
using OISM.Domain.Entities;

namespace OISM.Application.Interfaces.Repositories;

public interface IInventoryRepository
{
    Task<Inventory?> GetByProductAndBranchAsync(
        Guid tenantId,
        Guid branchId,
        Guid productId,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Inventory inventory,
        CancellationToken cancellationToken = default);
}
