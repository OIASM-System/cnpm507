
using Microsoft.AspNetCore.Mvc;
using OISM.Application.Interfaces.Services;

namespace OISM.WebAPI.Controllers;

[ApiController]
[Route("api/inventory/ledger")]
public class InventoryLedgerController : ControllerBase
{
    private readonly IInventoryLedgerService _service;

    public InventoryLedgerController(IInventoryLedgerService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetHistory(
        [FromQuery] Guid branchId,
        [FromQuery] Guid? productId,
        [FromQuery] Guid? orderId,
        CancellationToken ct)
    {
        if (!Guid.TryParse(
            Request.Headers["X-Tenant-Id"].FirstOrDefault(),
            out var tenantId) || tenantId == Guid.Empty)
        {
            return BadRequest(new
            {
                message = "Thiếu hoặc sai X-Tenant-Id."
            });
        }

        if (branchId == Guid.Empty)
        {
            return BadRequest(new
            {
                message = "BranchId không hợp lệ."
            });
        }

        try
        {
            var result = await _service.GetHistoryAsync(
                tenantId,
                branchId,
                productId,
                orderId,
                ct);

            return Ok(result);
        }
        catch (ArgumentException e)
        {
            return BadRequest(new { message = e.Message });
        }
    }
}
