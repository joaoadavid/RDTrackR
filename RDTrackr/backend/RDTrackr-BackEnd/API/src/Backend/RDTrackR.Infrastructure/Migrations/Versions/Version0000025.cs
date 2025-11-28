using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.ALTER_QUANTITY)]
    public class Version0000025: VersionBase
    {
        public override void Up()
        {
            Alter.Column("Quantity")
            .OnTable("PurchaseOrderItems")
            .AsInt32()
            .NotNullable();

        }
    }
}
