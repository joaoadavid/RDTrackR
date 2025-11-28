using Bogus;
using RDTrackR.Communication.Requests.StockItem;

namespace CommonTestUtilities.Requests.StockItem
{
    public static class RequestRegisterStockItemJsonBuilder
    {
        public static RequestRegisterStockItemJson Build(
            long? productId = null,
            long? warehouseId = null,
            int? quantity = null)
        {
            return new Faker<RequestRegisterStockItemJson>()
                .RuleFor(s => s.ProductId, f => productId ?? f.Random.Long(1, 9999))
                .RuleFor(s => s.WarehouseId, f => warehouseId ?? f.Random.Long(1, 9999))
                .RuleFor(s => s.Quantity, f => quantity ?? f.Random.Int(1, 200))
                .Generate();
        }
    }
}
