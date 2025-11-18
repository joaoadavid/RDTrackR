using RDTrackR.Communication.Responses.Notifications;

namespace RDTrackR.Application.UseCases.Notifications
{
    public interface IGetNotificationUseCase
    {
        Task<List<ResponseNotificationJson>> Execute();
    }
}