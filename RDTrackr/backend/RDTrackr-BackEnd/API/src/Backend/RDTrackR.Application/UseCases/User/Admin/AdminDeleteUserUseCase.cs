using RDTrackR.Domain.Repositories.Users;
using RDTrackR.Domain.Repositories;
using RDTrackR.Exceptions.ExceptionBase;
using RDTrackR.Exceptions;
using RDTrackR.Domain.Services.LoggedUser;

namespace RDTrackR.Application.UseCases.User.Admin
{
    public class AdminDeleteUserUseCase : IAdminDeleteUserUseCase
    {
        private readonly ILoggedUser _loggedUser;
        private readonly IUserReadOnlyRepository _readRepo;
        private readonly IUserWriteOnlyRepository _writeRepo;
        private readonly IUnitOfWork _unitOfWork;

        public AdminDeleteUserUseCase(
            ILoggedUser loggedUser,
            IUserReadOnlyRepository readRepo,
            IUserWriteOnlyRepository writeRepo,
            IUnitOfWork unitOfWork)
        {
            _loggedUser = loggedUser;
            _readRepo = readRepo;
            _writeRepo = writeRepo;
            _unitOfWork = unitOfWork;
        }

        public async Task Execute(long id)
        {
            var admin = await _loggedUser.User();

            var user = await _readRepo.GetUserById(id);

            if (user == null || user.OrganizationId != admin.OrganizationId)
                throw new NotFoundException(ResourceMessagesException.USER_NOT_FOUND);

            await _writeRepo.Delete(user.Id);
            await _unitOfWork.Commit();
        }
    }

}
