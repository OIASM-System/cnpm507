using Microsoft.EntityFrameworkCore;
using OISM.Application.Interfaces.Repositories;
using OISM.Domain.Entities;
using OISM.Infrastructure.Persistence;
namespace OISM.Infrastructure.Repositories;
public class OrderRepository : IOrderRepository
{
    private readonly OismDbContext _db;
    public OrderRepository(OismDbContext db) => _db=db;
    public Task<Order?> GetByIdAsync(Guid tenantId, Guid orderId, CancellationToken ct=default) =>
        _db.Orders.Include(x=>x.Items).FirstOrDefaultAsync(x=>x.TenantId==tenantId && x.Id==orderId,ct);
    public Task AddAsync(Order order, CancellationToken ct=default) => _db.Orders.AddAsync(order,ct).AsTask();
}
