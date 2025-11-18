using FluentMigrator;
using RDTrackR.Infrastructure.Migrations;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.ADD_PRODUCT_REPLENISHMENT_FIELDS)]
    public class Version0000013 : ForwardOnlyMigration
    {
        public override void Up()
        {
            Alter.Table("Products")
                .AddColumn("DailyConsumption").AsDecimal(18, 2).NotNullable().WithDefaultValue(0)
                .AddColumn("LeadTimeDays").AsInt32().NotNullable().WithDefaultValue(0)
                .AddColumn("LastPurchasePrice").AsDecimal(18, 2).NotNullable().WithDefaultValue(0)
                .AddColumn("SafetyStock").AsDecimal(18, 2).NotNullable().WithDefaultValue(0);
        }
    }
}