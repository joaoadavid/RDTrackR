using AutoMapper;
using RDTrackR.Communication.Requests.Supplier;
using RDTrackR.Communication.Responses.Supplier;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Extensions;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.Products;
using RDTrackR.Domain.Repositories.Suppliers;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Exceptions.ExceptionBase;

namespace RDTrackR.Application.UseCases.Suppliers.RegisterSupplierProduct
{
    public class RegisterSupplierProductUseCase : IRegisterSupplierProductUseCase
    {
        private readonly ISupplierWriteOnlyRepository _repository;
        private readonly IProductReadOnlyRepository _productRepository;
        private readonly ILoggedUser _loggedUser;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public RegisterSupplierProductUseCase(ISupplierWriteOnlyRepository repository, IProductReadOnlyRepository productRepository,
            IUnitOfWork unitOfWork, ILoggedUser loggedUser, IMapper mapper)
        {
            _repository = repository;
            _productRepository = productRepository;
            _loggedUser = loggedUser;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ResponseSupplierProductJson> Execute(RequestRegisterSupplierProductJson request)
        {
            await Validate(request);

            var user = await _loggedUser.User();

            var supplier = _mapper.Map<SupplierProduct>(request);
            supplier.OrganizationId = user.OrganizationId;

            await _repository.AddSupplierProduct(supplier);
            await _unitOfWork.Commit();

            supplier.Product = await _productRepository!.GetByIdAsync(request.ProductId, user);

            return _mapper.Map<ResponseSupplierProductJson>(supplier);
        }

        private async Task Validate(RequestRegisterSupplierProductJson request)
        {
            var validator = new SupplierProductValidator();
            var result = await validator.ValidateAsync(request);

            if (result.IsValid.IsFalse())
            {
                throw new ErrorOnValidationException(
                    result.Errors.Select(e => e.ErrorMessage).Distinct().ToList()
                );
            }
        }
    }
}
