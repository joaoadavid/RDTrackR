using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.ALTER_PURCHASE_ORDERS_NUMBER_TO_IDENTITY)]
    public class Version0000016: VersionBase
    {
        public override void Up()
        {
            // 1) Remover a coluna antiga (string)
            Alter.Table("PurchaseOrders")
                .AlterColumn("Number").AsInt32().NotNullable();

            // 2) Criar sequência (para autonumeração)
            Execute.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.sequences WHERE name = 'PurchaseOrderNumberSeq')
                CREATE SEQUENCE PurchaseOrderNumberSeq
                AS INT
                START WITH 1
                INCREMENT BY 1;
            ");

            // 3) Aplicar default usando a Sequence
            Execute.Sql(@"
                ALTER TABLE PurchaseOrders
                ADD CONSTRAINT DF_PurchaseOrders_Number
                DEFAULT (NEXT VALUE FOR PurchaseOrderNumberSeq) FOR Number;
            ");
        }
    }
}
