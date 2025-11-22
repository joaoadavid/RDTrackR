using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.ADD_WAREHOUSE_TO_PURCHASE_ORDER)]
    public class Version0000023 : VersionBase
    {
        public override void Up()
        {
            Alter.Table("PurchaseOrders")
                .AddColumn("WarehouseId").AsInt64().NotNullable()
                .ForeignKey("FK_PO_Warehouse", "Warehouses", "Id");
        }

    }
}
