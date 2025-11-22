using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.TABLE_RDTRACKR_PRODUCTS, "Create table for RDTrackR product management")]
    public class Version0000005 : VersionBase
    {
        public override void Up()
        {
            Create.Table("Products")
                .WithColumn("Sku").AsString(50).NotNullable()
                .WithColumn("Name").AsString(255).NotNullable()
                .WithColumn("Category").AsString(100).NotNullable()
                .WithColumn("UoM").AsString(20).NotNullable()
                .WithColumn("Price").AsDecimal(18, 2).NotNullable().WithDefaultValue(0)
                .WithColumn("ReorderPoint").AsInt32().NotNullable().WithDefaultValue(0)
                .WithColumn("Criticality").AsInt32().NotNullable().WithDefaultValue(2)
                .WithColumn("InitialStockLevel").AsInt32().NotNullable().WithDefaultValue(0)
                .WithColumn("UpdatedAt").AsDateTime().NotNullable()
                .WithColumn("CreatedByUserId").AsInt64().NotNullable()
                    .ForeignKey("FK_Products_CreatedByUser", "Users", "Id")
                .WithColumn("OrganizationId").AsInt64().NotNullable()
                    .ForeignKey("FK_Products_Organization", "Organizations", "Id");

            Create.Index("IX_Products_Sku")
                .OnTable("Products")
                .OnColumn("Sku").Ascending()
                .WithOptions().Unique();

            Create.Index("IX_Products_Name")
                .OnTable("Products")
                .OnColumn("Name").Ascending();
        }
    }
}
