using AutoMapper;
using RDTrackR.Communication.Requests.PurchaseOrders;
using RDTrackR.Communication.Responses.Pages;
using RDTrackR.Communication.Responses.PurchaseOrders;
using RDTrackR.Domain.Repositories.PurchaseOrders;
using RDTrackR.Domain.Services.LoggedUser;

namespace RDTrackR.Application.UseCases.PurchaseOrders.GetAll
{
    public class GetPurchaseOrdersUseCase : IGetPurchaseOrdersUseCase
    {
        private readonly IPurchaseOrderReadOnlyRepository _repository;
        private readonly ILoggedUser _loggedUser;
        private readonly IMapper _mapper;

        public GetPurchaseOrdersUseCase(
            IPurchaseOrderReadOnlyRepository repository,
            ILoggedUser loggedUser,
            IMapper mapper)
        {
            _repository = repository;
            _loggedUser = loggedUser;
            _mapper = mapper;
        }

        //public async Task<List<ResponsePurchaseOrderJson>> Execute()
        //{
        //    var loggedUser = await _loggedUser.User();
        //    var orders = await _repository.Get(loggedUser);
        //    return _mapper.Map<List<ResponsePurchaseOrderJson>>(orders);
        //}

        public async Task<PagedResponse<ResponsePurchaseOrderJson>> Execute(RequestGetPurchaseOrdersPagedJson request)
        {
            var user = await _loggedUser.User();

            int page = request.Page <= 0 ? 1 : request.Page;
            int pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

            var orders = await _repository.GetPagedAsync(
                user, page, pageSize, request.Status, request.Search
            );

            var total = await _repository.CountAsync(
                user, request.Status, request.Search
            );

            return new PagedResponse<ResponsePurchaseOrderJson>
            {
                Items = _mapper.Map<List<ResponsePurchaseOrderJson>>(orders),
                Total = total,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}
