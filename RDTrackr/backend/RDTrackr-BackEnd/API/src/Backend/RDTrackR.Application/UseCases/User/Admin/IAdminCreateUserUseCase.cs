using RDTrackR.Communication.Requests.User;
using RDTrackR.Communication.Responses.User.Admin;

namespace RDTrackR.Application.UseCases.User.Admin
{
    public interface IAdminCreateUserUseCase
    {
        Task<ResponseAdminCreateUserJson> Execute(RequestAdminCreateUserJson request);
    }
}