using Bogus;
using RDTrackR.Communication.Requests.PurchaseOrders;

namespace CommonTestUtilities.Requests.PurchaseOrder
{
    public static class RequestPurchaseOrderJsonBuilder
    {
        public static RequestCreatePurchaseOrderJson Build()
        {
            return new Faker<RequestCreatePurchaseOrderJson>()
                .RuleFor(p => p.Number, f => $"PO-{f.Random.Int(1, 999):000}") // PO-001, PO-154...
                .RuleFor(p => p.SupplierId, f => f.Random.Long(1, 100))
                .RuleFor(p => p.WarehouseId, f => f.Random.Long(1, 100))
                .RuleFor(p => p.Items, f => f.Make(3, () => new RequestCreatePurchaseOrderItemJson
                {
                    ProductId = f.Random.Long(1, 100),
                    Quantity = f.Random.Int(1, 20),
                    UnitPrice = f.Random.Decimal(5, 500)
                }))
                .Generate();

        }
    }
}
