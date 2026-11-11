using OISM.Domain.Entities;
namespace OISM.Application.Interfaces.Repositories;
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid tenantId, Guid orderId, CancellationToken cancellationToken = default);
    Task AddAsync(Order order, CancellationToken cancellationToken = default);
}
