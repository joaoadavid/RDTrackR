using AutoMapper;
using RDTrackR.Communication.Responses.Supplier;
using RDTrackR.Domain.Repositories.Suppliers;

namespace RDTrackR.Application.UseCases.Suppliers.GetSupplierProduct
{
    public class GetProductsBySupplierUseCase : IGetProductsBySupplierUseCase
    {
        private readonly ISupplierReadOnlyRepository _repository;
        private readonly IMapper _mapper;

        public GetProductsBySupplierUseCase(ISupplierReadOnlyRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ResponseSupplierProductJson>> Execute(long supplierId)
        {
            var suppliers = await _repository.GetSupplierProducts(supplierId);
            return _mapper.Map<List<ResponseSupplierProductJson>>(suppliers);
        }
    }

}
