using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Configuration;

namespace EyeClinicAPI.Services
{
    public interface IEmailService
    {
        Task SendWelcomeEmailAsync(string toEmail, string username);
        Task SendLoginEmailAsync(string toEmail, string username);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendWelcomeEmailAsync(string toEmail, string username)
        {
            try
            {
                var smtpSettings = _configuration.GetSection("SmtpSettings");
                var fromEmail = smtpSettings["FromEmail"];
                var fromName = smtpSettings["FromName"];
                var smtpHost = smtpSettings["Host"];
                var smtpPort = int.Parse(smtpSettings["Port"] ?? "587");
                var smtpUser = smtpSettings["Username"];
                var smtpPassword = smtpSettings["Password"];

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(fromName, fromEmail));
                message.To.Add(new MailboxAddress("", toEmail));
                message.Subject = "مرحباً بك! Welcome to Dr Mohab Khairy Eye Clinic 🏥";

                var bodyBuilder = new BodyBuilder { HtmlBody = GetWelcomeEmailBody(username) };
                message.Body = bodyBuilder.ToMessageBody();

                using (var client = new SmtpClient())
                {
                    await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
                    await client.AuthenticateAsync(smtpUser, smtpPassword);
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);
                }

                _logger.LogInformation("✅ Welcome email sent successfully to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Failed to send welcome email to {Email}: {Error}", toEmail, ex.Message);
            }
        }

        private string GetWelcomeEmailBody(string username)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f6f8;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }}
        .header {{
            background: linear-gradient(135deg, #0D47A1 0%, #1976D2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }}
        .content {{
            padding: 40px 30px;
        }}
        .greeting {{
            font-size: 20px;
            color: #0D47A1;
            margin-bottom: 20px;
            font-weight: 600;
        }}
        .message {{
            font-size: 16px;
            margin-bottom: 15px;
            color: #555;
        }}
        .feature-list {{
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }}
        .feature-list h3 {{
            color: #0D47A1;
            margin-top: 0;
            font-size: 18px;
        }}
        .feature-list ul {{
            margin: 10px 0;
            padding-left: 20px;
        }}
        .feature-list li {{
            margin-bottom: 8px;
            color: #555;
        }}
        .footer {{
            background: #f8fafc;
            padding: 20px 30px;
            text-align: center;
            color: #777;
            font-size: 14px;
        }}
        .button {{
            display: inline-block;
            background: linear-gradient(135deg, #0D47A1 0%, #1976D2 100%);
            color: white !important;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 10px;
            font-weight: 600;
            margin: 20px 0;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🏥 Dr Mohab Khairy Eye Clinic</h1>
        </div>
        
        <div class='content'>
            <div class='greeting'>مرحباً بك {username}!</div>
            
            <p class='message'>
                نشكرك على التسجيل في عيادة الدكتور مهاب خيري للعيون. يسعدنا أن نرحب بك في عائلتنا!
            </p>
            
            <p class='message'>
                تم إنشاء حسابك بنجاح ويمكنك الآن تسجيل الدخول والاستمتاع بخدماتنا.
            </p>
            
            <div class='feature-list'>
                <h3>✨ ماذا يمكنك أن تفعل الآن؟</h3>
                <ul>
                    <li>📅 حجز المواعيد أونلاين بسهولة</li>
                    <li>📋 الاطلاع على سجلك الطبي</li>
                    <li>🔔 استقبال تذكيرات بمواعيدك</li>
                    <li>💊 متابعة العلاج والوصفات الطبية</li>
                    <li>📞 التواصل مع العيادة</li>
                </ul>
            </div>
            
            <p class='message'>
                إذا كان لديك أي أسئلة أو تحتاج إلى مساعدة، فلا تتردد في الاتصال بنا.
            </p>
            
            <p class='message' style='margin-top: 30px; color: #0D47A1; font-weight: 600;'>
                نتمنى لك دوام الصحة والعافية! 🌟
            </p>
        </div>
        
        <div class='footer'>
            <p>Dr Mohab Khairy Eye Clinic</p>
            <p>📧 EyeClinic@gmail.com | 📱 +20 XXX XXX XXXX</p>
            <p style='font-size: 12px; margin-top: 15px; color: #999;'>
                هذا البريد الإلكتروني تلقائي، الرجاء عدم الرد عليه مباشرة
            </p>
        </div>
    </div>
</body>
</html>";
        }

        public async Task SendLoginEmailAsync(string toEmail, string username)
        {
            try
            {
                var smtpSettings = _configuration.GetSection("SmtpSettings");
                var fromEmail = smtpSettings["FromEmail"];
                var fromName = smtpSettings["FromName"];
                var smtpHost = smtpSettings["Host"];
                var smtpPort = int.Parse(smtpSettings["Port"] ?? "587");
                var smtpUser = smtpSettings["Username"];
                var smtpPassword = smtpSettings["Password"];

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(fromName, fromEmail));
                message.To.Add(new MailboxAddress("", toEmail));
                message.Subject = "مرحباً بعودتك! 👋 Welcome Back";

                var bodyBuilder = new BodyBuilder { HtmlBody = GetLoginEmailBody(username) };
                message.Body = bodyBuilder.ToMessageBody();

                using (var client = new SmtpClient())
                {
                    await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
                    await client.AuthenticateAsync(smtpUser, smtpPassword);
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);
                }

                _logger.LogInformation("✅ Login notification email sent successfully to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Failed to send login email to {Email}: {Error}", toEmail, ex.Message);
            }
        }

        private string GetLoginEmailBody(string username)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f6f8;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }}
        .header {{
            background: linear-gradient(135deg, #0D47A1 0%, #1976D2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }}
        .content {{
            padding: 40px 30px;
        }}
        .greeting {{
            font-size: 20px;
            color: #0D47A1;
            margin-bottom: 20px;
            font-weight: 600;
        }}
        .message {{
            font-size: 16px;
            margin-bottom: 15px;
            color: #555;
        }}
        .info-box {{
            background: #f0f8ff;
            border-left: 4px solid #0D47A1;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
        }}
        .info-box strong {{
            color: #0D47A1;
        }}
        .footer {{
            background: #f8fafc;
            padding: 20px 30px;
            text-align: center;
            color: #777;
            font-size: 14px;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>👋 مرحباً بعودتك!</h1>
            <p style='margin: 10px 0 0 0; font-size: 18px;'>Welcome Back {username}</p>
        </div>
        
        <div class='content'>
            <div class='greeting'>تم تسجيل دخولك بنجاح ✓</div>
            
            <p class='message'>
                مرحباً بك مجدداً {username}! نحن سعداء برؤيتك.
            </p>
            
            <div class='info-box'>
                <strong>⏰ وقت الدخول:</strong><br>
                {DateTime.Now:dddd, dd MMMM yyyy - HH:mm}
            </div>
            
            <p class='message'>
                يمكنك الآن الوصول إلى:
            </p>
            
            <div class='info-box'>
                📅 حجز ومتابعة المواعيد<br>
                📋 عرض سجلك الطبي<br>
                💊 الوصفات والعلاجات<br>
                📞 التواصل مع العيادة
            </div>
            
            <p class='message'>
                إذا لم تكن أنت من قام بتسجيل الدخول، يرجى تغيير كلمة المرور الخاصة بك على الفور.
            </p>
        </div>
        
        <div class='footer'>
            <p>Dr Mohab Khairy Eye Clinic</p>
            <p>📧 EyeClinic@gmail.com | 📱 +20 XXX XXX XXXX</p>
            <p style='font-size: 12px; margin-top: 15px; color: #999;'>
                هذا البريد الإلكتروني تلقائي، الرجاء عدم الرد عليه مباشرة
            </p>
        </div>
    </div>
</body>
</html>";
        }
    }
}
