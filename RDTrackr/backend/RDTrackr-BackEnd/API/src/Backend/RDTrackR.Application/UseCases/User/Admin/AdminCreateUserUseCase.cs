using RDTrackR.Communication.Requests.User;
using RDTrackR.Communication.Responses.User.Admin;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.Users;
using RDTrackR.Domain.Security.Cryptography;
using RDTrackR.Domain.Services.Audit;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Domain.Services.Notification;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;

namespace RDTrackR.Application.UseCases.User.Admin
{
    public class AdminCreateUserUseCase : IAdminCreateUserUseCase
    {
        private readonly IUserWriteOnlyRepository _writeRepository;
        private readonly IUserReadOnlyRepository _readRepository;
        private readonly IPasswordEncripter _passwordEncripter;
        private readonly INotificationService _notificationService;
        private readonly IAuditService _auditService;
        private readonly ILoggedUser _loggedUser;
        private readonly IUnitOfWork _unitOfWork;

        public AdminCreateUserUseCase(
            IUserWriteOnlyRepository writeRepository,
            IUserReadOnlyRepository readRepository,
            INotificationService notificationService,
            IAuditService auditService,
            IPasswordEncripter passwordEncripter,
            ILoggedUser loggedUser,
            IUnitOfWork unitOfWork)
        {
            _writeRepository = writeRepository;
            _readRepository = readRepository;
            _notificationService = notificationService;
            _auditService = auditService;
            _passwordEncripter = passwordEncripter;
            _loggedUser = loggedUser;
            _unitOfWork = unitOfWork;
        }

        public async Task<ResponseAdminCreateUserJson> Execute(RequestAdminCreateUserJson request)
        {
            var emailExists = await _readRepository.ExistsActiveUserWithEmail(request.Email);
            if (emailExists)
            {
                throw new ErrorOnValidationException(new List<string>
                {
                    ResourceMessagesException.EMAIL_ALREADY_REGISTERED
                });
            }

            var admin = await _loggedUser.User();

            if (admin is null || admin.Role.ToLower() != "admin"!)
                throw new ErrorOnValidationException([ResourceMessagesException.ADMIN_CREATE_USER]);

            var newUser = new RDTrackR.Domain.Entities.User
            {
                Name = request.Name,
                Email = request.Email,
                Password = _passwordEncripter.Encrypt(request.Password),
                Role = request.Role,
                OrganizationId = admin.OrganizationId,
                Active = true
            };

            await _writeRepository.Add(newUser);
            await _unitOfWork.Commit();

            await _notificationService.Notify($" Usuario {newUser.Name} criado com sucesso.");
            await _auditService.Log(Domain.Enums.AuditActionType.CREATE, $" Usuario {newUser.Name} criado com sucesso.");

            return new ResponseAdminCreateUserJson
            {
                Id = newUser.Id,
                Name = newUser.Name,
                Email = newUser.Email,
                Role = newUser.Role
            };
        }
    }
}
