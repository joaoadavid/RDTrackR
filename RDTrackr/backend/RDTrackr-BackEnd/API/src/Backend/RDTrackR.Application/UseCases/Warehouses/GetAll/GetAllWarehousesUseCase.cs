using AutoMapper;
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

        public async Task<List<ResponseWarehouseJson>> Execute()
        {
            var loggedUser = await _loggedUser.User();
            var warehouses = await _repository.GetAllAsync(loggedUser);

            return _mapper.Map<List<ResponseWarehouseJson>>(warehouses);
        }
    }
}