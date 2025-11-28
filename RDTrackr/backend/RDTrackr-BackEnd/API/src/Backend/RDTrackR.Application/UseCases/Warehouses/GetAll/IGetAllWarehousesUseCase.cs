using RDTrackR.Communication.Requests.Warehouse;
using RDTrackR.Communication.Responses.Pages;
using RDTrackR.Communication.Responses.Warehouse;

namespace RDTrackR.Application.UseCases.Warehouses.GetAll
{
    public interface IGetAllWarehousesUseCase
    {
        Task<PagedResponse<ResponseWarehouseJson>> Execute(RequestGetWarehousesPagedJson request);
    }
}