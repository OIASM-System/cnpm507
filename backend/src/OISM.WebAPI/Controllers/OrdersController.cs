using Microsoft.AspNetCore.Mvc;
using OISM.Application.DTOs.Orders;
using OISM.Application.Interfaces.Services;
namespace OISM.WebAPI.Controllers;
[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _service;
    public OrdersController(IOrderService service)=>_service=service;
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request,CancellationToken ct)
    {
        if(!Tenant(out var tenant)) return BadRequest(new {message="Thiếu hoặc sai X-Tenant-Id."});
        try { var result=await _service.CreateOrderAsync(tenant,request,ct); return CreatedAtAction(nameof(Get),new {orderId=result.Id},result); }
        catch(KeyNotFoundException e){return NotFound(new {message=e.Message});}
        catch(ArgumentException e){return BadRequest(new {message=e.Message});}
        catch(InvalidOperationException e){return Conflict(new {message=e.Message});}
    }
    [HttpGet("{orderId:guid}")]
    public async Task<IActionResult> Get(Guid orderId,CancellationToken ct)
    {
        if(!Tenant(out var tenant)) return BadRequest(new {message="Thiếu hoặc sai X-Tenant-Id."});
        var result=await _service.GetOrderAsync(tenant,orderId,ct);
        return result==null ? NotFound() : Ok(result);
    }
    [HttpPost("{orderId:guid}/confirm")]
    public async Task<IActionResult> Confirm(Guid orderId,CancellationToken ct)
    {
        if(!Tenant(out var tenant)) return BadRequest(new {message="Thiếu hoặc sai X-Tenant-Id."});
        try { await _service.ConfirmOrderAsync(tenant,orderId,ct); return NoContent(); }
        catch(KeyNotFoundException e){return NotFound(new {message=e.Message});}
        catch(InvalidOperationException e){return Conflict(new {message=e.Message});}
    }
    [HttpPost("{orderId:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid orderId,CancellationToken ct)
    {
        if(!Tenant(out var tenant)) return BadRequest(new {message="Thiếu hoặc sai X-Tenant-Id."});
        try { await _service.CancelOrderAsync(tenant,orderId,ct); return NoContent(); }
        catch(KeyNotFoundException e){return NotFound(new {message=e.Message});}
        catch(InvalidOperationException e){return Conflict(new {message=e.Message});}
    }
    private bool Tenant(out Guid id)=>Guid.TryParse(Request.Headers["X-Tenant-Id"].FirstOrDefault(),out id)&&id!=Guid.Empty;
}
