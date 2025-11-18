using AutoMapper;
using RDTrackR.Communication.Requests.Warehouse;
using RDTrackR.Communication.Responses.Warehouse;
using RDTrackR.Domain.Entities;
using RDTrackR.Domain.Repositories;
using RDTrackR.Domain.Repositories.Warehouses;
using RDTrackR.Domain.Services.LoggedUser;
using RDTrackR.Exceptions.ExceptionBase;

namespace RDTrackR.Application.UseCases.Warehouses.Register
{
    public class RegisterWarehouseUseCase : IRegisterWarehouseUseCase
    {
        private readonly IWarehouseWriteOnlyRepository _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILoggedUser _loggedUser;
        private readonly IMapper _mapper;

        public RegisterWarehouseUseCase(
            IWarehouseWriteOnlyRepository repository,
            IUnitOfWork unitOfWork,
            ILoggedUser loggedUser,
            IMapper mapper)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _loggedUser = loggedUser;
            _mapper = mapper;
        }

        public async Task<ResponseWarehouseJson> Execute(RequestRegisterWarehouseJson request)
        {
            await Validate(request);

            var loggedUser = await _loggedUser.User();

            var warehouse = _mapper.Map<Domain.Entities.Warehouse>(request);
            warehouse.CreatedByUserId = loggedUser.Id;
            warehouse.OrganizationId = loggedUser.OrganizationId;
            warehouse.Utilization = request.Capacity == 0 ? 0 : ((decimal)request.Items / request.Capacity) * 100;
            warehouse.CreatedOn = DateTime.UtcNow;
            warehouse.Active = true;

            await _repository.AddAsync(warehouse);
            await _unitOfWork.Commit();

            warehouse.CreatedBy = loggedUser;

            return _mapper.Map<ResponseWarehouseJson>(warehouse);
        }

        private async Task Validate(RequestRegisterWarehouseJson request)
        {
            var validator = new WarehouseValidator();
            var result = await validator.ValidateAsync(request);

            if (!result.IsValid)
            {
                throw new ErrorOnValidationException(result.Errors.Select(e => e.ErrorMessage).ToList());
            }
        }
    }
}
