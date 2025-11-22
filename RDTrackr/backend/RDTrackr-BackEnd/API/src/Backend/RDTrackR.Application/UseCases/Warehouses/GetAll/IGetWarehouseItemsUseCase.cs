using RDTrackR.Communication.Responses.Warehouse;

namespace RDTrackR.Application.UseCases.Warehouses.GetAll
{
    public interface IGetWarehouseItemsUseCase
    {
        Task<List<ResponseWarehouseStockItemJson>> Execute(long warehouseId);
    }
}