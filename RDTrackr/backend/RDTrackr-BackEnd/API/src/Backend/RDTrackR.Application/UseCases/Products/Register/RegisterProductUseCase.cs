using AutoMapper;
using RDTrackR.Communication.Requests.Product;
using RDTrackR.Communication.Responses.Product;
using RDTrackR.Domain.Extensions;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.Products;
using RDTrackR.Domain.Services.Audit;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Domain.Services.Notification;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;

namespace RDTrackR.Application.UseCases.Products.Register
{
    public class RegisterProductUseCase : IRegisterProductUseCase
    {
        private readonly IProductWriteOnlyRepository _repository;
        private readonly IProductReadOnlyRepository _readOnlyRepository;
        private readonly INotificationService _notificationService;
        private readonly ILoggedUser _loggedUser;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAuditService _auditService;
        private readonly IMapper _mapper;

        public RegisterProductUseCase(
            IProductWriteOnlyRepository repository,
            IProductReadOnlyRepository readOnlyRepository,
            INotificationService notificationService,
            ILoggedUser loggedUser,
            IUnitOfWork unitOfWork,
            IAuditService auditService,
            IMapper mapper)
        {
            _repository = repository;
            _readOnlyRepository = readOnlyRepository;
            _notificationService = notificationService;
            _loggedUser = loggedUser;
            _unitOfWork = unitOfWork;
            _auditService = auditService;
            _mapper = mapper;
        }

        public async Task<ResponseProductJson> Execute(RequestRegisterProductJson request)
        {
            await Validate(request);

            var loggedUser = await _loggedUser.User();

            var product = _mapper.Map<RDTrackR.Domain.Entities.Product>(request);
            product.LastPurchasePrice = request.Price;
            product.CreatedByUserId = loggedUser.Id;
            product.OrganizationId = loggedUser.OrganizationId;
            product.CreatedOn = DateTime.UtcNow;
            product.UpdatedAt = DateTime.UtcNow;       
            product.Active = true;

            await _repository.AddAsync(product);

            product.CreatedBy = loggedUser;

            await _auditService.Log(Domain.Enums.AuditActionType.CREATE, $"Criado um novo produto {product.Name}.");
            await _notificationService.Notify($" Criado um novo produto {product.Name}");

            await _unitOfWork.Commit();

            return _mapper.Map<ResponseProductJson>(product);
        }


        private async Task Validate(RequestRegisterProductJson request)
        {
            var validator = new ProductValidator();
            var result = await validator.ValidateAsync(request);

            var skuExists = await _readOnlyRepository.ExistsActiveProductWithSku(request.Sku);
            if (skuExists)
                result.Errors.Add(new FluentValidation.Results.ValidationFailure(string.Empty, ResourceMessagesException.PRODUCT_SKU_DUPLICATE));

            if (result.IsValid.IsFalse())
            {
                throw new ErrorOnValidationException(
                    result.Errors.Select(e => e.ErrorMessage).Distinct().ToList()
                );
            }
        }
    }
}
