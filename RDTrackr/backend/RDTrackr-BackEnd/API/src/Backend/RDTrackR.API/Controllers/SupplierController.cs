using Microsoft.AspNetCore.Mvc;
using RDTrackR.API.Attributes;
using RDTrackR.Application.UseCases.Suppliers.Register;
using RDTrackR.Application.UseCases.Suppliers.GetAll;
using RDTrackR.Application.UseCases.Suppliers.Update;
using RDTrackR.Application.UseCases.Suppliers.Delete;
using RDTrackR.Communication.Requests.Supplier;
using RDTrackR.Communication.Responses.Supplier;
using RDTrackR.Communication.Responses.Error;
using RDTrackR.Infrastructure.DataAccess.Repositories;
using RDTrackR.Application.UseCases.Suppliers.GetSupplierProduct;
using RDTrackR.Application.UseCases.Suppliers.RegisterSupplierProduct;
using RDTrackR.Application.UseCases.Suppliers.DeleteSupplierProduct;
using RDTrackR.Application.UseCases.Suppliers.UpdateSupplierProduct;

namespace RDTrackR.API.Controllers
{
    [AuthenticatedUser]
    public class SupplierController : RDTrackRBaseController
    {
        [HttpPost]
        [ProducesResponseType(typeof(ResponseSupplierJson), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register(
            [FromServices] IRegisterSupplierUseCase useCase,
            [FromBody] RequestRegisterSupplierJson request)
         {
            var result = await useCase.Execute(request);
            return Created(string.Empty, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(List<ResponseSupplierJson>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll(
            [FromServices] IGetAllSuppliersUseCase useCase)
        {
            var result = await useCase.Execute();
            return Ok(result);
        }

        [HttpPut("{id:long}")]
        [ProducesResponseType(typeof(ResponseSupplierJson), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update(
            [FromServices] IUpdateSupplierUseCase useCase,
            [FromRoute] long id,
            [FromBody] RequestUpdateSupplierJson request)
        {
            var result = await useCase.Execute(id, request);
            return Ok(result);
        }

        [HttpDelete("{id:long}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Delete(
            [FromServices] IDeleteSupplierUseCase useCase,
            [FromRoute] long id)
        {
            await useCase.Execute(id);
            return NoContent();
        }

        [HttpPost("{supplierId}/products")]
        [ProducesResponseType(typeof(ResponseSupplierProductJson), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AddProductToSupplier(
        long supplierId,
        [FromBody] RequestRegisterSupplierProductJson request,
        [FromServices] IRegisterSupplierProductUseCase useCase)
        {
            request.SupplierId = supplierId;
            var result = await useCase.Execute(request);
            return Created(string.Empty, result);
        }

        [HttpGet("{supplierId}/products")]
        [ProducesResponseType(typeof(List<ResponseSupplierProductJson>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetProductsBySupplier(
        long supplierId,
        [FromServices] IGetProductsBySupplierUseCase useCase)
        {
            var result = await useCase.Execute(supplierId);
            return Ok(result);
        }

        [HttpPut("{supplierId}/products/{productId}")]
        [ProducesResponseType(typeof(ResponseSupplierProductJson), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateSupplierProduct(
        long supplierId,
        long productId,
        [FromBody] RequestUpdateSupplierProductJson request,
        [FromServices] IUpdateSupplierProductUseCase useCase)
        {
            request.SupplierId = supplierId;
            request.ProductId = productId;

            var result = await useCase.Execute(request);
            return Ok(result);
        }


        [HttpDelete("{supplierId}/products/{productId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteSupplierProduct(
        long supplierId,
        long productId,
        [FromServices] IDeleteSupplierProductUseCase useCase)
        {
            await useCase.Execute(supplierId, productId);
            return NoContent();
        }
    }
}
