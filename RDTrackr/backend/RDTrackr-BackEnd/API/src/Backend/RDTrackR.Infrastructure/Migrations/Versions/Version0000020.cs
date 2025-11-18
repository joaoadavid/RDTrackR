using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.ADD_SUPPLIER_PRODUCT)]

    public class Version0000020 : VersionBase
    {
        public override void Up()
        {
            CreateTable("SupplierProducts")
                .WithColumn("SupplierId").AsInt64().NotNullable().ForeignKey("Suppliers", "Id")
                .WithColumn("ProductId").AsInt64().NotNullable().ForeignKey("Products", "Id")
                .WithColumn("UnitPrice").AsDecimal(18, 2).Nullable()
                .WithColumn("SupplierSKU").AsString(100).Nullable()
                .WithColumn("OrganizationId").AsInt64().NotNullable()
                    .ForeignKey("FK_SupplierProducts_Organization", "Organizations", "Id");
        }
    }
}
