using FluentMigrator;
using System.Diagnostics.Metrics;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.ALTER_CREATEDON)]
    public class Version0000024 : VersionBase
    {
        public override void Up()
        {
            // Todas as tabelas do seu projeto
            string[] tables =
            {
                "AuditLogs",
                "CodeToPerformActions",
                "Movements",
                "Notifications",
                "OrderItems",
                "Orders",
                "Organizations",
                "Products",
                "PurchaseOrderItems",
                "PurchaseOrders",
                "RefreshTokens",
                "StockItems",
                "SupplierProducts",
                "Suppliers",
                "Users",
                "Warehouses"
            };

            foreach (var table in tables)
            {
                if (Schema.Table(table).Column("CreatedOn").Exists())
                {
                    Alter.Table(table)
                        .AlterColumn("CreatedOn").AsDateTime2().NotNullable();
                }
            }
        }
    }
}
