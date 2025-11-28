using AutoMapper;
using RDTrackR.Communication.Requests.Orders;
using RDTrackR.Communication.Responses.Orders;
using RDTrackR.Communication.Responses.Pages;
using RDTrackR.Domain.Repositories.Orders;
using RDTrackR.Domain.Services.LoggedUser;

namespace RDTrackR.Application.UseCases.Orders
{
    public class GetOrdersPagedUseCase : IGetOrdersPagedUseCase
    {
        private readonly IOrderReadOnlyRepository _repository;
        private readonly ILoggedUser _loggedUser;
        private readonly IMapper _mapper;

        public GetOrdersPagedUseCase(
            IOrderReadOnlyRepository repository,
            ILoggedUser loggedUser,
            IMapper mapper)
        {
            _repository = repository;
            _loggedUser = loggedUser;
            _mapper = mapper;
        }

        public async Task<PagedResponse<ResponseOrderJson>> Execute(RequestGetOrdersPagedJson request)
        {
            var user = await _loggedUser.User();

            int page = request.Page <= 0 ? 1 : request.Page;
            int pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

            var orders = await _repository.GetPagedAsync(
                user.OrganizationId,
                page,
                pageSize,
                request.Status,
                request.Search
            );

            var total = await _repository.CountAsync(
                user.OrganizationId,
                request.Status,
                request.Search
            );

            return new PagedResponse<ResponseOrderJson>
            {
                Items = _mapper.Map<List<ResponseOrderJson>>(orders),
                Total = total,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}
