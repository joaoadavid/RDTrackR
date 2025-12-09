using AutoMapper;
using RDTrackR.Communication.Enums;
using RDTrackR.Communication.Requests.Movements;
using RDTrackR.Communication.Responses.Movements;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Extensions;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.Movements;
using RDTrackR.Domain.Repositories.Products;
using RDTrackR.Domain.Repositories.StockItems;
using RDTrackR.Domain.Repositories.Warehouses;
using RDTrackR.Domain.Services.Audit;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Domain.Services.Notification;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;

namespace RDTrackR.Application.UseCases.Movements.Register
{
    public class RegisterMovementUseCase : IRegisterMovementUseCase
    {
        private readonly IMovementWriteOnlyRepository _movementWriteRepository;
        private readonly IMovementReadOnlyRepository _movementReadRepository;
        private readonly INotificationService _notificationService;
        private readonly IAuditService _auditService;
        private readonly IStockItemReadOnlyRepository _stockItemReadRepository;
        private readonly IStockItemWriteOnlyRepository _stockItemWriteRepository;
        private readonly IProductReadOnlyRepository _productRepository;
        private readonly IWarehouseReadOnlyRepository _warehouseRepository;
        private readonly ILoggedUser _loggedUser;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public RegisterMovementUseCase(
            IMovementWriteOnlyRepository movementWriteRepository,
            IMovementReadOnlyRepository movementReadRepository,
            INotificationService notificationService,
            IAuditService auditService,
            IStockItemReadOnlyRepository stockItemReadRepository,
            IStockItemWriteOnlyRepository stockItemWriteRepository,
            IProductReadOnlyRepository productRepository,
            IWarehouseReadOnlyRepository warehouseRepository,
            ILoggedUser loggedUser,
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _movementWriteRepository = movementWriteRepository;
            _movementReadRepository = movementReadRepository;
            _notificationService = notificationService;
            _auditService = auditService;
            _stockItemReadRepository = stockItemReadRepository;
            _stockItemWriteRepository = stockItemWriteRepository;
            _productRepository = productRepository;
            _warehouseRepository = warehouseRepository;
            _loggedUser = loggedUser;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ResponseMovementJson> Execute(RequestRegisterMovementJson request)
        {
            var loggedUser = await _loggedUser.User();
            
            await Validate(request,loggedUser);

            var movement = _mapper.Map<Movement>(request);
            movement.CreatedByUserId = loggedUser.Id;
            movement.CreatedOn = DateTime.UtcNow;
            movement.OrganizationId = loggedUser.OrganizationId;

            await _movementWriteRepository.AddAsync(movement);
            await UpdateStock(request, loggedUser);
            await _notificationService.Notify($"Novo item {movement.Product.Name} foi movido no estoque");
            await _unitOfWork.Commit();

            movement = await _movementReadRepository.GetByIdAsync(movement.Id);
            await _auditService.Log(Domain.Enums.AuditActionType.CREATE, $"Novo item movido no estoque {movement.Warehouse.Name} item: {movement.Product.Name}");

            return _mapper.Map<ResponseMovementJson>(movement);
        }

        private async Task UpdateStock(RequestRegisterMovementJson request, Domain.Entities.User loggedUser)
        {
            var stockItem = await _stockItemReadRepository.GetByProductAndWarehouseAsync(request.ProductId, request.WarehouseId);

            switch (request.Type)
            {
                case MovementType.INBOUND:
                    if (stockItem is null)
                    {
                        stockItem = new StockItem
                        {
                            ProductId = request.ProductId,
                            WarehouseId = request.WarehouseId,
                            Quantity = request.Quantity,
                            OrganizationId = loggedUser.OrganizationId,
                            CreatedByUserId = loggedUser.Id,
                            UpdatedAt = DateTime.UtcNow
                        };
                        await _stockItemWriteRepository.AddAsync(stockItem);
                    }
                    else
                    {
                        stockItem.OrganizationId = loggedUser.OrganizationId;
                        stockItem.Quantity += request.Quantity;
                        stockItem.UpdatedAt = DateTime.UtcNow;
                        await _stockItemWriteRepository.UpdateAsync(stockItem);
                    }
                    break;

                case MovementType.OUTBOUND:
                    if (stockItem is null || stockItem.Quantity < request.Quantity)
                        throw new ErrorOnValidationException([ResourceMessagesException.STOCK_INSUFFICIENT]);

                    stockItem.OrganizationId = loggedUser.OrganizationId;
                    stockItem.Quantity -= request.Quantity;
                    stockItem.UpdatedAt = DateTime.UtcNow;
                    await _stockItemWriteRepository.UpdateAsync(stockItem);
                    break;

                case MovementType.ADJUST:
                    if (stockItem is null)
                    {
                        stockItem = new StockItem
                        {
                            ProductId = request.ProductId,
                            WarehouseId = request.WarehouseId,
                            Quantity = request.Quantity,
                            OrganizationId = loggedUser.OrganizationId,
                            CreatedByUserId = loggedUser.Id,
                            UpdatedAt = DateTime.UtcNow
                        };
                        await _stockItemWriteRepository.AddAsync(stockItem);
                    }
                    else
                    {
                        stockItem.OrganizationId = loggedUser.OrganizationId;
                        stockItem.Quantity = request.Quantity;
                        stockItem.UpdatedAt = DateTime.UtcNow;
                        await _stockItemWriteRepository.UpdateAsync(stockItem);
                    }
                    break;
            }
        }

        private async Task Validate(RequestRegisterMovementJson request,Domain.Entities.User user)
        {
            var validator = new MovementValidator();
            var result = await validator.ValidateAsync(request);

            var product = await _productRepository.GetByIdAsync(request.ProductId,user);
            if (product is null)
                result.Errors.Add(new FluentValidation.Results.ValidationFailure(nameof(request.ProductId), ResourceMessagesException.PRODUCT_NOT_FOUND));

            var warehouse = await _warehouseRepository.GetByIdAsync(request.WarehouseId, user);
            if (warehouse is null)
                result.Errors.Add(new FluentValidation.Results.ValidationFailure(nameof(request.WarehouseId), ResourceMessagesException.WAREHOUSE_NOT_FOUND));

            if (result.IsValid.IsFalse())
                throw new ErrorOnValidationException(result.Errors.Select(e => e.ErrorMessage).Distinct().ToList());
        }

        public async Task<Movement> RegisterMovementInternal(RequestRegisterMovementJson request, Domain.Entities.User loggedUser)
        {
            await Validate(request, loggedUser);

            var movement = _mapper.Map<Movement>(request);
            movement.CreatedByUserId = loggedUser.Id;
            movement.CreatedOn = DateTime.UtcNow;
            movement.OrganizationId = loggedUser.OrganizationId;

            await _movementWriteRepository.AddAsync(movement);

            await UpdateStock(request, loggedUser);

            return movement;
        }
    }
}
