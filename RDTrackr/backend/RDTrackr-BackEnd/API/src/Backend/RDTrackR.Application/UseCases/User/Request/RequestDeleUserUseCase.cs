using MyRecipeBook.Application.UseCases.User.Delete.Request;
using MyRecipeBook.Domain.Repositories.User;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.Users;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Domain.Services.ServiceBus;

namespace RDTrackR.Application.UseCases.User.Request;
public class RequestDeleteUserUseCase : IRequestDeleteUserUseCase
{
    private readonly IDeleteUserQueue _queue;
    private readonly IUserReadOnlyRepository _repository;
    private readonly IUserUpdateOnlyRepository _userUpdateRepository;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;

    public RequestDeleteUserUseCase(
        IDeleteUserQueue queue,
        IUserReadOnlyRepository repository,
        IUserUpdateOnlyRepository userUpdateRepository,
        ILoggedUser loggedUser,
        IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
        _queue = queue;
        _loggedUser = loggedUser;
        _userUpdateRepository = userUpdateRepository;
        _repository = repository;
    }

    public async Task Execute()
    {
        var loggedUser = await _loggedUser.User();

        var user = await _repository.GetUserById(loggedUser.Id);

        user.Active = false;

        await _userUpdateRepository.Update(user);

        await _unitOfWork.Commit();

        await _queue.SendMessage(loggedUser);
    }
}