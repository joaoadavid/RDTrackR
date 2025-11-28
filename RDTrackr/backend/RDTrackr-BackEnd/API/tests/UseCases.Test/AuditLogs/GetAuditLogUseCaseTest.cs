using CommonTestUtilities.Repositories.Audit;
using RDTrackR.Application.UseCases.AuditLogs;
using RDTrackR.Communication.Requests.AuditLogs;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Enums;
using Shouldly;

namespace UseCases.Test.AuditLogs
{
    public class GetAuditLogUseCaseTest
    {
        public class GetAuditLogsUseCaseTest
        {
            [Fact]
            public async Task Success_Paged()
            {
                var logs = new List<AuditLog>
            {
                new AuditLog
                {
                    Id = 1, UserName = "Alice",
                    Description = "Criou usuário",
                    ActionType = AuditActionType.CREATE,
                    Timestamp = DateTime.UtcNow
                },
                new AuditLog
                {
                    Id = 2, UserName = "Bob",
                    Description = "Atualizou produto",
                    ActionType = AuditActionType.UPDATE,
                    Timestamp = DateTime.UtcNow.AddMinutes(-1)
                }
            };

                var repo = new AuditLogRepositoryBuilder()
                    .WithPagedResult(logs)
                    .Build();

                var useCase = new GetAuditLogsUseCase(repo);

                var request = new RequestGetAuditLogsPagedJson
                {
                    Page = 1,
                    PageSize = 10,
                    Type = "all"
                };

                var result = await useCase.Execute(request);

                result.Items.Count.ShouldBe(2);
                result.Total.ShouldBe(2);
            }
        }

    }
}
