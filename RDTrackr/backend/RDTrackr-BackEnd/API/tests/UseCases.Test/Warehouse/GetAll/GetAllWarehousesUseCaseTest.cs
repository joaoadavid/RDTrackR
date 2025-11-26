using CommonTestUtilities.Entities;
using CommonTestUtilities.Entities.Warehouses;
using CommonTestUtilities.LoggedUser;
using CommonTestUtilities.Mapper;
using CommonTestUtilities.Repositories.Warehouses;
using RDTrackR.Application.UseCases.Warehouses.GetAll;
using RDTrackR.Communication.Requests.Warehouse;
using Shouldly;

namespace UseCases.Test.Warehouse.GetAll
{
    public class GetAllWarehousesUseCaseTest
    {
        [Fact]
        public async Task Success()
        {
            // Arrange
            var (user, _) = UserBuilder.Build();
            var loggedUser = LoggedUserBuilder.Build(user);

            var warehouse1 = WarehouseBuilder.Build(user);
            var warehouse2 = WarehouseBuilder.Build(user);

            var warehouses = new List<RDTrackR.Domain.Entities.Warehouse>
            {
                warehouse1,
                warehouse2
            };

            var repo = new WarehouseRepositoryBuilder()
                .WithList(user, warehouses);

            var mapper = MapperBuilder.Build();

            var useCase = new GetAllWarehousesUseCase(
                repo.BuildRead(),
                loggedUser,
                mapper
            );

            var request = new RequestGetWarehousesPagedJson
            {
                Page = 1,
                PageSize = 10,
                Search = null
            };

            // Act
            var result = await useCase.Execute(request);

            // Assert
            result.ShouldNotBeNull();
            result.Total.ShouldBe(2);
            result.Items.Count.ShouldBe(2);

            result.Items[0].Name.ShouldBe(warehouse2.Name);
            result.Items[1].Name.ShouldBe(warehouse1.Name);
        }
    }
}
