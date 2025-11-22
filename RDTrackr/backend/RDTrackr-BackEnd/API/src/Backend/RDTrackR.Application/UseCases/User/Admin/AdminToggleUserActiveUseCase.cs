using RDTrackR.Domain.Repositories.Users;
using RDTrackR.Domain.Repositories;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;
using MyRecipeBook.Domain.Repositories.User;

namespace RDTrackR.Application.UseCases.User.Admin
{
    public class AdminToggleUserActiveUseCase : IAdminToggleUserActiveUseCase
    {
        private readonly IUserUpdateOnlyRepository _updateRepository;
        private readonly IUserReadOnlyRepository _readRepository;
        private readonly IUnitOfWork _unitOfWork;

        public AdminToggleUserActiveUseCase(
            IUserUpdateOnlyRepository updateRepository,
            IUserReadOnlyRepository readRepository,
            IUnitOfWork unitOfWork)
        {
            _updateRepository = updateRepository;
            _readRepository = readRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task Execute(long id)
        {
            var user = await _readRepository.GetUserById(id)
                ?? throw new NotFoundException(ResourceMessagesException.USER_NOT_FOUND);

            user.Active = !user.Active;

            await _updateRepository.Update(user);
            await _unitOfWork.Commit();
        }
    }
}
