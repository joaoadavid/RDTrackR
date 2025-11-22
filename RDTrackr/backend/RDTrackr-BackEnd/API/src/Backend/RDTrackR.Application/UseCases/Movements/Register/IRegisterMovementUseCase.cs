using RDTrackR.Communication.Requests.Movements;
using RDTrackR.Communication.Responses.Movements;
using RDTrackR.Domain.Entities;

namespace RDTrackR.Application.UseCases.Movements.Register
{
    public interface IRegisterMovementUseCase
    {
        Task<ResponseMovementJson> Execute(RequestRegisterMovementJson request);
        Task<Movement> RegisterMovementInternal(RequestRegisterMovementJson request, Domain.Entities.User loggedUser);
    }
}