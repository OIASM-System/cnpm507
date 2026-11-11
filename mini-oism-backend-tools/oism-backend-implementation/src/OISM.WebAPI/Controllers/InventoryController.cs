using Microsoft.AspNetCore.Mvc;
using OISM.Application.DTOs.Inventory;
using OISM.Application.Interfaces.Services;
namespace OISM.WebAPI.Controllers;
[ApiController]
[Route("api/inventory")]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _service;
    public InventoryController(IInventoryService service) => _service=service;
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] Guid branchId,[FromQuery] Guid productId,CancellationToken ct)
    {
        if(!Tenant(out var tenant)) return BadRequest(new {message="Thiếu hoặc sai X-Tenant-Id."});
        var data=await _service.GetInventoryAsync(tenant,branchId,productId,ct);
        return data==null ? NotFound() : Ok(data);
    }
    [HttpPut("adjust")]
    public async Task<IActionResult> Adjust([FromBody] AdjustInventoryRequest request,CancellationToken ct)
    {
        if(!Tenant(out var tenant)) return BadRequest(new {message="Thiếu hoặc sai X-Tenant-Id."});
        try { await _service.AdjustInventoryAsync(tenant,request,ct); return NoContent(); }
        catch(KeyNotFoundException e){return NotFound(new {message=e.Message});}
        catch(ArgumentException e){return BadRequest(new {message=e.Message});}
        catch(InvalidOperationException e){return Conflict(new {message=e.Message});}
    }
    private bool Tenant(out Guid id)=>Guid.TryParse(Request.Headers["X-Tenant-Id"].FirstOrDefault(),out id)&&id!=Guid.Empty;
}
