namespace EyeClinicAPI.Models.Clinic
{
    public class Supply
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Quantity { get; set; }
        public int ReorderLevel { get; set; }
        public string Supplier { get; set; }
        public string Unit { get; set; }
        public decimal UnitPrice { get; set; }
        public DateTime LastRestocked { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
