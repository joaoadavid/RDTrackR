namespace RDTrackR.Application.UseCases.Suppliers.DeleteSupplierProduct
{
    public interface IDeleteSupplierProductUseCase
    {
        Task Execute(long supplierId, long productId);
    }

}
