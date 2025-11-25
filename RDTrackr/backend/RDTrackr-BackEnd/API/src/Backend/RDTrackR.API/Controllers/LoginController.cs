using Microsoft.AspNetCore.Mvc;
using RDTrackR.API.Attributes;
using RDTrackR.Application.UseCases.Login.DoLogin;
using RDTrackR.Application.UseCases.Login.Logout;
using RDTrackR.Application.UseCases.Login.ResetPassword;
using RDTrackR.Communication.Requests.Login;
using RDTrackR.Communication.Requests.Password;
using RDTrackR.Communication.Responses.Error;
using RDTrackR.Communication.Responses.User;

namespace RDTrackR.API.Controllers
{

    public class LoginController : RDTrackRBaseController
    {
        [HttpPost]
        [ProducesResponseType(typeof(ResponseRegisterUserJson), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromServices] IDoLoginUseCase useCase, [FromBody] RequestLoginJson request)
        {
            var response = await useCase.Execute(request);
            return Ok(response);
        }

        [AuthenticatedUser]
        [HttpPost("logout")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> Logout(
            [FromServices] ILogoutUseCase useCase,
            [FromBody] string refreshToken)
        {
            await useCase.Execute(refreshToken);
            return NoContent();
        }

        [HttpGet]
        [Route("code-reset-password/{email}")]
        [ProducesResponseType(StatusCodes.Status202Accepted)]
        public async Task<IActionResult> RequestCodeResetPassword(
        [FromServices] IRequestCodeResetPasswordUseCase useCase,
        [FromRoute] string email)
        {
            await useCase.Execute(email);
            return Accepted();
        }

        [HttpPut]
        [Route("reset-password")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ResetPassword(
           [FromServices] IResetPasswordUseCase useCase,
           [FromBody] RequestResetYourPasswordJson request)
        {
            await useCase.Execute(request);
            return NoContent();
        }

        [HttpPost]
        [Route("validate-reset-code")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ValidateResetCode(
        [FromServices] IValidateResetCodeUseCase useCase,
        [FromBody] RequestValidateResetCodeJson request)
        {
            await useCase.Execute(request);
            return NoContent();
        }

    }
}
