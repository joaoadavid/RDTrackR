using RDTrackR.Communication.Requests.Orders;
using RDTrackR.Communication.Responses.Orders;
using RDTrackR.Communication.Responses.Pages;

namespace RDTrackR.Application.UseCases.Orders
{
    public interface IGetOrdersPagedUseCase
    {
        Task<PagedResponse<ResponseOrderJson>> Execute(RequestGetOrdersPagedJson request);
    }
}