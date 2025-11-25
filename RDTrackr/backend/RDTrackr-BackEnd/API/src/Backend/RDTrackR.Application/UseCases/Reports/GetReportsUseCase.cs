using AutoMapper;
using RDTrackR.Communication.Responses.Reports;
using RDTrackR.Domain.Repositories.PurchaseOrders;

namespace RDTrackR.Application.UseCases.Reports
{
    public class GetReportsUseCase : IGetReportsUseCase
    {
        private readonly IPurchaseOrderReadOnlyRepository _repo;
        private readonly IMapper _mapper;

        public GetReportsUseCase(IPurchaseOrderReadOnlyRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<ResponseReportsJson> Execute()
        {
            var recent = await _repo.GetRecentAsync(30);
            var totalValue = await _repo.GetTotalPurchasedLast30Days();
            var pending = await _repo.GetPendingCount();
            var cancel = await _repo.GetCancelCount();
            var topSuppliers = await _repo.GetTopSuppliers(5);

            return new ResponseReportsJson
            {
                TotalPurchaseOrders = recent.Count,
                TotalValuePurchased = totalValue,
                PendingPurchaseOrders = pending,
                CancelPurchaseOrders = cancel,
                RecentOrders = _mapper.Map<List<ResponseRecentPurchaseOrderJson>>(recent),
                TopSuppliers = topSuppliers.Select(s => new ResponseTopSupplierJson
                {
                    SupplierName = s.SupplierName,
                    TotalPurchased = s.TotalPurchased
                }).ToList()
            };
        }
    }
}
