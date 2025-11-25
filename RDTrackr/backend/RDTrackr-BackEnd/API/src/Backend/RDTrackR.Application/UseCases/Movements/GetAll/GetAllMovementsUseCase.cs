using AutoMapper;
using RDTrackR.Communication.Requests.Movements;
using RDTrackR.Communication.Responses.Movements;
using RDTrackR.Communication.Responses.Pages;
using RDTrackR.Domain.Enums;
using RDTrackR.Domain.Repositories.Movements;
using RDTrackR.Domain.Services.LoggedUser;

namespace RDTrackR.Application.UseCases.Movements.GetAll
{
    public class GetAllMovementsUseCase : IGetAllMovementsUseCase
    {
        private readonly IMovementReadOnlyRepository _repository;
        private readonly ILoggedUser _loggedUser;
        private readonly IMapper _mapper;

        public GetAllMovementsUseCase(
            IMovementReadOnlyRepository repository,
            ILoggedUser loggedUser,
            IMapper mapper)
        {
            _repository = repository;
            _loggedUser = loggedUser;
            _mapper = mapper;
        }

        //public async Task<List<ResponseMovementJson>> Execute(RequestGetMovementsJson request)
        //{
        //    var loggedUser = await _loggedUser.User();
        //    var type = request.Type.HasValue
        //        ? (RDTrackR.Domain.Enums.MovementType?)(request.Type.Value)
        //        : null;

        //    var movements = await _repository.GetFilteredAsync(
        //        request.WarehouseId,
        //        type,
        //        request.StartDate,
        //        request.EndDate,
        //        loggedUser
        //    );

        //    return _mapper.Map<List<ResponseMovementJson>>(movements);
        //}

        public async Task<PagedResponse<ResponseMovementJson>> Execute(RequestGetMovementsPagedJson request)
        {
            var user = await _loggedUser.User();

            var type = request.Type.HasValue
                ? (MovementType?)request.Type.Value
                : null;

            int page = request.Page <= 0 ? 1 : request.Page;
            int pageSize = request.PageSize <= 0 ? 20 : request.PageSize;

            var result = await _repository.GetPagedAsync(
                request.WarehouseId,
                type,
                request.StartDate,
                request.EndDate,
                user,
                page,
                pageSize
            );

            return new PagedResponse<ResponseMovementJson>
            {
                Items = _mapper.Map<List<ResponseMovementJson>>(result.Items),
                Total = result.Total,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}
