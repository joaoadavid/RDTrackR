namespace RDTrackR.Communication.Responses.Movements
{
    public class ResponseMovementJson
    {
        public long Id { get; set; }
        public string Reference { get; set; } = null!;
        public string Product { get; set; } = null!;
        public string Warehouse { get; set; } = null!;
        public string Type { get; set; } = null!;
        public int Quantity { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedByName { get; set; } = null!;
    }

}
