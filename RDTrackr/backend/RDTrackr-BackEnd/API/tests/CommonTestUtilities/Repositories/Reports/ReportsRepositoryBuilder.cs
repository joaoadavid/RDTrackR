using Moq;
using RDTrackR.Domain.Repositories.PurchaseOrders;
using RDTrackR.Domain.Entities;

namespace CommonTestUtilities.Repositories.Reports
{
    public class ReportsRepositoryBuilder
    {
        private readonly Mock<IPurchaseOrderReadOnlyRepository> _read;

        public ReportsRepositoryBuilder()
        {
            _read = new Mock<IPurchaseOrderReadOnlyRepository>();
        }

        public ReportsRepositoryBuilder GetRecent(List<PurchaseOrder> data)
        {
            _read.Setup(r => r.GetRecentAsync(It.IsAny<int>()))
                 .ReturnsAsync(data);
            return this;
        }

        public ReportsRepositoryBuilder GetTotal(decimal value)
        {
            _read.Setup(r => r.GetTotalPurchasedLast30Days())
                 .ReturnsAsync(value);
            return this;
        }

        public ReportsRepositoryBuilder GetPending(int qty)
        {
            _read.Setup(r => r.GetPendingCount())
                 .ReturnsAsync(qty);
            return this;
        }

        public ReportsRepositoryBuilder GetCancel(int qty)
        {
            _read.Setup(r => r.GetCancelCount())
                 .ReturnsAsync(qty);
            return this;
        }

        public ReportsRepositoryBuilder GetTopSuppliers(List<SupplierPurchaseSummary> list)
        {
            _read.Setup(r => r.GetTopSuppliers(It.IsAny<int>()))
                 .ReturnsAsync(list);
            return this;
        }

        public IPurchaseOrderReadOnlyRepository Build() => _read.Object;
    }
}
