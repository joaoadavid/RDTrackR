using RDTrackR.Communication.Responses.Replenishment;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Products;
using RDTrackR.Domain.Repositories.StockItems;
using RDTrackR.Domain.Services.LoggedUser;

namespace RDTrackR.Application.UseCases.Replenishment.GetAll
{
    public class GetReplenishmentItemsUseCase : IGetReplenishmentItemsUseCase
    {
        private readonly ILoggedUser _loggedUser;
        private readonly IStockItemReadOnlyRepository _stockRepo;
        private readonly IProductReadOnlyRepository _productRepo;

        public GetReplenishmentItemsUseCase(
            ILoggedUser loggedUser,
            IStockItemReadOnlyRepository stockRepo,
            IProductReadOnlyRepository productRepo)
        {
            _loggedUser = loggedUser;
            _stockRepo = stockRepo;
            _productRepo = productRepo;
        }

        public async Task<List<ResponseReplenishmentItemJson>> Execute()
        {
            var loggedUser = await _loggedUser.User();
            var items = await _stockRepo.GetReplenishmentCandidatesAsync(loggedUser);
            return items.Select(i => new ResponseReplenishmentItemJson
            {
                ProductId = i.Product.Id,
                Sku = i.Product.Sku,
                Name = i.Product.Name,
                Category = i.Product.Category,
                Uom = i.Product.UoM,
                CurrentStock = i.Quantity,
                ReorderPoint = i.Product.ReorderPoint,
                DailyConsumption = i.Product.DailyConsumption,
                LeadTimeDays = i.Product.LeadTimeDays,
                SuggestedQty = CalculateSuggested(i),
                IsCritical = i.Quantity <= i.Product.ReorderPoint,
                UnitPrice = i.Product.LastPurchasePrice
            }).ToList();
        }

        private decimal CalculateSuggested(StockItem item)
        {
            return (item.Product.LeadTimeDays * item.Product.DailyConsumption)
                    + item.Product.SafetyStock
                    - item.Quantity;
        }
    }

}
