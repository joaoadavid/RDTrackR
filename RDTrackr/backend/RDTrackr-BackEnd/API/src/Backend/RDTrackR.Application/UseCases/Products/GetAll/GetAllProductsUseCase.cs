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

        public async Task<List<ResponseProductJson>> Execute()
        {
            var loggedUser = await _loggedUser.User();
            var products = await _readRepository.GetAllAsync(loggedUser);
            return _mapper.Map<List<ResponseProductJson>>(products);
        }  
    }
}
