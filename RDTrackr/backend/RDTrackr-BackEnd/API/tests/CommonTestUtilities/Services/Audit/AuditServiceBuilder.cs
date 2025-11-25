using CommonTestUtilities.Context;
using CommonTestUtilities.Repositories.Audit;
using RDTrackR.Domain.Context;
using RDTrackR.Domain.Repositories.Audit;
using RDTrackR.Infrastructure.Services.Audit;

namespace CommonTestUtilities.Services.Audit
{
    public class AuditServiceBuilder
    {
        private IAuditLogRepository _repo = new AuditLogRepositoryBuilder().Build();
        private IUserContext _user = UserContextBuilder.Build(1, "Test User");

        public AuditServiceBuilder WithRepository(IAuditLogRepository repo)
        {
            _repo = repo;
            return this;
        }

        public AuditServiceBuilder WithUser(long id, string name)
        {
            _user = UserContextBuilder.Build(id, name);
            return this;
        }


        public AuditService Build()
        {
            return new AuditService(_repo, _user);
        }
    }
}
