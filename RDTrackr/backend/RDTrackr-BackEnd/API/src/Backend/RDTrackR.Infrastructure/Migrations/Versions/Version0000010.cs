using RDTrackR.Infrastructure.Migrations.Versions;
using RDTrackR.Infrastructure.Migrations;
using FluentMigrator;

[Migration(DatabaseVersions.TABLE_SUPPLIERS, "Create Suppliers Table")]
public class Version0000010 : VersionBase
{
    public override void Up()
    {
        CreateTable("Suppliers")
            .WithColumn("Name").AsString(255).NotNullable()
            .WithColumn("Contact").AsString(255).NotNullable()
            .WithColumn("Email").AsString(255).NotNullable()
            .WithColumn("Phone").AsString(30).Nullable()
            .WithColumn("Address").AsString(500).Nullable()
            .WithColumn("CreatedByUserId").AsInt64().NotNullable()
                .ForeignKey("FK_Suppliers_User_Id", "Users", "Id")
            .WithColumn("OrganizationId").AsInt64().NotNullable()
                    .ForeignKey("FK_Suppliers_OrganizationId", "Organizations", "Id");
    }
}
