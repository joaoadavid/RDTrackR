using Bogus;
using RDTrackR.Communication.Requests.Replenishment;

namespace CommonTestUtilities.Requests.Replenishment
{
    public static class RequestGeneratePoFromReplenishmentJsonBuilder
    {
        public static RequestGeneratePoFromReplenishmentJson Build()
        {
            return new Faker<RequestGeneratePoFromReplenishmentJson>()
                .RuleFor(r => r.SupplierId, f => f.Random.Long(1, 999))
                .RuleFor(r => r.Items, f => new List<ReplenishmentPoItemJson>
                {
                    new ReplenishmentPoItemJson
                    {
                        ProductId = f.Random.Long(1, 999),
                        Quantity = f.Random.Int(1, 50),
                        UnitPrice = f.Random.Decimal(1, 100)
                    }
                });
        }
    }
}
