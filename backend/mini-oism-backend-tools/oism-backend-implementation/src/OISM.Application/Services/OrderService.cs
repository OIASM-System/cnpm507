using OISM.Application.DTOs.Orders;
using OISM.Application.Interfaces.Repositories;
using OISM.Application.Interfaces.Services;
using OISM.Domain.Entities;
using OISM.Domain.Enums;

namespace OISM.Application.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orders;
    private readonly IProductRepository _products;
    private readonly IInventoryRepository _inventories;
    private readonly IInventoryLedgerRepository _ledger;
    private readonly IUnitOfWork _uow;

    public OrderService(IOrderRepository orders, IProductRepository products, IInventoryRepository inventories,
        IInventoryLedgerRepository ledger, IUnitOfWork uow)
    { _orders=orders; _products=products; _inventories=inventories; _ledger=ledger; _uow=uow; }

    public async Task<OrderResponse> CreateOrderAsync(Guid tenantId, CreateOrderRequest request, CancellationToken cancellationToken = default)
    {
        if (tenantId == Guid.Empty || request.BranchId == Guid.Empty) throw new ArgumentException("TenantId hoặc BranchId không hợp lệ.");
        if (request.Items == null || request.Items.Count == 0) throw new ArgumentException("Đơn hàng phải có ít nhất một sản phẩm.");
        if (request.Items.Any(x => x.ProductId == Guid.Empty || x.Quantity <= 0)) throw new ArgumentException("ProductId hoặc Quantity không hợp lệ.");

        Order? created = null;
        await _uow.ExecuteInTransactionAsync(async ct =>
        {
            var order = new Order(tenantId, request.BranchId, request.Source);
            foreach (var line in request.Items.GroupBy(x => x.ProductId).Select(g => new { ProductId=g.Key, Quantity=g.Sum(x=>x.Quantity) }))
            {
                var product = await _products.GetByIdAsync(tenantId, line.ProductId, ct);
                if (product == null || !product.IsActive) throw new KeyNotFoundException($"Không tìm thấy sản phẩm hoạt động: {line.ProductId}");
                var stock = await _inventories.GetForUpdateAsync(tenantId, request.BranchId, line.ProductId, ct)
                    ?? throw new KeyNotFoundException($"Chưa khởi tạo tồn kho cho SKU {product.Sku}.");
                stock.Reserve(line.Quantity);
                order.AddItem(new OrderItem(product.Id, product.Sku, product.Name, line.Quantity, product.UnitPrice));
                await _ledger.AddAsync(new InventoryLedger(tenantId, request.BranchId, product.Id, order.Id,
                    InventoryMovementType.Reservation, line.Quantity, stock.OnHand, stock.Reserved), ct);
            }
            await _orders.AddAsync(order, ct);
            created = order;
        }, cancellationToken);
        return Map(created!);
    }

    public async Task<OrderResponse?> GetOrderAsync(Guid tenantId, Guid orderId, CancellationToken cancellationToken = default)
    {
        var order = await _orders.GetByIdAsync(tenantId, orderId, cancellationToken);
        return order == null ? null : Map(order);
    }

    public Task ConfirmOrderAsync(Guid tenantId, Guid orderId, CancellationToken cancellationToken = default) =>
        ChangeOrderAsync(tenantId, orderId, true, cancellationToken);

    public Task CancelOrderAsync(Guid tenantId, Guid orderId, CancellationToken cancellationToken = default) =>
        ChangeOrderAsync(tenantId, orderId, false, cancellationToken);

    private async Task ChangeOrderAsync(Guid tenantId, Guid orderId, bool confirm, CancellationToken ct)
    {
        await _uow.ExecuteInTransactionAsync(async token =>
        {
            var order = await _orders.GetByIdAsync(tenantId, orderId, token)
                ?? throw new KeyNotFoundException("Không tìm thấy đơn hàng.");
            foreach (var line in order.Items)
            {
                var stock = await _inventories.GetForUpdateAsync(tenantId, order.BranchId, line.ProductId, token)
                    ?? throw new InvalidOperationException("Không tìm thấy tồn kho.");
                if (confirm) stock.ConfirmReservation(line.Quantity);
                else stock.ReleaseReservation(line.Quantity);
                await _ledger.AddAsync(new InventoryLedger(tenantId, order.BranchId, line.ProductId, order.Id,
                    confirm ? InventoryMovementType.Sale : InventoryMovementType.Release,
                    line.Quantity, stock.OnHand, stock.Reserved), token);
            }
            if (confirm) order.Confirm(); else order.Cancel();
        }, ct);
    }

    private static OrderResponse Map(Order o) => new()
    {
        Id=o.Id, OrderNumber=o.OrderNumber, BranchId=o.BranchId, Source=o.Source,
        Status=o.Status, TotalAmount=o.TotalAmount, CreatedAt=o.CreatedAt,
        Items=o.Items.Select(x => new OrderItemResponse {
            ProductId=x.ProductId, Sku=x.Sku, ProductName=x.ProductName,
            Quantity=x.Quantity, UnitPrice=x.UnitPrice, LineTotal=x.LineTotal
        }).ToList()
    };
}
