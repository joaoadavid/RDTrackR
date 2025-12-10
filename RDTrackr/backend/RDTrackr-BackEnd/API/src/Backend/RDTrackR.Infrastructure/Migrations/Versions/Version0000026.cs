using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.ALTER_ORDERS)]
    public class Version00XX : VersionBase
    {
        public override void Up()
        {
            Alter.Table("Orders")
                .AddColumn("WarehouseId")
                .AsInt64()
                .Nullable();

            Create.ForeignKey("FK_Orders_Warehouses_WarehouseId")
                .FromTable("Orders").ForeignColumn("WarehouseId")
                .ToTable("Warehouses").PrimaryColumn("Id")
                .OnDeleteOrUpdate(System.Data.Rule.None);
        }
    }
}
