using RDTrackR.Communication.Requests.User;
using RDTrackR.Communication.Responses.User;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.Users;
using RDTrackR.Domain.Security.Cryptography;
using RDTrackR.Domain.Context;
using RDTrackR.Exceptions.ExceptionBase;
using RDTrackR.Exceptions;
using RDTrackR.Communication.Responses.User.Admin;
using RDTrackR.Domain.Services.LoggedUser;

namespace RDTrackR.Application.UseCases.User.Admin
{
    public class AdminCreateUserUseCase : IAdminCreateUserUseCase
    {
        private readonly IUserWriteOnlyRepository _writeRepository;
        private readonly IUserReadOnlyRepository _readRepository;
        private readonly IPasswordEncripter _passwordEncripter;
        private readonly ILoggedUser _loggedUser;
        private readonly IUnitOfWork _unitOfWork;

        public AdminCreateUserUseCase(
            IUserWriteOnlyRepository writeRepository,
            IUserReadOnlyRepository readRepository,
            IPasswordEncripter passwordEncripter,
            ILoggedUser loggedUser,
            IUnitOfWork unitOfWork)
        {
            _writeRepository = writeRepository;
            _readRepository = readRepository;
            _passwordEncripter = passwordEncripter;
            _loggedUser = loggedUser;
            _unitOfWork = unitOfWork;
        }

        public async Task<ResponseAdminCreateUserJson> Execute(RequestAdminCreateUserJson request)
        {
            // 1) Validar se o email já existe
            var emailExists = await _readRepository.ExistsActiveUserWithEmail(request.Email);
            if (emailExists)
            {
                throw new ErrorOnValidationException(new List<string>
                {
                    ResourceMessagesException.EMAIL_ALREADY_REGISTERED
                });
            }

            // 2) Buscar admin logado
            var admin = await _loggedUser.User();

            if (admin is null || admin.Role.ToLower() != "admin")
                throw new ErrorOnValidationException([ResourceMessagesException.ADMIN_CREATE_USER]);

            // 3) Criar usuário
            var newUser = new RDTrackR.Domain.Entities.User
            {
                Name = request.Name,
                Email = request.Email,
                Password = _passwordEncripter.Encrypt(request.Password),
                Role = "user",
                OrganizationId = admin.OrganizationId,
                Active = true
            };

            await _writeRepository.Add(newUser);
            await _unitOfWork.Commit();

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
