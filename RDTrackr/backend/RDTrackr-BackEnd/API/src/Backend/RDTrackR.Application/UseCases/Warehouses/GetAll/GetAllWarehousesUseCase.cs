using AutoMapper;
using RDTrackR.Communication.Requests.Warehouse;
using RDTrackR.Communication.Responses.Pages;
using RDTrackR.Communication.Responses.Warehouse;
using RDTrackR.Domain.Repositories.Warehouses;
using RDTrackR.Domain.Services.LoggedUser;

namespace RDTrackR.Application.UseCases.Warehouses.GetAll
{
    public class GetAllWarehousesUseCase : IGetAllWarehousesUseCase
    {
        private readonly IWarehouseReadOnlyRepository _repository;
        private readonly ILoggedUser _loggedUser;
        private readonly IMapper _mapper;

        public GetAllWarehousesUseCase(
            IWarehouseReadOnlyRepository repository,
            ILoggedUser loggedUser,
            IMapper mapper)
        {
            _repository = repository;
            _loggedUser = loggedUser;
            _mapper = mapper;
        }

        public async Task<PagedResponse<ResponseWarehouseJson>> Execute(RequestGetWarehousesPagedJson request)
        {
            var user = await _loggedUser.User();

            int page = request.Page <= 0 ? 1 : request.Page;
            int pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

            var warehouses = await _repository.GetPagedAsync(
                user, page, pageSize, request.Search);

            var total = await _repository.CountAsync(user, request.Search);

            return new PagedResponse<ResponseWarehouseJson>
            {
                Items = _mapper.Map<List<ResponseWarehouseJson>>(warehouses),
                Total = total,
                Page = page,
                PageSize = pageSize
            };
        }

    }
}