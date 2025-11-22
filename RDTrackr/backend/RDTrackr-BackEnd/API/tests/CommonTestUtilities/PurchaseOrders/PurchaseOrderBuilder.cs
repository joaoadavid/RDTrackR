using Bogus;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Enums;

namespace CommonTestUtilities.PurchaseOrders
{
    public static class PurchaseOrderBuilder
    {
        public static PurchaseOrder Build(
    long? supplierId = null,
    long? createdByUserId = null,
    PurchaseOrderStatus status = PurchaseOrderStatus.DRAFT,
    int itemCount = 2,
    long? productId = null)
        {
            var faker = new Faker();

            var order = new PurchaseOrder
            {
                SupplierId = supplierId ?? faker.Random.Long(1, 100),
                WarehouseId = faker.Random.Long(1, 10),
                CreatedByUserId = createdByUserId ?? faker.Random.Long(1, 100),
                Status = status,
                CreatedAt = DateTime.UtcNow,
                Items = new List<PurchaseOrderItem>()
            };

            for (int i = 0; i < itemCount; i++)
            {
                order.Items.Add(new PurchaseOrderItem
                {
                    ProductId = productId ?? faker.Random.Long(1, 1000), // <--- agora alinhado!
                    Quantity = faker.Random.Int(1, 50),
                    UnitPrice = faker.Random.Decimal(5, 500)
                });
            }

            return order;
        }

    }
}
