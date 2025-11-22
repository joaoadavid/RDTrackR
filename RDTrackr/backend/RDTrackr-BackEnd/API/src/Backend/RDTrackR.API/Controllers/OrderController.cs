using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RDTrackR.API.Attributes;
using RDTrackR.Application.UseCases.Orders;
using RDTrackR.Communication.Requests.Orders;
using RDTrackR.Communication.Responses.Error;
using RDTrackR.Communication.Responses.Orders;
using RDTrackR.Communication.Responses.Product;
using RDTrackR.Communication.Responses.User.Admin;

namespace RDTrackR.API.Controllers
{
    [AuthenticatedUser]
    [Route("orders")]
    public class OrderController : RDTrackRBaseController
    {
        [HttpPost]
        [ProducesResponseType(typeof(ResponseOrderJson), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create(
            [FromBody] RequestCreateOrderJson request,
            [FromServices] ICreateOrderUseCase useCase)
        {
            var result = await useCase.Execute(request);
            return Created(string.Empty, result);
        }

        [HttpPut("{id:long}/status")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> UpdateStatus(
        long id,
            [FromBody] RequestUpdateOrderStatusJson request,
            [FromServices] IUpdateOrderStatusUseCase useCase)
        {
            await useCase.Execute(id, request);
            return NoContent();
        }

        [HttpGet]
        [ProducesResponseType(typeof(List<ResponseOrderJson>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll(
            [FromServices] IGetAllOrdersUseCase useCase)
        {
            return Ok(await useCase.Execute());
        }

        [HttpDelete("orders/{id:long}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> Delete(
        [FromServices] IDeleteOrderUseCase useCase,
        [FromRoute] long id)
        {
            await useCase.Execute(id);
            return NoContent();
        }

    }

}
