namespace Application.Services;

using SendGrid;
using SendGrid.Helpers.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Domain.Enums;



public class EmailService : IEmailService
{
    private readonly string _apiKey;
    private readonly string _fromName;
    private readonly string _fromEmail;
    private readonly string _templatesPath;

    public EmailService(IConfiguration config)
    {
        _apiKey = config["SendGrid:ApiKey"];
        _fromName = config["SendGrid:FromName"];
        _fromEmail = config["SendGrid:FromEmail"];
        _templatesPath = config["SendGrid:TemplatesPath"];
        Console.WriteLine($"EmailService initialized. ApiKey null: {_apiKey == null}, FromEmail: {_fromEmail}, TemplatesPath: {_templatesPath}");
    }

    // Główna metoda wysyłająca email, przyjmuje typ emaila i dane do szablonu
    private static readonly SemaphoreSlim _rateLimiter = new SemaphoreSlim(1, 1);

private async Task SendAsync(string to, string subject, EmailType type, Dictionary<string, string> placeholders)
{
    try
    {
        if (string.IsNullOrWhiteSpace(to) || !to.Contains('@'))
        {
            Console.WriteLine($"Email skipped — invalid address: '{to}'");
            return;
        }

        await _rateLimiter.WaitAsync();
        try
        {
            var html = LoadTemplate(type, placeholders);
            var client = new SendGridClient(_apiKey);
            var from = new EmailAddress(_fromEmail, _fromName);
            var toAddr = new EmailAddress(to);
            var msg = MailHelper.CreateSingleEmail(from, toAddr, subject, null, html);

            var response = await client.SendEmailAsync(msg);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Body.ReadAsStringAsync();
                Console.WriteLine($"Email failed [{type}] to {to}: {response.StatusCode} — {body}");
            }
            else
            {
                Console.WriteLine($"Email sent [{type}] to {to}");
            }

            await Task.Delay(2000); // 2 sekundy przerwy między emailami, aby nie przekroczyć limitów SendGrid
        }
        finally
        {
            _rateLimiter.Release();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Email exception [{type}] to {ex.Message}");
    }
}

    // Template loader — czyta HTML i zamienia placeholdery
    private string LoadTemplate(EmailType type, Dictionary<string, string> placeholders)
    {
        var fileName = type switch
        {
            EmailType.create_reservation  => "create_reservation.html",
            EmailType.cancel_reservation  => "cancel_reservation.html",
            EmailType.create_object       => "create_object_confirm.html",
            EmailType.edit_object         => "edit_object.html",
            EmailType.delete_object       => "delete_object.html",
            EmailType.registration        => "registration.html",
            EmailType.login               => "login.html",
            EmailType.payment             => "payment.html",
            EmailType.refund              => "refund.html",
            _ => throw new ArgumentOutOfRangeException(nameof(type))
        };

        var path = Path.Combine(_templatesPath, fileName);
        var html = File.ReadAllText(path);

        foreach (var (key, value) in placeholders)
            html = html.Replace($"{{{{{key}}}}}", value);

        return html;
    }

     public Task SendReservationCreatedAsync(string to, string reservationId, DateTime checkIn, DateTime checkOut, decimal total) =>
        SendAsync(to, "Reservation Confirmed", EmailType.create_reservation, new()
        {
            ["ReservationId"] = reservationId.ToString(),
            ["CheckIn"] = checkIn.ToString("MMM dd, yyyy"),
            ["CheckOut"] = checkOut.ToString("MMM dd, yyyy"),
            ["Total"] = total.ToString("C")
        });

    public Task SendReservationCancelledAsync(string to, string reservationId) =>
        SendAsync(to, "Reservation Cancelled", EmailType.cancel_reservation, new()
        {
            ["ReservationId"] = reservationId.ToString()
        });

    public Task SendObjectCreatedAsync(string to, string objectName) =>
        SendAsync(to, "Your listing is live", EmailType.create_object, new()
        {
            ["ObjectName"] = objectName
        });

    public Task SendObjectEditedAsync(string to, string objectName) =>
        SendAsync(to, "Listing updated", EmailType.edit_object, new()
        {
            ["ObjectName"] = objectName
        });

    public Task SendObjectDeletedAsync(string to, string objectName) =>
        SendAsync(to, "Listing removed", EmailType.delete_object, new()
        {
            ["ObjectName"] = objectName
        });

    public Task SendRegistrationAsync(string to, string userName) =>
        SendAsync(to, "Welcome to ZUT Booking", EmailType.registration, new()
        {
            ["UserName"] = userName
        });

    public Task SendLoginAsync(string to, string userName, DateTime loginTime) =>
        SendAsync(to, "New login detected", EmailType.login, new()
        {
            ["UserName"]  = userName,
            ["LoginTime"] = loginTime.ToString("MMM dd, yyyy HH:mm")
        });

    public Task SendPaymentAsync(string to, string paymentId, decimal amount) =>
        SendAsync(to, "Payment Receipt", EmailType.payment, new()
        {
            ["PaymentId"] = paymentId.ToString(),
            ["Amount"]    = amount.ToString("C")
        });

    public Task SendRefundAsync(string to, string paymentId, decimal amount) =>
        SendAsync(to, "Refund Processed", EmailType.refund, new()
        {
            ["PaymentId"] = paymentId.ToString(),
            ["Amount"]    = amount.ToString("C")
        });
}   
