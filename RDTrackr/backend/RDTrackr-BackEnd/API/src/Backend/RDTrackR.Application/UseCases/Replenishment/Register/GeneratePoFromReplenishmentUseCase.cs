using RDTrackR.Application.UseCases.PurchaseOrders.Register;
using RDTrackR.Communication.Requests.PurchaseOrders;
using RDTrackR.Communication.Requests.Replenishment;
using RDTrackR.Communication.Responses.PurchaseOrders;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Products;
using RDTrackR.Domain.Repositories.StockItems;
using RDTrackR.Domain.Services.Audit;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Domain.Services.Notification;
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
        private readonly INotificationService _notificationService;
        private readonly IAuditService _auditService;
        private readonly ILoggedUser _loggedUser;

        public GeneratePoFromReplenishmentUseCase(
            IRegisterPurchaseOrderUseCase createPo,
            IProductReadOnlyRepository productRepo,
            IStockItemReadOnlyRepository stockRepo,
            INotificationService notificationService,
            IAuditService auditService,
            ILoggedUser loggedUser)
        {
            _createPo = createPo;
            _productRepo = productRepo;
            _stockRepo = stockRepo;
            _notificationService = notificationService;
            _auditService = auditService;
            _loggedUser = loggedUser;
        }

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

            await _notificationService.Notify($" Novo pedido de compra {poRequest.Number} criado com sucesso");
            await _auditService.Log(Domain.Enums.AuditActionType.CREATE, $" Novo pedido de compra {poRequest.Number} criado com sucesso.");
            return await _createPo.Execute(poRequest);
        }

    }
}
