using Moq;
using RDTrackR.Application.UseCases.PurchaseOrders.Register;
using RDTrackR.Communication.Requests.PurchaseOrders;
using RDTrackR.Communication.Responses.PurchaseOrders;

namespace CommonTestUtilities.PurchaseOrders
{
    public class RegisterPurchaseOrderUseCaseBuilder
    {
        private readonly Mock<IRegisterPurchaseOrderUseCase> _mock = new();

        public RegisterPurchaseOrderUseCaseBuilder Execute(ResponsePurchaseOrderJson response)
        {
            _mock.Setup(p => p.Execute(It.IsAny<RequestCreatePurchaseOrderJson>()))
                 .ReturnsAsync(response);
            return this;
        }

        public IRegisterPurchaseOrderUseCase Build() => _mock.Object;
        public Mock<IRegisterPurchaseOrderUseCase> BuildMock() => _mock;
    }
}
