using AutoMapper;
using RDTrackR.Communication.Requests.Supplier;
using RDTrackR.Communication.Responses.Pages;
using RDTrackR.Communication.Responses.Supplier;
using RDTrackR.Domain.Repositories.Suppliers;

namespace RDTrackR.Application.UseCases.Suppliers.GetAll
{
    public class GetAllSuppliersUseCase : IGetAllSuppliersUseCase
    {
        private readonly ISupplierReadOnlyRepository _repository;
        private readonly IMapper _mapper;

        public GetAllSuppliersUseCase(
            ISupplierReadOnlyRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        //public async Task<List<ResponseSupplierJson>> Execute()
        //{
        //    var suppliers = await _repository.GetAllAsync();
        //    return _mapper.Map<List<ResponseSupplierJson>>(suppliers);
        //}

        public async Task<PagedResponse<ResponseSupplierJson>> Execute(RequestGetSuppliersPagedJson request)
        {
            int page = request.Page <= 0 ? 1 : request.Page;
            int pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

            var suppliers = await _repository.GetPagedAsync(page, pageSize, request.Search);
            var total = await _repository.CountAsync(request.Search);

            return new PagedResponse<ResponseSupplierJson>
            {
                Items = _mapper.Map<List<ResponseSupplierJson>>(suppliers),
                Total = total,
                Page = page,
                PageSize = pageSize
            };
        }

    }
}
