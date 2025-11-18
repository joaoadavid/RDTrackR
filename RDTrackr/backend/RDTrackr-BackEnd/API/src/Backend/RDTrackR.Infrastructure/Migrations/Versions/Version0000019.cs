using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.ADD_USER_ROLE_COLUMN)]
    public class Version0000019 : VersionBase
    {
        public override void Up()
        {
            Alter.Table("Users")
                .AddColumn("Role").AsString(50).NotNullable().WithDefaultValue("User");
        }
    }
}
