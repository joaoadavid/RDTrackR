using RDTrackR.Communication.Responses.Overview;
using RDTrackR.Domain.Repositories.Products;
using RDTrackR.Domain.Repositories.Warehouses;
using RDTrackR.Domain.Repositories.Movements;
using RDTrackR.Domain.Repositories.StockItems;
using RDTrackR.Domain.Services.LoggedUser;

namespace RDTrackR.Application.UseCases.Overview.Get
{
    public class GetOverviewUseCase : IGetOverviewUseCase
    {
        private readonly ILoggedUser _loggedUser;
        private readonly IProductReadOnlyRepository _productRepo;
        private readonly IWarehouseReadOnlyRepository _warehouseRepo;
        private readonly IMovementReadOnlyRepository _movementRepo;
        private readonly IStockItemReadOnlyRepository _stockItemRepo;

        public GetOverviewUseCase(
            ILoggedUser loggedUser,
            IProductReadOnlyRepository productRepo,
            IWarehouseReadOnlyRepository warehouseRepo,
            IMovementReadOnlyRepository movementRepo,
            IStockItemReadOnlyRepository stockItemRepo)
        {
            _loggedUser = loggedUser;
            _productRepo = productRepo;
            _warehouseRepo = warehouseRepo;
            _movementRepo = movementRepo;
            _stockItemRepo = stockItemRepo;
        }

        public async Task<ResponseOverviewJson> Execute()
        {
            var loggedUser = await _loggedUser.User();
            var totalProducts = await _productRepo.CountAsync(loggedUser);
            var totalWarehouses = await _warehouseRepo.CountAsync(loggedUser);
            var totalMovements = await _movementRepo.CountAsync(loggedUser);
            var stockItems = await _stockItemRepo.GetAllAsync(loggedUser);

            return new ResponseOverviewJson
            {
                TotalProducts = totalProducts,
                TotalWarehouses = totalWarehouses,
                TotalMovements = totalMovements,
                TotalStockItems = stockItems.Count,
                TotalInventoryQuantity = stockItems.Sum(s => s.Quantity)
            };
        }
    }
}
