using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.TABLE_PURCHASE_ORDERS)]
    public class Version0000011 : VersionBase
    {
        public override void Up()
        {
            CreateTable("PurchaseOrders")
                .WithColumn("Number").AsString(30).NotNullable()
                .WithColumn("SupplierId").AsInt64().NotNullable().ForeignKey("FK_PO_Supplier", "Suppliers", "Id")
                .WithColumn("Status").AsInt16().NotNullable()
                .WithColumn("CreatedByUserId").AsInt64().NotNullable().ForeignKey("FK_PO_User", "Users", "Id")
                .WithColumn("OrganizationId").AsInt64().NotNullable()
                    .ForeignKey("FK_PurchaseOrders_Organization", "Organizations", "Id");
        }
    }

}
