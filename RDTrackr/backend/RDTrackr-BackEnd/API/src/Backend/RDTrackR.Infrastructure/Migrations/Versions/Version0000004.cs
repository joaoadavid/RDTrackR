using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions;

[Migration(DatabaseVersions.TABLE_USER_FORGOT_PASSWORD, "Create table to save a code when the user forgot Password")]
public class Version0000004 : VersionBase
{
    public override void Up()
    {
        CreateTable("CodeToPerformActions")
            .WithColumn("Value").AsString().NotNullable()
            .WithColumn("UserId").AsInt64().NotNullable().ForeignKey("FK_CodeToPerformAction_User_Id", "Users", "Id");
    }
}