using Moq;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories.Audit;

namespace CommonTestUtilities.Repositories.Audit
{
    public class AuditLogRepositoryBuilder
    {
        private readonly Mock<IAuditLogRepository> _repoMock;
        private readonly List<AuditLog> _logs = new();

        public AuditLogRepositoryBuilder()
        {
            _repoMock = new Mock<IAuditLogRepository>();
        }

        public AuditLogRepositoryBuilder VerifyAddAsync(AuditLog expected)
        {
            _repoMock.Verify(r => r.AddAsync(
                It.Is<AuditLog>(log =>
                    log.UserId == expected.UserId &&
                    log.UserName == expected.UserName &&
                    log.ActionType == expected.ActionType &&
                    log.Description == expected.Description
                )
            ), Times.Once);

            return this;
        }

        public AuditLogRepositoryBuilder AddAsyncCallback(Action<AuditLog> callback)
        {
            _repoMock.Setup(r => r.AddAsync(It.IsAny<AuditLog>()))
                     .Callback(callback)
                     .Returns(Task.CompletedTask);

            return this;
        }

        public AuditLogRepositoryBuilder WithPagedResult(List<AuditLog> logs)
        {
            _logs.Clear();
            _logs.AddRange(logs);

            _repoMock
                .Setup(r => r.GetPagedAsync(
                    It.IsAny<int>(),
                    It.IsAny<int>(),
                    It.IsAny<string?>(),
                    It.IsAny<string?>()))
                .ReturnsAsync((int page, int pageSize, string? type, string? search) =>
                {
                    var query = _logs.AsQueryable();

                    if (!string.IsNullOrWhiteSpace(type) && type != "all")
                        query = query.Where(x => x.ActionType.ToString() == type);

                    if (!string.IsNullOrWhiteSpace(search))
                        query = query.Where(x => x.Description.Contains(search));

                    var total = query.Count();

                    var logsPage = query
                        .OrderByDescending(x => x.Timestamp)
                        .Skip((page - 1) * pageSize)
                        .Take(pageSize)
                        .ToList();

                    return ((List<AuditLog>)logsPage, total);
                });

            return this;
        }

        public AuditLogRepositoryBuilder WithRecentResult(List<AuditLog> logs)
        {
            _repoMock.Setup(r => r.GetRecentAsync(It.IsAny<string?>(), It.IsAny<string?>()))
                .ReturnsAsync((string? type, string? search) =>
                {
                    var query = logs.AsQueryable();

                    if (!string.IsNullOrWhiteSpace(type))
                        query = query.Where(x => x.ActionType.ToString() == type);

                    if (!string.IsNullOrWhiteSpace(search))
                        query = query.Where(x => x.Description.Contains(search));

                    return query
                        .OrderByDescending(x => x.Timestamp)
                        .Take(100)
                        .ToList();
                });

            return this;
        }

        public IAuditLogRepository Build() => _repoMock.Object;
    }
}
