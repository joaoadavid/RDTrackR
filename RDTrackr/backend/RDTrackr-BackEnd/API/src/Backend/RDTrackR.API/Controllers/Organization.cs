using Microsoft.AspNetCore.Mvc;
using RDTrackR.Application.UseCases.Organizations;
using RDTrackR.Communication.Requests.Organization;
using RDTrackR.Communication.Responses.Organization;

namespace RDTrackR.API.Controllers
{

    public class Organization : RDTrackRBaseController
    {
        [HttpPost("Register")]
        [ProducesResponseType(typeof(ResponseRegisterOrganizationJson), StatusCodes.Status201Created)]
        public async Task<IActionResult> RegisterOrganization(
        [FromServices] IRegisterOrganizationUseCase useCase,
        [FromBody] RequestRegisterOrganizationJson request)
        {
            var result = await useCase.Execute(request);
            return Created(string.Empty, result);
        }

    }
}
