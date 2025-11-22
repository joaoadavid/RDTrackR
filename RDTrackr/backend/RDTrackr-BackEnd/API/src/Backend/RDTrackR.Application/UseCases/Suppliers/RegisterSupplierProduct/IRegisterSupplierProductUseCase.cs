using RDTrackR.Communication.Requests.Supplier;
using RDTrackR.Communication.Responses.Supplier;

namespace RDTrackR.Application.UseCases.Suppliers.RegisterSupplierProduct
{
    public interface IRegisterSupplierProductUseCase
    {
        Task<ResponseSupplierProductJson> Execute(RequestRegisterSupplierProductJson request);
    }
}