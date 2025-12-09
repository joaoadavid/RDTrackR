using AutoMapper;
using RDTrackR.Communication.Requests.StockItem;
using RDTrackR.Communication.Responses.StockItem;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.StockItems;
using RDTrackR.Domain.Services.Audit;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Domain.Services.Notification;
using RDTrackR.Exceptions.ExceptionBase;

namespace RDTrackR.Application.UseCases.StockItems.Register
{
    public class RegisterStockItemUseCase : IRegisterStockItemUseCase
    {
        private readonly IStockItemWriteOnlyRepository _writeRepository;
        private readonly IStockItemReadOnlyRepository _readRepository;
        private readonly INotificationService _notificationService;
        private readonly IAuditService _auditService;
        private readonly ILoggedUser _loggedUser;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public RegisterStockItemUseCase(
            IStockItemWriteOnlyRepository writeRepository,
            IStockItemReadOnlyRepository readRepository,
            INotificationService notificationService,
            IAuditService auditService,
            ILoggedUser loggedUser,
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _writeRepository = writeRepository;
            _readRepository = readRepository;
            _notificationService = notificationService;
            _auditService = auditService;
            _loggedUser = loggedUser;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ResponseStockItemJson> Execute(RequestRegisterStockItemJson request)
        {
            var validator = new StockItemValidator();
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid)
                throw new ErrorOnValidationException(validation.Errors.Select(e => e.ErrorMessage).ToList());

            var loggedUser = await _loggedUser.User();

            var existing = await _readRepository.GetByProductAndWarehouseAsync(request.ProductId, request.WarehouseId);
            if (existing is not null)
            {
                existing.Quantity += request.Quantity;
                existing.UpdatedAt = DateTime.UtcNow;
                existing.CreatedByUserId = loggedUser.Id;
                await _writeRepository.UpdateAsync(existing);
                await _unitOfWork.Commit();
                return _mapper.Map<ResponseStockItemJson>(existing);
            }

            var stockItem = _mapper.Map<StockItem>(request);
            stockItem.UpdatedAt = DateTime.UtcNow;
            stockItem.CreatedByUserId = loggedUser.Id;
            stockItem.OrganizationId = loggedUser.OrganizationId;
            

            await _writeRepository.AddAsync(stockItem);
            await _unitOfWork.Commit();
            await _notificationService.Notify($"Novo {stockItem.Product.Name} foi adicionado ao estoque.");
            await _auditService.Log(Domain.Enums.AuditActionType.CREATE, $"Novo {stockItem.Product.Name} foi adicionado ao estoque.");

            var reloaded = await _readRepository.GetByIdAsync(stockItem.Id);

            return _mapper.Map<ResponseStockItemJson>(reloaded);
        }

    }
}
