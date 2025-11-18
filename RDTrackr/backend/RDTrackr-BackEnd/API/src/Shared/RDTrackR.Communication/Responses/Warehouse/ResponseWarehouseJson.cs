namespace RDTrackR.Communication.Responses.Warehouse
{
    public class ResponseWarehouseJson
    {
        public long Id { get; set; }
        public string Name { get; set; } = null!;
        public string Location { get; set; } = null!;
        public int Capacity { get; set; }
        public int Items { get; set; }
        public decimal Utilization { get; set; }
        public DateTime CreatedAt { get; set; }

        public long CreatedByUserId { get; set; }
        public string CreatedByName { get; set; } = null!;

        public long? UpdatedByUserId { get; set; }
        public string? UpdatedByName { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

}
