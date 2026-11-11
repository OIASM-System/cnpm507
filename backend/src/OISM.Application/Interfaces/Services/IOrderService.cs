
using OISM.Application.DTOs.Orders;

namespace OISM.Application.Interfaces.Services;

public interface IOrderService
{
    Task<OrderResponse> CreateOrderAsync(
        Guid tenantId,
        CreateOrderRequest request,
        CancellationToken cancellationToken = default);

    Task<OrderResponse?> GetOrderAsync(
        Guid tenantId,
        Guid orderId,
        CancellationToken cancellationToken = default);

    Task ConfirmOrderAsync(
        Guid tenantId,
        Guid orderId,
        CancellationToken cancellationToken = default);

    Task CancelOrderAsync(
        Guid tenantId,
        Guid orderId,
        CancellationToken cancellationToken = default);
}
