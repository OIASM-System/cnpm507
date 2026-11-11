
using OISM.Domain.Entities;

namespace OISM.Application.Interfaces.Repositories;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(
        Guid tenantId,
        Guid productId,
        CancellationToken cancellationToken = default);
}
