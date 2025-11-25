using CommonTestUtilities.Requests.Movements;
using FluentAssertions;
using RDTrackR.Application.UseCases.Movements;

namespace Validors.Test.Movement
{
    public class RegisterMovementValidatorTest
    {
        [Fact]
        public void Success()
        {
            var validator = new MovementValidator();
            var request = RequestRegisterMovementJsonBuilder.Build();
            validator.Validate(request).IsValid.Should().BeTrue();
        }

        [Fact]
        public void Error_Reference_Empty()
        {
            var validator = new MovementValidator();
            var request = RequestRegisterMovementJsonBuilder.Build();
            request.Reference = string.Empty;

            var result = validator.Validate(request);

            result.IsValid.Should().BeFalse();
        }

        [Fact]
        public void Error_Quantity_Zero()
        {
            var validator = new MovementValidator();
            var request = RequestRegisterMovementJsonBuilder.Build(quantity: 0);
            var result = validator.Validate(request);
            result.IsValid.Should().BeFalse();
        }
    }
}
