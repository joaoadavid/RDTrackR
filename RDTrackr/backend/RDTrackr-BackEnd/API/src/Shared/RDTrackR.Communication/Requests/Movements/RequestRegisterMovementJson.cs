using RDTrackR.Communication.Enums;
namespace RDTrackR.Communication.Requests.Movements
{
    public class RequestRegisterMovementJson
    {
        public string Reference { get; set; } = null!;
        public long ProductId { get; set; }
        public long WarehouseId { get; set; }
        public MovementType Type { get; set; }
        public int Quantity { get; set; }
    }

}
