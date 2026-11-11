using Microsoft.EntityFrameworkCore;
using OISM.Application.Interfaces.Repositories;
using OISM.Domain.Entities;
using OISM.Infrastructure.Persistence;
namespace OISM.Infrastructure.Repositories;
public class ProductRepository : IProductRepository
{
    private readonly OismDbContext _db;
    public ProductRepository(OismDbContext db) => _db=db;
    public Task<Product?> GetByIdAsync(Guid tenantId, Guid productId, CancellationToken ct=default) =>
        _db.Products.FirstOrDefaultAsync(x=>x.TenantId==tenantId && x.Id==productId,ct);
}
