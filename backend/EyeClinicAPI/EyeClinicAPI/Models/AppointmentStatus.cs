namespace EyeClinicAPI.Models
{
    public enum AppointmentStatus
    {
        Upcoming = 0,      // موعد قادم
        Completed = 1,     // موعد مكتمل
        Cancelled = 2,     // موعد ملغي
        InProgress = 3,    // موعد جاري
        NoShow = 4         // المريض لم يحضر
    }
}