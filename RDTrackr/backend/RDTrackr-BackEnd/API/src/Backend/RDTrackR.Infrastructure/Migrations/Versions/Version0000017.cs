using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.ALTER_PURCHASE_ORDERS_STAUTS_TO_INT32)]
    public class Version0000017 : VersionBase
    {
        public override void Up()
        {
            Alter.Column("Status")
                .OnTable("PurchaseOrders")
                .AsInt32()
                .NotNullable();
        }
    }
}
