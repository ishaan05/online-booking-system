using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBookingSystem.Shared.Repositories;
using OnlineBookingSystem.Shared.Security;

namespace OnlineBookingSystem.Api.Controllers;

[ApiController]
[Route("api/admin/metadata")]
[Authorize(Roles = AppRoles.OfficeStaff)]
public class AdminMetadataController : ControllerBase
{
	[HttpGet("bank-accounts")]
	public async Task<ActionResult> BankAccounts([FromServices] IBookingSystemRepository repo, CancellationToken ct)
	{
		return Ok(await repo.GetBankAccountsAsync(ct));
	}
}
