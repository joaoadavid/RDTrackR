using AutoMapper;
using RDTrackR.Communication.Responses.StockItem;
using RDTrackR.Domain.Repositories.StockItems;
using RDTrackR.Domain.Services.LoggedUser;

namespace RDTrackR.Application.UseCases.StockItems.GetAll
{
    public class GetAllStockItemsUseCase : IGetAllStockItemsUseCase
    {
        private readonly IStockItemReadOnlyRepository _readRepository;
        private readonly ILoggedUser _loggedUser;
        private readonly IMapper _mapper;

        public GetAllStockItemsUseCase(
            IStockItemReadOnlyRepository readRepository,
            ILoggedUser loggedUser,
            IMapper mapper)
        {
            _readRepository = readRepository;
            _loggedUser = loggedUser;
            _mapper = mapper;
        }

        public async Task<List<ResponseStockItemJson>> Execute()
        {
            var loggedUser = await _loggedUser.User();
            var stockItems = await _readRepository.GetAllAsync(loggedUser);
            return _mapper.Map<List<ResponseStockItemJson>>(stockItems);
        }
    }
}
