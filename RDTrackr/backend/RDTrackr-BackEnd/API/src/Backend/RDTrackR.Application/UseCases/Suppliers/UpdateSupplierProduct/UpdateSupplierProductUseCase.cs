using AutoMapper;
using RDTrackR.Communication.Requests.Supplier;
using RDTrackR.Communication.Responses.Supplier;
using RDTrackR.Domain.Repositories.SupplierProducts;
using RDTrackR.Domain.Repositories;
using RDTrackR.Exceptions.ExceptionBase;
using RDTrackR.Exceptions;
using RDTrackR.Domain.Services.LoggedUser;

namespace RDTrackR.Application.UseCases.Suppliers.UpdateSupplierProduct
{
    public class UpdateSupplierProductUseCase : IUpdateSupplierProductUseCase
    {
        private readonly ILoggedUser _loggedUser;
        private readonly ISupplierProductReadOnlyRepository _readRepository;
        private readonly ISupplierProductWriteOnlyRepository _writeRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UpdateSupplierProductUseCase(
            ILoggedUser loggedUser,
            ISupplierProductReadOnlyRepository readRepository,
            ISupplierProductWriteOnlyRepository writeRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _loggedUser = loggedUser;
            _readRepository = readRepository;
            _writeRepository = writeRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ResponseSupplierProductJson> Execute(RequestUpdateSupplierProductJson request)
        {
            var loggedUser = await _loggedUser.User();

            var entity = await _readRepository.GetBySupplierAndProductAsync(
                request.SupplierId, request.ProductId,loggedUser);

            if (entity == null)
                throw new ErrorOnValidationException([ResourceMessagesException.SUPPLIER_PRODUCT_NOT_FOUND]);

            entity.UnitPrice = request.UnitPrice;

            await _writeRepository.UpdateAsync(entity);
            await _unitOfWork.Commit();

            return _mapper.Map<ResponseSupplierProductJson>(entity);
        }
    }
}
