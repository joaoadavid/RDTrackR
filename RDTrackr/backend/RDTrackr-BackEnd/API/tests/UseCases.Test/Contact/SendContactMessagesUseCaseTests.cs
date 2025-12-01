using Moq;
using RDTrackR.Application.UseCases.Contact;
using RDTrackR.Communication.Requests.Contact;
using RDTrackR.Domain.Services.Email;
using Shouldly;

namespace UseCases.Test.Contact
{
    public class SendContactMessageUseCaseTests
    {
        [Fact]
        public async Task Execute_ShouldCallEmailService_WithCorrectParameters()
        {
            var mockEmailService = new Mock<IContactEmailService>();

            var useCase = new SendContactMessageUseCase(mockEmailService.Object);

            var request = new RequestContactJson
            {
                Name = "João",
                Email = "joao@example.com",
                Subject = "Problema no sistema",
                Message = "Olá, encontrei um erro ao tentar logar."
            };

            Func<Task> act = async () => await useCase.Execute(request);

            await act.ShouldNotThrowAsync();

            mockEmailService.Verify(x =>
                x.SendContactMessageAsync(
                    request.Name,
                    request.Email,
                    request.Subject,
                    request.Message),
                Times.Once);
        }
    }
}
