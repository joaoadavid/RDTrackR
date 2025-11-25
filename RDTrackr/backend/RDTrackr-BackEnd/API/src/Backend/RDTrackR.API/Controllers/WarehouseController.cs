using Microsoft.AspNetCore.Mvc;
using RDTrackR.API.Attributes;
using RDTrackR.Application.UseCases.Warehouses.Delete;
using RDTrackR.Application.UseCases.Warehouses.GetAll;
using RDTrackR.Application.UseCases.Warehouses.GetById;
using RDTrackR.Application.UseCases.Warehouses.Register;
using RDTrackR.Application.UseCases.Warehouses.Update;
using RDTrackR.Communication.Requests.Warehouse;
using RDTrackR.Communication.Responses.Error;
using RDTrackR.Communication.Responses.Pages;
using RDTrackR.Communication.Responses.Warehouse;

namespace RDTrackR.API.Controllers
{
    [AuthenticatedUser]
    public class WarehouseController : RDTrackRBaseController
    {

        [HttpGet]
        [ProducesResponseType(typeof(PagedResponse<ResponseWarehouseJson>), StatusCodes.Status200OK)]
        public async Task<IActionResult> Get(
        [FromServices] IGetAllWarehousesUseCase useCase,
        [FromQuery] RequestGetWarehousesPagedJson request)
        {
            var result = await useCase.Execute(request);
            return Ok(result);
        }


        [HttpPost]
        [ProducesResponseType(typeof(ResponseWarehouseJson), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register(
            [FromServices] IRegisterWarehouseUseCase useCase,
            [FromBody] RequestRegisterWarehouseJson request)
        {
            var result = await useCase.Execute(request);
            return Created(string.Empty, result);
        }

        [HttpPut("{id:long}")]
        [ProducesResponseType(typeof(ResponseWarehouseJson), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update(
            [FromServices] IUpdateWarehouseUseCase useCase,
            [FromRoute] long id,
            [FromBody] RequestUpdateWarehouseJson request)
        {
            var result = await useCase.Execute(id, request);
            return Ok(result);
        }

        [HttpDelete("{id:long}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(
            [FromServices] IDeleteWarehouseUseCase useCase,
            [FromRoute] long id)
        {
            await useCase.Execute(id);
            return NoContent();
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ResponseWarehouseJson), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(long id,
        [FromServices] IGetWarehouseByIdUseCase useCase)
        {
            var result = await useCase.Execute(id);
            return Ok(result);
        }

        [HttpGet("{id:long}/items")]
        [ProducesResponseType(typeof(List<ResponseWarehouseStockItemJson>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetItems(
        long id,
        [FromServices] IGetWarehouseItemsUseCase useCase)
        {
            var result = await useCase.Execute(id);
            return Ok(result);
        }
    }
}
