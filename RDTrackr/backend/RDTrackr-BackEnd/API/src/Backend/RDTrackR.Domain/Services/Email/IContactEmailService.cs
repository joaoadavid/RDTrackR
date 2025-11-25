namespace RDTrackR.Domain.Services.Email
{
    public interface IContactEmailService
    {
        Task SendContactMessageAsync(string name, string email, string subject, string message);
    }
}
