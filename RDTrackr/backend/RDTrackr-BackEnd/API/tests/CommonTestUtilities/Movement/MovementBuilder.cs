using Bogus;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Enums;

namespace CommonTestUtilities.Entities.Movements
{
    public static class MovementBuilder
    {
        public static Movement Build(
            User user,
            Product product,
            Warehouse warehouse,
            MovementType type = MovementType.INBOUND,
            int? quantity = null)
        {
            return new Faker<Movement>()
                .RuleFor(m => m.Id, f => f.Random.Long(1, 999999))
                .RuleFor(m => m.Reference, f => f.Commerce.ProductName())
                .RuleFor(m => m.OrganizationId, _ => user.OrganizationId)
                .RuleFor(m => m.Organization, _ => user.Organization)
                .RuleFor(m => m.ProductId, _ => product.Id)
                .RuleFor(m => m.Product, _ => product)
                .RuleFor(m => m.WarehouseId, _ => warehouse.Id)
                .RuleFor(m => m.Warehouse, _ => warehouse)
                .RuleFor(m => m.Type, _ => type)
                .RuleFor(m => m.Quantity, f => quantity ?? f.Random.Int(1, 200))
                .RuleFor(m => m.CreatedByUserId, _ => user.Id)
                .RuleFor(m => m.CreatedBy, _ => user)
                .RuleFor(m => m.CreatedOn, f => f.Date.Recent().ToUniversalTime())
                .Generate();
        }
    }
}
