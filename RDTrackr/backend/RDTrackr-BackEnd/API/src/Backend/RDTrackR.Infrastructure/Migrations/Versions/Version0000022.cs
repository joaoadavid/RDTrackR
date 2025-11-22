using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.ADD_DELETE_CASCADE, "Create Orders table")]
    public class Version0000022 : VersionBase
    {
        public override void Up()
        {
            // Remover FK atual
            Delete.ForeignKey("FK_SupplierProducts_ProductId_Products_Id")
                .OnTable("SupplierProducts");

            // Criar novamente com CASCADE
            Create.ForeignKey("FK_SupplierProducts_ProductId_Products_Id")
                .FromTable("SupplierProducts").ForeignColumn("ProductId")
                .ToTable("Products").PrimaryColumn("Id")
                .OnDeleteOrUpdate(System.Data.Rule.Cascade);
        }
    }
}
