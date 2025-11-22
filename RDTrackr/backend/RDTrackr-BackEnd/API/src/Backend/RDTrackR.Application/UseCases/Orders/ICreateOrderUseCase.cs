using RDTrackR.Communication.Requests.Orders;
using RDTrackR.Communication.Responses.Orders;

namespace RDTrackR.Application.UseCases.Orders
{
    public interface ICreateOrderUseCase
    {
        Task<ResponseOrderJson> Execute(RequestCreateOrderJson request);
    }
}