// Simple in-memory database for radiology center
// In production, replace with actual database (Firebase, SQL, etc.)

const db = {
  patients: [
    {
      id: "1",
      name: "Ahmed Hassan",
      email: "ahmed@example.com",
      phone: "01012345678",
      age: 45,
      gender: "Male",
      medicalHistory: "No known allergies",
      createdAt: new Date().toISOString()
    },
    {
      id: "2",
      name: "Fatma Mohamed",
      email: "fatma@example.com",
      phone: "01087654321",
      age: 38,
      gender: "Female",
      medicalHistory: "Diabetes Type 2",
      createdAt: new Date().toISOString()
    }
  ],
  appointments: [
    {
      id: "apt-1",
      patientId: "1",
      scanType: "MRI Scan",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: "10:00",
      status: "confirmed",
      notes: "Follow-up MRI",
      createdAt: new Date().toISOString()
    }
  ],
  scanOrders: [
    {
      id: "scan-1",
      patientId: "1",
      scanType: "MRI Scan",
      status: "pending",
      orderedDate: new Date().toISOString(),
      priority: "routine",
      notes: "Brain imaging for headache assessment"
    }
  ],
  reports: [
    {
      id: "report-1",
      scanOrderId: "scan-1",
      patientId: "1",
      radiologistName: "Dr. Smith",
      findings: "No abnormalities detected",
      impression: "Normal study",
      uploadedDate: new Date().toISOString(),
      status: "completed"
    }
  ],
  appointmentSlots: [
    { date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], times: ["09:00", "10:00", "14:00", "15:00"] },
    { date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], times: ["09:00", "11:00", "13:00", "16:00"] },
    { date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], times: ["10:00", "12:00", "14:00", "15:30"] }
  ]
};

export default db;
