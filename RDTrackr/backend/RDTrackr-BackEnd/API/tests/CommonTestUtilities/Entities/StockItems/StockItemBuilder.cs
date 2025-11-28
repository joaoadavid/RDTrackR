using Bogus;
using RDTrackR.Domain.Entities;

namespace CommonTestUtilities.Entities.StockItems
{
    public static class StockItemBuilder
    {
        public static StockItem Build(Product product, Warehouse warehouse, int qty = 50)
        {
            return new Faker<StockItem>()
                .RuleFor(s => s.ProductId, _ => product.Id)
                .RuleFor(s => s.Product, _ => product)
                .RuleFor(s => s.WarehouseId, _ => warehouse.Id)
                .RuleFor(s => s.Warehouse, _ => warehouse)
                .RuleFor(s => s.Quantity, _ => qty)
                .Generate();
        }
    }
}
