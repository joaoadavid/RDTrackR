using CommonTestUtilities.Entities;
using CommonTestUtilities.Entities.Movements;
using CommonTestUtilities.Entities.Products;
using CommonTestUtilities.Entities.Warehouses;
using CommonTestUtilities.LoggedUser;
using CommonTestUtilities.Mapper;
using CommonTestUtilities.Repositories.Movements;
using CommonTestUtilities.Requests.Movements;
using RDTrackR.Application.UseCases.Movements.GetAll;
using RDTrackR.Domain.Entities;
using RDTrackR.Exceptions;
using RDTrackR.Exceptions.ExceptionBase;
using Shouldly;

namespace UseCases.Test.Movements
{
    public class GetAllMovementsUseCaseTest
    {
        [Fact]
        public async Task Success()
        {
            (var user, _) = UserBuilder.Build();

            var product = ProductBuilder.Build(10, user);
            var warehouse = WarehouseBuilder.Build(user, 1);

            // Movimentações simuladas retornadas pelo GetPagedAsync
            var movement = MovementBuilder.Build(user, product, warehouse);
            var movements = new List<Movement> { movement };

            var request = RequestGetMovementsPagedJsonBuilder.Build();
            request.WarehouseId = warehouse.Id;

            var useCase = CreateUseCase(user, product, warehouse, movements);

            var result = await useCase.Execute(request);

            result.ShouldNotBeNull();
            result.Items.ShouldNotBeEmpty();
            result.Items.Count.ShouldBe(1);

            // Valida se o mapper transformou corretamente
            result.Items.First().Reference.ShouldBe(movement.Reference);
            result.Items.First().Quantity.ShouldBe(movement.Quantity);

            result.Total.ShouldBe(1);
        }

        private static GetAllMovementsUseCase CreateUseCase(
         RDTrackR.Domain.Entities.User user,
         RDTrackR.Domain.Entities.Product product,
         RDTrackR.Domain.Entities.Warehouse warehouse,
         List<Movement> movements)
        {
            var repo = new MovementRepositoryBuilder()
        .WithProduct(product)
        .WithWarehouse(warehouse)
        .GetPaged(movements, user, warehouseId: warehouse.Id)
        .BuildReadOnly();

            var mapper = MapperBuilder.Build();
            var loggedUser = LoggedUserBuilder.Build(user);

            return new GetAllMovementsUseCase(
                repo,
                loggedUser,
                mapper
            );
        }
    }
}
