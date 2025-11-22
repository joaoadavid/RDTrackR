using Microsoft.AspNetCore.Mvc;
using RDTrackR.API.Attributes;
using RDTrackR.Application.UseCases.PurchaseOrders.Delete;
using RDTrackR.Application.UseCases.PurchaseOrders.GetAll;
using RDTrackR.Application.UseCases.PurchaseOrders.Register;
using RDTrackR.Application.UseCases.PurchaseOrders.Update;
using RDTrackR.Communication.Requests.PurchaseOrders;
using RDTrackR.Communication.Responses.Error;
using RDTrackR.Communication.Responses.PurchaseOrders;

namespace RDTrackR.API.Controllers
{
    [AuthenticatedUser]
    public class PurchaseOrderController : RDTrackRBaseController
    {
        [HttpPost]
        [ProducesResponseType(typeof(ResponsePurchaseOrderJson), StatusCodes.Status201Created)]
        public async Task<IActionResult> Register(
            [FromServices] IRegisterPurchaseOrderUseCase useCase,
            [FromBody] RequestCreatePurchaseOrderJson request)
        {
            var response = await useCase.Execute(request);
            return Created(string.Empty, response);
        }

        [HttpGet]
        [ProducesResponseType(typeof(List<ResponsePurchaseOrderJson>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll(
            [FromServices] IGetPurchaseOrdersUseCase useCase)
        {
            var result = await useCase.Execute();
            return Ok(result);
        }

        [HttpGet("{id:long}")]
        [ProducesResponseType(typeof(ResponsePurchaseOrderJson), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(
            [FromServices] IGetByIdPurchaseOrdersUseCase useCase,
            long id)
        {
            var result = await useCase.Execute(id);
            return Ok(result);
        }

        [HttpPut("{id:long}/status")]
        public async Task<IActionResult> UpdateStatus(
         long id,
         [FromBody] RequestUpdatePurchaseOrderStatusJson request,
         [FromServices] IUpdatePurchaseOrderStatusUseCase useCase)
        {
            await useCase.Execute(id, request);
            return NoContent();
        }


        [HttpPut("{id:long}/items")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> UpdateItems(
            [FromServices] IUpdatePurchaseOrderItemsUseCase useCase,
            long id,
            [FromBody] RequestUpdatePurchaseOrderItemsJson request)
        {
            await useCase.Execute(id, request);
            return NoContent();
        }

        [HttpDelete("{id:long}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> Delete(
            [FromServices] IDeletePurchaseOrderUseCase useCase,
            long id)
        {
            await useCase.Execute(id);
            return NoContent();
        }
    }
}
