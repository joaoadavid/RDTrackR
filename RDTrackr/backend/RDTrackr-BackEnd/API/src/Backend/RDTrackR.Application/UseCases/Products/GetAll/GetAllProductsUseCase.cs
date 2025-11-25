using AutoMapper;
using RDTrackR.Domain.Repositories;
using RDTrackR.Communication.Responses.Product;
using RDTrackR.Domain.Repositories.Products;
using RDTrackR.Application.UseCases.Products;
using RDTrackR.Communication.Requests.Product;
using RDTrackR.Exceptions.ExceptionBase;
using RDTrackR.Exceptions;
using RDTrackR.Domain.Extensions;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Communication.Responses.Pages;

namespace RDTrackR.Application.UseCases.Product.GetAll
{
    public class GetAllProductsUseCase : IGetAllProductsUseCase
    {
        private readonly IProductReadOnlyRepository _readRepository;
        private readonly ILoggedUser _loggedUser;
        private readonly IMapper _mapper;

        public GetAllProductsUseCase(
            IProductReadOnlyRepository readRepository,
            ILoggedUser loggedUser,
            IMapper mapper)
        {
            _readRepository = readRepository;
            _loggedUser = loggedUser;
            _mapper = mapper;
        }

        //public async Task<List<ResponseProductJson>> Execute()
        //{
        //    var loggedUser = await _loggedUser.User();
        //    var products = await _readRepository.GetAllAsync(loggedUser);
        //    return _mapper.Map<List<ResponseProductJson>>(products);
        //}

        public async Task<PagedResponse<ResponseProductJson>> Execute(RequestGetProductsPagedJson request)
        {
            var user = await _loggedUser.User();

            int page = request.Page <= 0 ? 1 : request.Page;
            int pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

            var items = await _readRepository.GetPagedAsync(
                user,
                page,
                pageSize,
                request.Search
            );

            var total = await _readRepository.CountAsync(user, request.Search);

            return new PagedResponse<ResponseProductJson>
            {
                Items = _mapper.Map<List<ResponseProductJson>>(items),
                Total = total,
                Page = page,
                PageSize = pageSize
            };
        }

    }
}
