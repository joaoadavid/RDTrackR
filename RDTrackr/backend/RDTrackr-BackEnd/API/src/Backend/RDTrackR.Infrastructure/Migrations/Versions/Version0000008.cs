using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.TABLE_STOCKITEMS, "Create StockItems table")]
    public class Version0000008 : VersionBase
    {
        public override void Up()
        {
            CreateTable("StockItems")
                .WithColumn("ProductId").AsInt64().NotNullable()
                    .ForeignKey("FK_StockItems_Product_Id", "Products", "Id")
                .WithColumn("WarehouseId").AsInt64().NotNullable()
                    .ForeignKey("FK_StockItems_Warehouse_Id", "Warehouses", "Id")
                .WithColumn("Quantity").AsDecimal(18, 2).NotNullable().WithDefaultValue(0)
                .WithColumn("UpdatedAt").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentDateTime)
                .WithColumn("CreatedByUserId").AsInt64().NotNullable()
                    .ForeignKey("FK_StockItems_CreatedByUser_Id", "Users", "Id")
                .WithColumn("OrganizationId").AsInt64().NotNullable()
                    .ForeignKey("FK_StockItems_Organization", "Organizations", "Id");

            Create.UniqueConstraint("UQ_StockItem_Product_Warehouse")
                .OnTable("StockItems")
                .Columns("ProductId", "WarehouseId");
        }
    }
}
