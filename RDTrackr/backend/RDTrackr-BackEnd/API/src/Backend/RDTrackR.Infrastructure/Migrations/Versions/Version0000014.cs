using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.TABLE_PURCHASE_ORDER_ITEMS)]
    public class Version0000014 : VersionBase
    {
        public override void Up()
        {
            CreateTable("PurchaseOrderItems")
                .WithColumn("PurchaseOrderId").AsInt64().NotNullable().Indexed()
                .WithColumn("ProductId").AsInt64().NotNullable().Indexed()
                .WithColumn("Quantity").AsDecimal(18, 2).NotNullable()
                .WithColumn("UnitPrice").AsDecimal(18, 2).NotNullable()
                .WithColumn("OrganizationId").AsInt64().NotNullable()
                    .ForeignKey("FK_PurchaseOrderItems_Organization", "Organizations", "Id");

            Create.ForeignKey("FK_PurchaseOrderItems_PurchaseOrders")
                .FromTable("PurchaseOrderItems").ForeignColumn("PurchaseOrderId")
                .ToTable("PurchaseOrders").PrimaryColumn("Id");

            Create.ForeignKey("FK_PurchaseOrderItems_Products")
                .FromTable("PurchaseOrderItems").ForeignColumn("ProductId")
                .ToTable("Products").PrimaryColumn("Id");
        }
    }
}
