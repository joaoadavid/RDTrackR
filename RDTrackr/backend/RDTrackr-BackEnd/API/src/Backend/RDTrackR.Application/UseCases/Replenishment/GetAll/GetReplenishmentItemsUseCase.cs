using RDTrackR.Communication.Requests.Replenishment;
using RDTrackR.Communication.Responses.Pages;
using RDTrackR.Communication.Responses.Replenishment;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Enums;
using RDTrackR.Domain.Repositories.StockItems;
using RDTrackR.Domain.Services.LoggedUser;

namespace RDTrackR.Application.UseCases.Replenishment.GetAll
{
    public class GetReplenishmentItemsUseCase : IGetReplenishmentItemsUseCase
    {
        private readonly ILoggedUser _loggedUser;
        private readonly IStockItemReadOnlyRepository _stockRepo;

        public GetReplenishmentItemsUseCase(
            ILoggedUser loggedUser,
            IStockItemReadOnlyRepository stockRepo)
        {
            _loggedUser = loggedUser;
            _stockRepo = stockRepo;
        }

        //public async Task<List<ResponseReplenishmentItemJson>> Execute()
        //{
        //    var loggedUser = await _loggedUser.User();
        //    var items = await _stockRepo.GetAllAsync(loggedUser);
        //    return items.Select(i => new ResponseReplenishmentItemJson
        //    {
        //        ProductId = i.Product.Id,
        //        Sku = i.Product.Sku,
        //        Name = i.Product.Name,
        //        Category = i.Product.Category,
        //        Uom = i.Product.UoM,
        //        CurrentStock = i.Quantity,
        //        ReorderPoint = i.Product.ReorderPoint,
        //        DailyConsumption = i.Product.DailyConsumption,
        //        LeadTimeDays = i.Product.LeadTimeDays,
        //        SuggestedQty = CalculateSuggested(i),
        //        IsCritical = i.Quantity <= i.Product.ReorderPoint,
        //        UnitPrice = i.Product.LastPurchasePrice,
        //        WarehouseId = i.WarehouseId,
        //        WarehouseName = i.Warehouse.Name
        //    }).ToList();
        //}

        public async Task<PagedResponse<ResponseReplenishmentItemJson>> Execute(RequestGetReplenishmentPagedJson request)
        {
            var user = await _loggedUser.User();

            int page = request.Page <= 0 ? 1 : request.Page;
            int pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

            var items = await _stockRepo.GetPagedAsync(user, page, pageSize, request.Search);
            var total = await _stockRepo.CountAsync(user, request.Search);

            var mapped = items.Select(i => new ResponseReplenishmentItemJson
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
                UnitPrice = i.Product.LastPurchasePrice,
                WarehouseId = i.WarehouseId,
                WarehouseName = i.Warehouse.Name
            }).ToList();

            return new PagedResponse<ResponseReplenishmentItemJson>
            {
                Items = mapped,
                Total = total,
                Page = page,
                PageSize = pageSize
            };
        }


        private int CalculateSuggested(StockItem item)
        {
            int safetyStock = CalculateSafetyStock(item);

            decimal multiplier = item.Product.Criticality switch
            {
                ItemCriticality.Low => 1.5m,
                ItemCriticality.Medium => 2m,
                ItemCriticality.High => 3m,
                _ => 2m
            };

            int idealStock = (int)Math.Ceiling(safetyStock * multiplier);

            if (item.Quantity >= idealStock)
                return 0;

            return idealStock - item.Quantity;
        }



        private int CalculateSafetyStock(StockItem item)
        {
            var factor = item.Product.Criticality switch
            {
                ItemCriticality.Low => 0.20m,
                ItemCriticality.Medium => 0.30m,
                ItemCriticality.High => 0.40m,
                _ => 0.30m
            };

            return (int)Math.Ceiling(item.Product.InitialStockLevel * factor);
        }

    }

}
