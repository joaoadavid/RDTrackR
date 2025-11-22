using RDTrackR.Communication.Requests.Orders;

namespace RDTrackR.Application.UseCases.Orders
{
    public interface IUpdateOrderStatusUseCase
    {
        Task Execute(long id, RequestUpdateOrderStatusJson request);
    }
}