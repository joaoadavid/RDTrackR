using Bogus;
using RDTrackR.Domain.Entities;

namespace CommonTestUtilities.Entities.Warehouses
{
    public static class WarehouseBuilder
    {
        public static Warehouse Build(User createdBy, long? id = null)
        {
            var faker = new Faker("pt_BR");

            return new Warehouse
            {
                Id = id ?? faker.Random.Long(1, 9999),
                Name = $"Depósito {faker.Address.City()}",
                Location = $"{faker.Address.StreetAddress()}, {faker.Address.City()} - {faker.Address.StateAbbr()}",
                Capacity = faker.Random.Int(100, 10000),
                Items = faker.Random.Int(0, 500),
                Utilization = faker.Random.Decimal(0, 100),

                CreatedByUserId = createdBy.Id,
                CreatedBy = createdBy,

                Active = true,
                CreatedOn = DateTime.UtcNow,
                StockItems = new List<StockItem>()
            };
        }
    }
}
