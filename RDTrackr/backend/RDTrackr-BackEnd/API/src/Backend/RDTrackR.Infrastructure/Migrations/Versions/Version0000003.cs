using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.TABLE_REFRESH_TOKEN, "Create table to save refresh tokens with TokenId and expiration")]
    public class Version0000003 : VersionBase
    {
        public override void Up()
        {
            CreateTable("RefreshTokens")
                .WithColumn("Value").AsString(255).NotNullable()
                .WithColumn("UserId").AsInt64().NotNullable()
                    .ForeignKey("FK_RefreshTokens_User_Id", "Users", "Id")
                .WithColumn("TokenId").AsString(100).NotNullable()
                .WithColumn("CreatedAt").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentDateTime)
                .WithColumn("ExpiresAt").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentDateTime)
                .WithColumn("IsRevoked").AsBoolean().NotNullable().WithDefaultValue(false);
        }
    }
}
