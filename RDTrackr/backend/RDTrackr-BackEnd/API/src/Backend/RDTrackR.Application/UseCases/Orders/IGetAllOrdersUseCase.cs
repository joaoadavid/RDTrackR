using RDTrackR.Communication.Responses.Orders;

namespace RDTrackR.Application.UseCases.Orders
{
    public interface IGetAllOrdersUseCase
    {
        Task<List<ResponseOrderJson>> Execute();
    }
}