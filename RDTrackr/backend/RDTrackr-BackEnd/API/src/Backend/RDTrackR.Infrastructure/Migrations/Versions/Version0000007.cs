using RDTrackR.Infrastructure.Migrations.Versions;
using RDTrackR.Infrastructure.Migrations;
using FluentMigrator;

[Migration(DatabaseVersions.TABLE_MOVEMENTS, "Create Movements table")]
public class Version0000007 : VersionBase
{
    public override void Up()
    {
        CreateTable("Movements")
            .WithColumn("Reference").AsString(100).NotNullable()
            .WithColumn("ProductId").AsInt64().NotNullable().ForeignKey("FK_Movements_Product_Id", "Products", "Id")
            .WithColumn("WarehouseId").AsInt64().NotNullable().ForeignKey("FK_Movements_Warehouse_Id", "Warehouses", "Id")
            .WithColumn("Type").AsInt16().NotNullable()
            .WithColumn("Quantity").AsDecimal(18, 2).NotNullable()
            .WithColumn("OrganizationId").AsInt64().NotNullable()
                    .ForeignKey("FK_Movements_Organization", "Organizations", "Id")
            .WithColumn("CreatedAt").AsDateTime().NotNullable()
            .WithColumn("CreatedByUserId").AsInt64().NotNullable().ForeignKey("FK_Movements_User_Id", "Users", "Id");

    }
}
