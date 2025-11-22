using AutoMapper;
using RDTrackR.Communication.Responses.User.Admin;
using RDTrackR.Domain.Repositories.Users;
using RDTrackR.Domain.Services.LoggedUser;

namespace RDTrackR.Application.UseCases.User.Admin
{
    public class GetAllUsersUseCase : IGetAllUsersUseCase
    {
        private readonly IUserReadOnlyRepository _repository;
        private readonly ILoggedUser _loggedUser;
        private readonly IMapper _mapper;

        public GetAllUsersUseCase(IUserReadOnlyRepository repository, IMapper mapper, ILoggedUser loggedUser)
        {
            _repository = repository;
            _loggedUser = loggedUser;
            _mapper = mapper;
        }

        public async Task<List<ResponseUserListItemJson>> Execute()
        {
            var loggedUser = await _loggedUser.User();
            var users = await _repository.GetAllAsync(loggedUser);
            return _mapper.Map<List<ResponseUserListItemJson>>(users);
        }
    }

}
