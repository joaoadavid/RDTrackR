using AutoMapper;
using RDTrackR.Communication.Responses.Notifications;
using RDTrackR.Communication.Responses.Product;
using RDTrackR.Domain.Repositories.Notifications;
using RDTrackR.Domain.Services.LoggedUser;

namespace RDTrackR.Application.UseCases.Notifications
{
    public class GetNotificationUseCase : IGetNotificationUseCase
    {
        private readonly INotificationRepository _repository;
        private readonly ILoggedUser _loggedUser;
        private readonly IMapper _mapper;

        public GetNotificationUseCase(INotificationRepository repository, ILoggedUser loggedUser, IMapper mapper)
        {
            _loggedUser = loggedUser;
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<ResponseNotificationJson>> Execute()
        {
            var loggedUser = await _loggedUser.User();
            var notifications = await _repository.GetAllUnreadAsync(loggedUser);
            return _mapper.Map<List<ResponseNotificationJson>>(notifications);
        }
    }
}
