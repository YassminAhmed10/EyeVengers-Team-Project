using Hl7.Fhir.Model;
using EyeClinicAPI.PatientModule.Models;

namespace EyeClinicAPI.PatientModule.Fhir
{
    public class PatientFhirMapper
    {
        public Hl7.Fhir.Model.Patient ToFhir(Models.Patient patient)
        {
            return new Hl7.Fhir.Model.Patient
            {
                Id = patient.Id.ToString(),
                Name = new List<HumanName>
                {
                    new HumanName
                    {
                        Family = patient.LastName,
                        Given = new List<string> { patient.FirstName }
                    }
                },
                Telecom = new List<ContactPoint>
                {
                    new ContactPoint
                    {
                        System = ContactPoint.ContactPointSystem.Phone,
                        Value = patient.Phone
                    },
                    new ContactPoint
                    {
                        System = ContactPoint.ContactPointSystem.Email,
                        Value = patient.Email
                    }
                },
                Gender = patient.Gender.ToLower() == "male"
                    ? AdministrativeGender.Male
                    : AdministrativeGender.Female,
                BirthDate = patient.DateOfBirth.ToString("yyyy-MM-dd"),
                Address = new List<Address>
                {
                    new Address { Text = patient.Address }
                }
            };
        }

        public Models.Patient FromFhir(Hl7.Fhir.Model.Patient fhirPatient)
        {
            return new Models.Patient
            {
                FirstName = fhirPatient.Name?.FirstOrDefault()?.Given?.FirstOrDefault() ?? "",
                LastName = fhirPatient.Name?.FirstOrDefault()?.Family ?? "",
                Phone = fhirPatient.Telecom?.FirstOrDefault(t => t.System == ContactPoint.ContactPointSystem.Phone)?.Value ?? "",
                Email = fhirPatient.Telecom?.FirstOrDefault(t => t.System == ContactPoint.ContactPointSystem.Email)?.Value ?? "",
                Gender = fhirPatient.Gender?.ToString() ?? "",
                Address = fhirPatient.Address?.FirstOrDefault()?.Text ?? "",
                DateOfBirth = DateTime.TryParse(fhirPatient.BirthDate, out var dob) ? dob : DateTime.MinValue,
                NationalId = "",
                InsuranceCompany = "",
                InsuranceId = "",
                EmergencyContactName = "",
                EmergencyContactPhone = "",
                CreatedAt = DateTime.UtcNow
            };
        }
    }
}

