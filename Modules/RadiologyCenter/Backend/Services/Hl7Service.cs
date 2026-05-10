using System.Net.Sockets;
using System.Text;
using RadiologyCenterAPI.DTOs;
using RadiologyCenterAPI.Models;

namespace RadiologyCenterAPI.Services
{
    public interface IHl7Service
    {
        string BuildOrmO01(ParsedBookingRequest req, string orderControlId);
        Task<string> SendAsync(string hl7Message);
    }

    public class Hl7Service : IHl7Service
    {
        private readonly IConfiguration _config;
        private readonly ILogger<Hl7Service> _logger;
        private const byte StartBlock = 0x0B;
        private const byte EndBlock = 0x1C;
        private const byte CarriageReturn = 0x0D;

        public Hl7Service(IConfiguration config, ILogger<Hl7Service> logger)
        {
            _config = config;
            _logger = logger;
        }

        public string BuildOrmO01(ParsedBookingRequest req, string orderControlId)
        {
            var now = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var msgId = $"MSG{DateTime.UtcNow.Ticks}";

            var sb = new StringBuilder();
            sb.Append($"MSH|^~\\&|EYECLINIC|CLINIC|RIS|RADCTR|{now}||ORM^O01|{msgId}|P|2.5\r");

            var p = req.Patient;
            var birth = p.BirthDate?.ToString("yyyyMMdd") ?? "";
            var gender = p.Gender?.ToUpperInvariant() switch
            {
                "MALE" or "M" => "M",
                "FEMALE" or "F" => "F",
                _ => "U"
            };
            sb.Append($"PID|1||{p.Identifier}^^^EYECLINIC^MR||{p.LastName}^{p.FirstName}||{birth}|{gender}|||{p.Address ?? ""}||{p.Phone ?? ""}|||||||\r");
            sb.Append($"PV1|1|O|RAD^^^RADCTR||||{req.ServiceRequest.PractitionerRef}\r");

            var startTime = req.Appointment.Start.ToString("yyyyMMddHHmmss");
            var endTime = req.Appointment.End.ToString("yyyyMMddHHmmss");
            sb.Append($"ORC|NW|{orderControlId}|||||^^^{startTime}^{endTime}||{now}|||{req.ServiceRequest.PractitionerRef}\r");

            var priority = req.ServiceRequest.Priority.ToUpperInvariant() switch
            {
                "URGENT" or "STAT" => "S",
                _ => "R"
            };
            var notes = (req.ServiceRequest.Notes ?? "").Replace("|", " ").Replace("\r", " ");
            sb.Append($"OBR|1|{orderControlId}||{req.ServiceRequest.Code}^{req.ServiceRequest.Display}^LN|{priority}||{startTime}||||||{notes}||||{req.ServiceRequest.PractitionerRef}\r");

            var hl7 = sb.ToString();

            // BIG VISIBLE LOG — show the HL7 message in the backend console
            var separator = new string('=', 80);
            _logger.LogInformation($"\n{separator}\n  HL7 v2.5 ORM^O01 MESSAGE BUILT (Order: {orderControlId})\n{separator}\n{hl7.Replace("\r", "\n")}\n{separator}\n");

            return hl7;
        }

        public async Task<string> SendAsync(string hl7Message)
        {
            var host = _config["RIS:Host"] ?? "127.0.0.1";
            var port = int.Parse(_config["RIS:Port"] ?? "2575");
            var timeoutMs = int.Parse(_config["RIS:TimeoutMs"] ?? "5000");
            var simulate = bool.Parse(_config["RIS:Simulate"] ?? "true");

            if (simulate)
            {
                var separator = new string('-', 80);
                _logger.LogInformation("\n{Sep}\n  HL7 SIMULATION MODE — message NOT sent to real RIS\n  In production it would be sent to {Host}:{Port} via MLLP\n{Sep}",
                    separator, host, port, separator);

                await Task.Delay(50);
                var ack = BuildSimulatedAck(hl7Message);

                _logger.LogInformation("\n{Sep}\n  SIMULATED ACK^O01 RECEIVED FROM RIS\n{Sep}\n{Ack}{Sep}\n",
                    separator, separator, ack.Replace("\r", "\n"), separator);

                return ack;
            }

            try
            {
                using var client = new TcpClient();
                var connectTask = client.ConnectAsync(host, port);
                if (await Task.WhenAny(connectTask, Task.Delay(timeoutMs)) != connectTask)
                    throw new RisOfflineException();

                using var stream = client.GetStream();
                stream.ReadTimeout = timeoutMs;
                stream.WriteTimeout = timeoutMs;

                var bytes = Encoding.UTF8.GetBytes(hl7Message);
                var framed = new byte[bytes.Length + 3];
                framed[0] = StartBlock;
                Array.Copy(bytes, 0, framed, 1, bytes.Length);
                framed[bytes.Length + 1] = EndBlock;
                framed[bytes.Length + 2] = CarriageReturn;

                _logger.LogInformation("Sending HL7 message to RIS at {Host}:{Port}", host, port);
                await stream.WriteAsync(framed);

                var buffer = new byte[4096];
                var read = await stream.ReadAsync(buffer);
                var ack = Encoding.UTF8.GetString(buffer, 0, read);

                _logger.LogInformation("ACK from RIS:\n{Ack}", ack.Replace("\r", "\n"));

                if (ack.Contains("|AE|") || ack.Contains("|AR|"))
                    throw new Hl7RejectedException("RIS rejected the order: " + ack);

                return ack;
            }
            catch (SocketException)
            {
                throw new RisOfflineException();
            }
        }

        private string BuildSimulatedAck(string originalMsg)
        {
            var firstLine = originalMsg.Split('\r').FirstOrDefault() ?? "";
            var fields = firstLine.Split('|');
            var msgId = fields.Length > 9 ? fields[9] : "UNKNOWN";
            var now = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            return $"MSH|^~\\&|RIS|RADCTR|EYECLINIC|CLINIC|{now}||ACK^O01|ACK{msgId}|P|2.5\rMSA|AA|{msgId}|Order accepted\r";
        }
    }
}