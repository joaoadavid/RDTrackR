using RDTrackR.Communication.Requests.Supplier;
using RDTrackR.Communication.Responses.Pages;
using RDTrackR.Communication.Responses.Supplier;

namespace RDTrackR.Application.UseCases.Suppliers.GetAll
{
    public interface IGetAllSuppliersUseCase
    {
        //Task<List<ResponseSupplierJson>> Execute();
        Task<PagedResponse<ResponseSupplierJson>> Execute(RequestGetSuppliersPagedJson request);
    }
}