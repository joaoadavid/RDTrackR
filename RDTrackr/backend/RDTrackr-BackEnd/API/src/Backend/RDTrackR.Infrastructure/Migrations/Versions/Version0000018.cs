using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.FIX_AUDITLOG_ACTIONTYPE_INT)]
    public class Version0000018 : VersionBase
    {
        public override void Up()
        {
            Alter.Column("ActionType")
                .OnTable("AuditLogs")
                .AsInt32()
                .NotNullable();
        }
    }
}
