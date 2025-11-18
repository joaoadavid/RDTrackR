using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.CREATE_ORGANIZATION,"Create Organization table")]
    public class Version0000001 : VersionBase
    {
        public override void Up()
        {
            CreateTable("Organizations")
                .WithColumn("Name").AsString(200).NotNullable();
        }
    }
}
