using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.TABLE_AUDIT_LOG, "Create AuditLog table")]
    public class Version0000012 : VersionBase
    {
        public override void Up()
        {
            CreateTable("AuditLogs")
                .WithColumn("UserId").AsInt64().NotNullable()
                .WithColumn("UserName").AsString(150).NotNullable()
                .WithColumn("ActionType").AsString(30).NotNullable()
                .WithColumn("Description").AsString(500).NotNullable()
                .WithColumn("Timestamp").AsDateTime().NotNullable()
                .WithColumn("OrganizationId").AsInt64().NotNullable()
                    .ForeignKey("FK_AuditLogs_Organization", "Organizations", "Id");
        }

    }

}
