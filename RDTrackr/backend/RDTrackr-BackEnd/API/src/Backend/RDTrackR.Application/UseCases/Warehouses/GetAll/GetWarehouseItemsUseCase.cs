using RDTrackR.Communication.Responses.Warehouse;
using RDTrackR.Domain.Repositories.StockItems;
using RDTrackR.Domain.Services.LoggedUser;

namespace RDTrackR.Application.UseCases.Warehouses.GetAll
{
    public class GetWarehouseItemsUseCase : IGetWarehouseItemsUseCase
    {
        private readonly IStockItemReadOnlyRepository _repo;
        private readonly ILoggedUser _loggedUser;

        public GetWarehouseItemsUseCase(
            IStockItemReadOnlyRepository repo,
            ILoggedUser loggedUser)
        {
            _repo = repo;
            _loggedUser = loggedUser;
        }

        public async Task<List<ResponseWarehouseStockItemJson>> Execute(long warehouseId)
        {
            var user = await _loggedUser.User();

            var items = await _repo.GetByWarehouseAsync(warehouseId, user);

            return items.Select(i => new ResponseWarehouseStockItemJson
            {
                ProductId = i.ProductId,
                Sku = i.Product.Sku,
                ProductName = i.Product.Name,
                Quantity = i.Quantity,
                ReorderPoint = i.Product.ReorderPoint,
                LastPurchasePrice = i.Product.LastPurchasePrice
            }).ToList();
        }
    }

}
