using RDTrackR.Communication.Requests.Movements;
using RDTrackR.Communication.Responses.Movements;
using RDTrackR.Communication.Responses.Pages;

namespace RDTrackR.Application.UseCases.Movements.GetAll
{
    public interface IGetAllMovementsUseCase
    {
        //Task<List<ResponseMovementJson>> Execute(RequestGetMovementsJson request);
        Task<PagedResponse<ResponseMovementJson>> Execute(RequestGetMovementsPagedJson request);
    }
}