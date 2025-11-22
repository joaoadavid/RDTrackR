
namespace RDTrackR.Application.UseCases.Orders
{
    public interface IDeleteOrderUseCase
    {
        Task Execute(long orderId);
    }
}