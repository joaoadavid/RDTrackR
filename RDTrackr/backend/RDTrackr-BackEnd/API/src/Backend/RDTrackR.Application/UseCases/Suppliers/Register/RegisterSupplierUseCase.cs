using RDTrackR.Communication.Requests.Supplier;
using RDTrackR.Communication.Responses.Supplier;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.StockItems;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.Suppliers;
using RDTrackR.Domain.Services.LoggedUser;
using AutoMapper;
using RDTrackR.Domain.Extensions;
using RDTrackR.Exceptions.ExceptionBase;
using RDTrackR.Exceptions;

namespace RDTrackR.Application.UseCases.Suppliers.Register
{
    public class RegisterSupplierUseCase : IRegisterSupplierUseCase
    {
        private readonly ISupplierWriteOnlyRepository _writeRepository;
        private readonly ISupplierReadOnlyRepository _readOnlyRepository;
        private readonly ILoggedUser _loggedUser;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public RegisterSupplierUseCase(ISupplierWriteOnlyRepository writeRepository,
            ISupplierReadOnlyRepository readOnlyRepository,
            ILoggedUser loggedUser,
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _writeRepository = writeRepository;
            _readOnlyRepository = readOnlyRepository;
            _loggedUser = loggedUser;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }
        public async Task<ResponseSupplierJson> Execute(RequestRegisterSupplierJson request)
        {
            await Validate(request);

            var user = await _loggedUser.User();

            var supplier = _mapper.Map<Supplier>(request);
            supplier.CreatedByUserId = user.Id;
            supplier.OrganizationId = user.OrganizationId;

            await _writeRepository.AddAsync(supplier);
            await _unitOfWork.Commit();

            supplier.CreatedBy = user;

            return _mapper.Map<ResponseSupplierJson>(supplier);
        }

        private async Task Validate(RequestRegisterSupplierJson request)
        {
            var validator = new SupplierBaseValidator();
            var result = await validator.ValidateAsync(request);

            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var exists = await _readOnlyRepository.ExistsWithEmail(request.Email);
                if (exists)
                    result.Errors.Add(new FluentValidation.Results.ValidationFailure(nameof(request.Email), ResourceMessagesException.SUPPLIER_EMAIL_DUPLICATE));
            }

            if (result.IsValid.IsFalse())
            {
                throw new ErrorOnValidationException(
                    result.Errors.Select(e => e.ErrorMessage).Distinct().ToList()
                );
            }
        } 
    }
}
