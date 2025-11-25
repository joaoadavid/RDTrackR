using Microsoft.AspNetCore.Mvc;
using RDTrackR.API.Attributes;
using RDTrackR.Application.UseCases.Product.Delete;
using RDTrackR.Application.UseCases.Product.GetAll;
using RDTrackR.Application.UseCases.Product.Update;
using RDTrackR.Application.UseCases.Products.GetById;
using RDTrackR.Application.UseCases.Products.Register;
using RDTrackR.Communication.Requests.Product;
using RDTrackR.Communication.Responses.Error;
using RDTrackR.Communication.Responses.Pages;
using RDTrackR.Communication.Responses.Product;

namespace RDTrackR.API.Controllers
{
    [AuthenticatedUser]

    public class ProductController : RDTrackRBaseController
    {
        [HttpPost]
        [ProducesResponseType(typeof(ResponseProductJson), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register(
            [FromServices] IRegisterProductUseCase useCase,
            [FromBody] RequestRegisterProductJson request)
        {
            var result = await useCase.Execute(request);
            return Created(string.Empty, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PagedResponse<ResponseProductJson>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll(
            [FromServices] IGetAllProductsUseCase useCase,
            [FromQuery] RequestGetProductsPagedJson request)
        {
            var result = await useCase.Execute(request);
            return Ok(result);
        }


        [HttpGet("{id:long}")]
        [ProducesResponseType(typeof(ResponseProductJson), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
        [AuthenticatedUser]
        public async Task<IActionResult> GetById(
        [FromServices] IGetProductByIdUseCase useCase,
        [FromRoute] long id)
        {
            var result = await useCase.Execute(id);
            return Ok(result);
        }


        [HttpPut("{id:long}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update(
            [FromServices] IUpdateProductUseCase useCase,
            [FromBody] RequestRegisterProductJson request,
            [FromRoute] long id)
        {
            await useCase.Execute(id, request);
            return NoContent();
        }

        [HttpDelete("{id:long}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> Delete(
            [FromServices] IDeleteProductUseCase useCase,
            [FromRoute] long id)
        {
            await useCase.Execute(id);
            return NoContent();
        }
    }
}
