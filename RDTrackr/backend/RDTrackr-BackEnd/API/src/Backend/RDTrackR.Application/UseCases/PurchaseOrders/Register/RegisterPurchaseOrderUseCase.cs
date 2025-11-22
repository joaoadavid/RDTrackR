using AutoMapper;
using RDTrackR.Communication.Requests.PurchaseOrders;
using RDTrackR.Communication.Responses.PurchaseOrders;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Enums;
using RDTrackR.Domain.Extensions;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.PurchaseOrders;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Exceptions.ExceptionBase;
using RDTrackR.Exceptions;

namespace RDTrackR.Application.UseCases.PurchaseOrders.Register
{
    public class RegisterPurchaseOrderUseCase : IRegisterPurchaseOrderUseCase
    {
        private readonly IMapper _mapper;
        private readonly IPurchaseOrderWriteOnlyRepository _writeRepository;
        private readonly ILoggedUser _loggedUser;
        private readonly IUnitOfWork _unitOfWork;

        public RegisterPurchaseOrderUseCase(IMapper mapper, IPurchaseOrderWriteOnlyRepository writeOnlyRepository, ILoggedUser loggedUser, IUnitOfWork unitOfWork)
        {
            _mapper = mapper;
            _writeRepository = writeOnlyRepository;
            _loggedUser = loggedUser;
            _unitOfWork = unitOfWork;
        }
        public async Task<ResponsePurchaseOrderJson> Execute(RequestCreatePurchaseOrderJson request)
        {
            await Validate(request);

            var loggedUser = await _loggedUser.User();

            var po = _mapper.Map<PurchaseOrder>(request);
            po.Number = request.Number;
            po.OrganizationId = loggedUser.OrganizationId;
            po.WarehouseId = request.WarehouseId;
            po.CreatedByUserId = loggedUser.Id;
            po.Status = PurchaseOrderStatus.DRAFT;
            
            foreach (var item in po.Items)
            {
                item.OrganizationId = loggedUser.OrganizationId;
                item.CreatedOn = DateTime.UtcNow;
            }
            
            await _writeRepository.AddAsync(po);
            await _unitOfWork.Commit();

            return _mapper.Map<ResponsePurchaseOrderJson>(po);
        }

        private async Task Validate(RequestCreatePurchaseOrderJson request)
        {
            var validator = new PurchaseOrderValidator();
            var result = await validator.ValidateAsync(request);

            // Regra extra: validar itens duplicados
            var duplicated = request.Items
                .GroupBy(i => i.ProductId)
                .Where(g => g.Count() > 1)
                .Any();

            if (duplicated)
                result.Errors.Add(new FluentValidation.Results.ValidationFailure(nameof(request.Items), ResourceMessagesException.PO_ITEM_DUPLICATED));

            if (result.IsValid.IsFalse())
            {
                throw new ErrorOnValidationException(
                    result.Errors.Select(e => e.ErrorMessage).Distinct().ToList()
                );
            }
        }
    }
}
