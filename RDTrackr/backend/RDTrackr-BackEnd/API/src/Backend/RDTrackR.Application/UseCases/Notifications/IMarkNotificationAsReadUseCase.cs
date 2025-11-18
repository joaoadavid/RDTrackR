
namespace RDTrackR.Application.UseCases.Notifications
{
    public interface IMarkNotificationAsReadUseCase
    {
        Task Execute(long id);
    }
}