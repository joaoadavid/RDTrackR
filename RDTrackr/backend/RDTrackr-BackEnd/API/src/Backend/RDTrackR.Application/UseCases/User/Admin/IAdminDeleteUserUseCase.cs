
namespace RDTrackR.Application.UseCases.User.Admin
{
    public interface IAdminDeleteUserUseCase
    {
        Task Execute(long id);
    }
}