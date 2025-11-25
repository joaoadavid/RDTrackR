using RDTrackR.Communication.Requests.Product;
using RDTrackR.Communication.Responses.Pages;
using RDTrackR.Communication.Responses.Product;

namespace RDTrackR.Application.UseCases.Product.GetAll
{
    public interface IGetAllProductsUseCase
    {
        //Task<List<ResponseProductJson>> Execute();
        Task<PagedResponse<ResponseProductJson>> Execute(RequestGetProductsPagedJson request);
    }
}