using FluentMigrator;

namespace RDTrackR.Infrastructure.Migrations.Versions
{
    [Migration(DatabaseVersions.ADD_ORDERS, "Create Orders table")]
    public class Version0000021 : VersionBase
    {
        public override void Up()
        {
            CreateTable("Orders")
                .WithColumn("OrderNumber").AsString(50).NotNullable()
                .WithColumn("CustomerId").AsInt64().NotNullable()
                .WithColumn("CustomerName").AsString(200).NotNullable()
                .WithColumn("Status").AsInt32().NotNullable()
                .WithColumn("Total").AsDecimal(18, 2).NotNullable().WithDefaultValue(0)
                .WithColumn("CreatedByUserId").AsInt64().NotNullable().ForeignKey("Users", "Id")
                .WithColumn("OrganizationId").AsInt64().NotNullable()
                    .ForeignKey("FK_Orders_Organization", "Organizations", "Id");


            CreateTable("OrderItems")
                .WithColumn("OrderId").AsInt64().NotNullable().ForeignKey("Orders", "Id")
                .WithColumn("ProductId").AsInt64().NotNullable().ForeignKey("Products", "Id")
                .WithColumn("ProductName").AsString(200).NotNullable()
                .WithColumn("Quantity").AsInt32().NotNullable()
                .WithColumn("Price").AsDecimal(18, 2).NotNullable()
                .WithColumn("Total").AsDecimal(18, 2).NotNullable()
                .WithColumn("OrganizationId").AsInt64().NotNullable()
                    .ForeignKey("FK_OrderItems_Organization", "Organizations", "Id");
        }
    }
}
