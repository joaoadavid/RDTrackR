using RDTrackR.Application.UseCases.PurchaseOrders.Register;
using RDTrackR.Communication.Requests.PurchaseOrders;
using RDTrackR.Communication.Requests.Replenishment;
using RDTrackR.Communication.Responses.PurchaseOrders;
using RDTrackR.Domain.Repositories.Products;
using RDTrackR.Domain.Repositories.StockItems;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;
using System.Reflection;

namespace RDTrackR.Application.UseCases.Replenishment.Register
{
    public class GeneratePoFromReplenishmentUseCase : IGeneratePoFromReplenishmentUseCase
    {
        private readonly IRegisterPurchaseOrderUseCase _createPo;
        private readonly IProductReadOnlyRepository _productRepo;
        private readonly IStockItemReadOnlyRepository _stockRepo;
        private readonly ILoggedUser _loggedUser;

        public GeneratePoFromReplenishmentUseCase(
            IRegisterPurchaseOrderUseCase createPo,
            IProductReadOnlyRepository productRepo,
            IStockItemReadOnlyRepository stockRepo,
            ILoggedUser loggedUser)
        {
            _createPo = createPo;
            _productRepo = productRepo;
            _stockRepo = stockRepo;
            _loggedUser = loggedUser;
        }

        //public async Task<ResponsePurchaseOrderJson> Execute(RequestGeneratePoFromReplenishmentJson request)
        //{
        //    var validator = new GenerateReplenishmentValidator();
        //    var result = await validator.ValidateAsync(request);

        //    if (!result.IsValid)
        //        throw new ErrorOnValidationException(
        //            result.Errors.Select(e => e.ErrorMessage).ToList()
        //        );

        //    var user = await _loggedUser.User();

        //    var firstItem = request.Items.First();
        //    var stockItem = await _stockRepo.GetByProductAndWarehouseAsync(firstItem.ProductId, request.WarehouseId);

        //    if (stockItem == null)
        //        throw new ErrorOnValidationException([ResourceMessagesException.WAREHOUSE_NOT_FOUND]);

        //    long warehouseId = stockItem.WarehouseId;

        //    var poRequest = new RequestCreatePurchaseOrderJson
        //    {
        //        Number = stockItem.Product.Name,
        //        SupplierId = request.SupplierId,
        //        WarehouseId = warehouseId,
        //        Items = new List<RequestCreatePurchaseOrderItemJson>()
        //    };

        //    foreach (var item in request.Items)
        //    {
        //        var product = await _productRepo.GetByIdAsync(item.ProductId, user)
        //            ?? throw new ErrorOnValidationException([ResourceMessagesException.PRODUCT_NOT_FOUND]);

        //        poRequest.Items.Add(new RequestCreatePurchaseOrderItemJson
        //        {
        //            ProductId = item.ProductId,
        //            Quantity = item.Quantity,
        //            UnitPrice = product.LastPurchasePrice
        //        });
        //    }

        //    return await _createPo.Execute(poRequest);
        //}

        public async Task<ResponsePurchaseOrderJson> Execute(RequestGeneratePoFromReplenishmentJson request)
        {
            var validator = new GenerateReplenishmentValidator();
            var result = await validator.ValidateAsync(request);

            if (!result.IsValid)
                throw new ErrorOnValidationException(
                    result.Errors.Select(e => e.ErrorMessage).ToList()
                );

            var user = await _loggedUser.User();

            long warehouseId = request.WarehouseId;

            foreach (var item in request.Items)
            {
                var product = await _productRepo.GetByIdAsync(item.ProductId, user)
                    ?? throw new ErrorOnValidationException([ResourceMessagesException.PRODUCT_NOT_FOUND]);
            }

            string orderNumber = $"REP-{DateTime.UtcNow:yyyyMMddHHmmss}";

            var poRequest = new RequestCreatePurchaseOrderJson
            {
                Number = orderNumber,
                SupplierId = request.SupplierId,
                WarehouseId = warehouseId,
                Items = new List<RequestCreatePurchaseOrderItemJson>()
            };

            foreach (var item in request.Items)
            {
                var product = await _productRepo.GetByIdAsync(item.ProductId, user);

                poRequest.Items.Add(new RequestCreatePurchaseOrderItemJson
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.LastPurchasePrice
                });
            }

            return await _createPo.Execute(poRequest);
        }

    }
}
