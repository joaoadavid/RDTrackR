using Microsoft.AspNetCore.Mvc;
using MyRecipeBook.Application.UseCases.User.ChangePassword;
using MyRecipeBook.Application.UseCases.User.Delete.Request;
using MyRecipeBook.Application.UseCases.User.Profile;
using MyRecipeBook.Application.UseCases.User.Register;
using MyRecipeBook.Application.UseCases.User.Update;
using MyRecipeBook.Communication.Responses;
using RDTrackR.API.Attributes;
using RDTrackR.Application.UseCases.User.GetAll;
using RDTrackR.Communication.Requests.Password;
using RDTrackR.Communication.Requests.User;
using RDTrackR.Communication.Responses.Error;
using RDTrackR.Communication.Responses.User;

namespace RDTrackR.API.Controllers
{
    public class UserController : RDTrackRBaseController
    {
        [HttpPost]
        [AuthenticatedUser("admin")]
        [ProducesResponseType(typeof(ResponseRegisterUserJson), StatusCodes.Status201Created)]
        public async Task<IActionResult> Register(
            [FromServices] IRegisterUserUseCase useCase,
            [FromBody] RequestRegisterUserJson requestRegisterUser)
        {
            var result = await useCase.Execute(requestRegisterUser);
            return Created(string.Empty, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(ResponseUserProfileJson), StatusCodes.Status200OK)]
        [AuthenticatedUser("admin")]
        public async Task<IActionResult> GetUserProfile(
            [FromServices] IGetUserProfileUseCase useCase)
        {
            var result = await useCase.Execute();
            return Ok(result);
        }

        [HttpGet]
        [Route("all-users")]
        [ProducesResponseType(typeof(ResponseUserProfileJson), StatusCodes.Status200OK)]
        [AuthenticatedUser("admin")]
        public async Task<IActionResult> GetAllUserProfile(
            [FromServices] IGetAllUserProfileUseCase useCase)
        {
            var result = await useCase.Execute();
            return Ok(result);
        }

        [HttpPut]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
        [AuthenticatedUser("admin")]
        public async Task<IActionResult> UpdateUser(
           [FromServices] IUpdateUserUseCase useCase,
           [FromBody] RequestUpdateUserJson request)
        {
            await useCase.Execute(request);
            return NoContent();
        }

        [HttpPut("change-password")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
        [AuthenticatedUser]
        public async Task<IActionResult> ChangePassword(
           [FromServices] IChangePasswordUseCase useCase,
           [FromBody] RequestChangePasswordJson request)
        {
            await useCase.Execute(request);
            return NoContent();
        }

        [HttpDelete]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [AuthenticatedUser("admin")]
        public async Task<IActionResult> Delete(
          [FromServices] IRequestDeleteUserUseCase useCase)
        {
            await useCase.Execute();

            return NoContent();
        }


    }
}
