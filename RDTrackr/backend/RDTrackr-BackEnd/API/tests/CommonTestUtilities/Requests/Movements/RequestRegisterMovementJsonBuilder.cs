using Bogus;
using RDTrackR.Communication.Requests.Movements;
using RDTrackR.Communication.Enums;
using Bogus.DataSets;

namespace CommonTestUtilities.Requests.Movements
{
    public static class RequestRegisterMovementJsonBuilder
    {
        public static RequestRegisterMovementJson Build(int? quantity = null, MovementType? type = null)
        {
            return new Faker<RequestRegisterMovementJson>()
                .RuleFor(m => m.Reference, f => f.Commerce.ProductName())
                .RuleFor(m => m.ProductId, f => f.Random.Long(1, 50))
                .RuleFor(m => m.WarehouseId, f => f.Random.Long(1, 10))
                .RuleFor(m => m.Type, _ => type ?? MovementType.INBOUND)
                .RuleFor(m => m.Quantity, f => quantity ?? f.Random.Int(1,200));
        }
    }
}
