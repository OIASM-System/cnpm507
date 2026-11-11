using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OISM.Application.Interfaces.Repositories;
using OISM.Application.Interfaces.Services;
using OISM.Application.Services;
using OISM.Infrastructure.Persistence;
using OISM.Infrastructure.Repositories;
namespace OISM.Infrastructure;
public static class DependencyInjection
{
    public static IServiceCollection AddOismInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        var cs=config.GetConnectionString("OismDb");
        if (string.IsNullOrWhiteSpace(cs)) throw new InvalidOperationException("Thiếu ConnectionStrings:OismDb.");
        services.AddDbContext<OismDbContext>(o=>o.UseNpgsql(cs));
        services.AddScoped<IInventoryRepository,InventoryRepository>();
        services.AddScoped<IInventoryLedgerRepository,InventoryLedgerRepository>();
        services.AddScoped<IProductRepository,ProductRepository>();
        services.AddScoped<IOrderRepository,OrderRepository>();
        services.AddScoped<IUnitOfWork,UnitOfWork>();
        services.AddScoped<IInventoryService,InventoryService>();
        services.AddScoped<IOrderService,OrderService>();
        return services;
    }
}
