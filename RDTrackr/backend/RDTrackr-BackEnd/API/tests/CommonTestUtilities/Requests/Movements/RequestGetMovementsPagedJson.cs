using Bogus;
using RDTrackR.Communication.Enums;
using RDTrackR.Communication.Requests.Movements;

namespace CommonTestUtilities.Requests.Movements
{
    public static class RequestGetMovementsPagedJsonBuilder
    {
        public static RequestGetMovementsPagedJson Build(
            long? warehouseId = null,
            MovementType? type = null,
            DateTime? startDate = null,
            DateTime? endDate = null,
            int? page = null,
            int? pageSize = null)
        {
            return new Faker<RequestGetMovementsPagedJson>()
                .RuleFor(r => r.WarehouseId, _ => 1)
                .RuleFor(r => r.Type, _ => MovementType.INBOUND)
                .RuleFor(r => r.StartDate, _ => startDate)
                .RuleFor(r => r.EndDate, _ => endDate)
                .RuleFor(r => r.Page, f => page ?? 1)
                .RuleFor(r => r.PageSize, f => pageSize ?? 10);
        }
    }
}
