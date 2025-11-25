using RDTrackR.Communication.Requests.PurchaseOrders;
using RDTrackR.Communication.Responses.Pages;
using RDTrackR.Communication.Responses.PurchaseOrders;

namespace RDTrackR.Application.UseCases.PurchaseOrders.GetAll
{
    public interface IGetPurchaseOrdersUseCase
    {
        //Task<List<ResponsePurchaseOrderJson>> Execute();
        Task<PagedResponse<ResponsePurchaseOrderJson>> Execute(RequestGetPurchaseOrdersPagedJson request);
    }
}