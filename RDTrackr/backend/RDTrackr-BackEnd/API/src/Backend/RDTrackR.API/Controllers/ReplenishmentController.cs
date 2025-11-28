using Microsoft.AspNetCore.Mvc;
using RDTrackR.API.Attributes;
using RDTrackR.Application.UseCases.Replenishment.GetAll;
using RDTrackR.Application.UseCases.Replenishment.Register;
using RDTrackR.Communication.Requests.Replenishment;
using RDTrackR.Communication.Responses.Replenishment;
using RDTrackR.Communication.Responses.PurchaseOrders;
using RDTrackR.Communication.Responses.Pages;

namespace RDTrackR.API.Controllers
{
    [AuthenticatedUser]
    [Route("replenishment")]
    public class ReplenishmentController : RDTrackRBaseController
    {

        [HttpGet]
        [ProducesResponseType(typeof(PagedResponse<ResponseReplenishmentItemJson>), StatusCodes.Status200OK)]
        public async Task<IActionResult> Get(
        [FromServices] IGetReplenishmentItemsUseCase useCase,
        [FromQuery] RequestGetReplenishmentPagedJson request)
        {
            var result = await useCase.Execute(request);
            return Ok(result);
        }


        [HttpPost("generate-po")]
        [ProducesResponseType(typeof(ResponsePurchaseOrderJson), StatusCodes.Status201Created)]
        public async Task<IActionResult> GeneratePo(
            [FromServices] IGeneratePoFromReplenishmentUseCase useCase,
            [FromBody] RequestGeneratePoFromReplenishmentJson request)
        {
            var result = await useCase.Execute(request);
            return Created(string.Empty, result);
        }
    }
}
