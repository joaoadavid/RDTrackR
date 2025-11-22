using RDTrackR.Communication.Requests.Supplier;
using RDTrackR.Communication.Responses.Supplier;

namespace RDTrackR.Application.UseCases.Suppliers.UpdateSupplierProduct
{
    public interface IUpdateSupplierProductUseCase
    {
        Task<ResponseSupplierProductJson> Execute(RequestUpdateSupplierProductJson request);
    }

}
