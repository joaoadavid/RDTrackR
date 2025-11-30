
namespace RDTrackR.Application.UseCases.Warehouses.Delete
{
    public interface IDeleteWarehouseItemUseCase
    {
        Task Execute(long itemId);
    }
}