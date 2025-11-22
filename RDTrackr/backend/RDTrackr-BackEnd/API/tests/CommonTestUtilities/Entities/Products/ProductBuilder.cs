using Bogus;
using RDTrackR.Domain.Entities;

namespace CommonTestUtilities.Entities.Products
{
    public static class ProductBuilder
    {
        public static Product Build(long? id = null, User? createdBy = null, int? stockQuantity = null)
        {
            var faker = new Faker("pt_BR");

            createdBy ??= UserBuilder.Build().Item1;

            // Gera quantidade total DESEJADA para facilitar cenários de teste
            var quantity = stockQuantity ?? faker.Random.Int(0, 300);

            // Cria um único StockItem (ou você pode criar vários e distribuir quantidades)
            var stockItem = new StockItem
            {
                ProductId = id ?? faker.Random.Long(1, 9999),
                WarehouseId = faker.Random.Long(1, 10),
                Quantity = quantity,
                OrganizationId = createdBy.OrganizationId,
                CreatedByUserId = createdBy.Id,
                UpdatedAt = DateTime.UtcNow,
                Active = true,
                CreatedOn = DateTime.UtcNow
            };

            var productId = id ?? faker.Random.Long(1, 9999);

            return new Product
            {
                Id = productId,
                Sku = faker.Commerce.Ean13(),
                Name = faker.Commerce.ProductName(),
                Category = faker.Commerce.Categories(1)[0],
                UoM = "UN",
                Price = faker.Random.Decimal(5, 500),
                StockItems = new List<StockItem> { stockItem },
                ReorderPoint = faker.Random.Int(5, 50),
                DailyConsumption = faker.Random.Decimal(1, 20),
                LeadTimeDays = faker.Random.Int(1, 15),
                SafetyStock = faker.Random.Decimal(5, 60),
                LastPurchasePrice = faker.Random.Decimal(3, 450),

                OrganizationId = createdBy.OrganizationId,
                UpdatedAt = DateTime.UtcNow,
                CreatedOn = DateTime.UtcNow,
                CreatedByUserId = createdBy.Id,
                CreatedBy = createdBy,
                Active = true
            };
        }
    }
}
