using RDTrackR.Communication.Requests.Replenishment;
using RDTrackR.Communication.Responses.Pages;
using RDTrackR.Communication.Responses.Replenishment;

namespace RDTrackR.Application.UseCases.Replenishment.GetAll
{
    public interface IGetReplenishmentItemsUseCase
    {
        //Task<List<ResponseReplenishmentItemJson>> Execute();
        Task<PagedResponse<ResponseReplenishmentItemJson>> Execute(RequestGetReplenishmentPagedJson request);
    }
}