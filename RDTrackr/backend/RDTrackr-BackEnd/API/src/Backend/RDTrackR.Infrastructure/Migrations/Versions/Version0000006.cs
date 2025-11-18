using RDTrackR.Infrastructure.Migrations;
using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.TABLE_WAREHOUSES, "Create Warehouses table")]
    public class Version0000006 : VersionBase
    {
        public override void Up()
        {
            CreateTable("Warehouses")
                .WithColumn("Name").AsString(255).NotNullable()
                .WithColumn("Location").AsString(255).NotNullable()
                .WithColumn("Capacity").AsInt32().NotNullable()
                .WithColumn("Items").AsInt32().NotNullable().WithDefaultValue(0)
                .WithColumn("Utilization").AsDecimal(5, 2).NotNullable().WithDefaultValue(0)
                .WithColumn("OrganizationId").AsInt64().NotNullable()
                    .ForeignKey("FK_Warehouses_Organization", "Organizations", "Id")
                .WithColumn("CreatedByUserId").AsInt64().NotNullable()
                    .ForeignKey("FK_Warehouses_CreatedByUser", "Users", "Id")
                .WithColumn("UpdatedByUserId").AsInt64().Nullable()
                        .ForeignKey("FK_Warehouses_UpdatedByUser", "Users", "Id")
                    .WithColumn("UpdatedAt").AsDateTime().Nullable()
                        .WithDefault(SystemMethods.CurrentDateTime);
        }
    }
}