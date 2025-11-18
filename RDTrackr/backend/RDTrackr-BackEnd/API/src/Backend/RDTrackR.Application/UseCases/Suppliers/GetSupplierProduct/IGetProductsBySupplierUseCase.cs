using RDTrackR.Communication.Responses.Supplier;

namespace RDTrackR.Application.UseCases.Suppliers.GetSupplierProduct
{
    public interface IGetProductsBySupplierUseCase
    {
        Task<IEnumerable<ResponseSupplierProductJson>> Execute(long supplierId);
    }
}