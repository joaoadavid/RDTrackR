using RDTrackR.Communication.Requests.Organization;
using RDTrackR.Communication.Responses.Organization;

namespace RDTrackR.Application.UseCases.Organizations
{
    public interface IRegisterOrganizationUseCase
    {
        Task<ResponseRegisterOrganizationJson> Execute(RequestRegisterOrganizationJson request);
    }
}