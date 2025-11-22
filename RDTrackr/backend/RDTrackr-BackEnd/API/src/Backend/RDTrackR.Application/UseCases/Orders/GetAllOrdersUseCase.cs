using AutoMapper;
using RDTrackR.Communication.Responses.Orders;
using RDTrackR.Domain.Repositories.Orders;
using RDTrackR.Domain.Services.LoggedUser;

namespace RDTrackR.Application.UseCases.Orders
{
    public class GetAllOrdersUseCase : IGetAllOrdersUseCase
    {
        private readonly IOrderReadOnlyRepository _repository;
        private readonly ILoggedUser _loggedUser;
        private readonly IMapper _mapper;

        public GetAllOrdersUseCase(IOrderReadOnlyRepository repository, IMapper mapper, ILoggedUser loggedUser)
        {
            _repository = repository;
            _loggedUser = loggedUser;
            _mapper = mapper;
        }

        public async Task<List<ResponseOrderJson>> Execute()
        {
            var loggedUser = await _loggedUser.User();
            var users = await _repository.GetAll(loggedUser.OrganizationId);
            return _mapper.Map<List<ResponseOrderJson>>(users);
        }
    }
}
