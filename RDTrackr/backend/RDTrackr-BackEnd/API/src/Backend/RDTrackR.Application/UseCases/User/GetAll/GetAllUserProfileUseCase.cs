using AutoMapper;
using MyRecipeBook.Communication.Responses;
using RDTrackR.Domain.Repositories.Users;
using RDTrackR.Domain.Services.LoggedUser;

namespace RDTrackR.Application.UseCases.User.GetAll
{
    public class GetAllUserProfileUseCase : IGetAllUserProfileUseCase
    {
        private readonly IUserReadOnlyRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly ILoggedUser _loggedUser;

        public GetAllUserProfileUseCase(IUserReadOnlyRepository userRepository, IMapper mapper, ILoggedUser loggedUser)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _loggedUser = loggedUser;
        }

        public async Task<List<ResponseUserProfileJson>> Execute()
        {
            var loggedUser = await _loggedUser.User();
            var users = await _userRepository.GetAllAsync(loggedUser);
            return _mapper.Map<List<ResponseUserProfileJson>>(users);
        }
    }
}
