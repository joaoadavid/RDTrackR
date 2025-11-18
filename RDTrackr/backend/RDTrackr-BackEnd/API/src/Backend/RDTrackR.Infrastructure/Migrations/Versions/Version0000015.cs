using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.TABLE_NOTIFICATIONS, "Create Notifications table")]
    public class Version0000015 : VersionBase
    {
        public override void Up()
        {
            CreateTable("Notifications")
                .WithColumn("UserId").AsInt64().NotNullable()
                .WithColumn("Message").AsString(500).NotNullable()
                .WithColumn("Read").AsBoolean().WithDefaultValue(false)
                .WithColumn("OrganizationId").AsInt64().NotNullable()
                    .ForeignKey("FK_Notifications_Organization", "Organizations", "Id");
        }
    }
}
