using MyRecipeBook.Communication.Responses;

namespace RDTrackR.Application.UseCases.User.GetAll
{
    public interface IGetAllUserProfileUseCase
    {
        Task<List<ResponseUserProfileJson>> Execute();
    }
}