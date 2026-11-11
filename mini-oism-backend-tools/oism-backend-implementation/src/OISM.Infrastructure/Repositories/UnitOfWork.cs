using Microsoft.EntityFrameworkCore.Storage;
using OISM.Application.Interfaces.Repositories;
using OISM.Infrastructure.Persistence;
namespace OISM.Infrastructure.Repositories;
public class UnitOfWork : IUnitOfWork
{
    private readonly OismDbContext _db;
    public UnitOfWork(OismDbContext db) => _db=db;
    public Task<int> SaveChangesAsync(CancellationToken ct=default) => _db.SaveChangesAsync(ct);
    public async Task ExecuteInTransactionAsync(Func<CancellationToken,Task> operation, CancellationToken ct=default)
    {
        await using IDbContextTransaction tx = await _db.Database.BeginTransactionAsync(ct);
        try { await operation(ct); await _db.SaveChangesAsync(ct); await tx.CommitAsync(ct); }
        catch { await tx.RollbackAsync(ct); throw; }
    }
}
