using AutoMapper;
using RDTrackR.Communication.Requests.Supplier;
using RDTrackR.Communication.Responses.Pages;
using RDTrackR.Communication.Responses.Supplier;
using RDTrackR.Domain.Repositories.Suppliers;
using RDTrackR.Domain.Services.LoggedUser;

namespace RDTrackR.Application.UseCases.Suppliers.GetAll
{
    public class GetAllSuppliersUseCase : IGetAllSuppliersUseCase
    {
        private readonly ISupplierReadOnlyRepository _repository;
        private readonly ILoggedUser _loggedUser;
        private readonly IMapper _mapper;

        public GetAllSuppliersUseCase(
            ISupplierReadOnlyRepository repository,
            ILoggedUser loggedUser,
            IMapper mapper)
        {
            _repository = repository;
            _loggedUser = loggedUser;
            _mapper = mapper;
        }

        public async Task<PagedResponse<ResponseSupplierJson>> Execute(RequestGetSuppliersPagedJson request)
        {
            var loggedUser = await _loggedUser.User();

            int page = request.Page <= 0 ? 1 : request.Page;
            int pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

            var suppliers = await _repository.GetPagedAsync(loggedUser, page, pageSize, request.Search);
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
