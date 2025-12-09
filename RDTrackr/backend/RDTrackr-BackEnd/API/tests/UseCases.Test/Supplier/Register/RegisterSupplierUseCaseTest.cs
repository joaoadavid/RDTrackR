using CommonTestUtilities.Entities;
using CommonTestUtilities.LoggedUser;
using CommonTestUtilities.Mapper;
using CommonTestUtilities.Repositories;
using CommonTestUtilities.Repositories.Suppliers;
using CommonTestUtilities.Requests.Supplier;
using CommonTestUtilities.Services.Audit;
using RDTrackR.Application.UseCases.Suppliers.Register;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;
using Shouldly;

namespace UseCases.Test.Supplier.Register
{
    public class RegisterSupplierUseCaseTest
    {
        [Fact]
        public async Task Success()
        {
            var request = RequestRegisterSupplierJsonBuilder.Build();
            (var user, _) = UserBuilder.Build();

            var useCase = CreateUseCase(user);

            var result = await useCase.Execute(request);

            result.ShouldNotBeNull();
            result.Name.ShouldBe(request.Name);
        }

        [Fact]
        public async Task Error_Email_Already_Registered()
        {
            (var user, _) = UserBuilder.Build();

            var request = RequestRegisterSupplierJsonBuilder.Build();
            request.Name = string.Empty;
            var useCase = CreateUseCase(user);

            Func<Task> act = async () => await useCase.Execute(request);

            var exception = await act.ShouldThrowAsync<ErrorOnValidationException>();
            exception.GetErrorMessages().ShouldContain(ResourceMessagesException.SUPPLIER_NAME_REQUIRED);
        }

        private static RegisterSupplierUseCase CreateUseCase(RDTrackR.Domain.Entities.User user)
        {
            var writeRepository = new SupplierRepositoryBuilder().BuildWrite();
            var readRepository = new SupplierRepositoryBuilder().BuildRead();
            var mapper = MapperBuilder.Build();
            var unitOfWork = UnitOfWorkBuilder.Build();
            var loggedUser = LoggedUserBuilder.Build(user);
            var notificationService = new NotificationServiceBuilder().Build();
            var auditService = new AuditServiceBuilder().Build();

            return new RegisterSupplierUseCase(writeRepository, readRepository, notificationService, auditService, loggedUser, unitOfWork, mapper);
        }
    }
}
