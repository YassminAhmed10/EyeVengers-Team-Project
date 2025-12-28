# 👁️ Eye Clinic Management System

## 📋 Project Overview

The Eye Clinic Management System is a comprehensive full-stack web application designed to streamline eye clinic operations. This system enables efficient management of patient records, appointments, medical records (EMR), clinic operations, and finances.

### Team: EyeVengers

---

## 🏗️ Architecture

### Technology Stack

**Backend:**
- **Framework:** ASP.NET Core 8.0 (C#)
- **Database:** SQL Server with Entity Framework Core 8.0
- **Authentication:** JWT Bearer Token Authentication
- **Security:** BCrypt.Net for password hashing
- **API Documentation:** Swagger/OpenAPI

**Frontend:**
- **Framework:** React 18.3.1
- **Build Tool:** Vite 5.4.10
- **UI Libraries:** 
  - Material-UI (MUI) 7.3.6
  - Tailwind CSS 3.4.14
  - Lucide React Icons
- **Routing:** React Router DOM 6.20.0
- **Charts:** Recharts 3.6.0
- **HTTP Client:** Axios 1.13.2
- **Additional:** React Calendar, React DatePicker, Excel export (XLSX)

---

## ✨ Key Features

### 👨‍⚕️ Doctor Portal
- **Dashboard:** Real-time analytics and patient statistics
- **Appointment Management:** View, schedule, and manage appointments
- **Patient Records:** Comprehensive patient management
- **EMR System:** Complete Electronic Medical Records system
- **Analytics:** Gender distribution charts, appointment calendars
- **AI Assistant:** Optical AI assistance for diagnosis support
- **Emergency Cases:** Quick access to urgent patient cases

### 👩‍💼 Receptionist Portal
- **Appointment Booking:** Schedule and manage patient appointments
- **Online Requests:** Handle online appointment requests
- **Patient Registration:** Register new patients
- **Dashboard:** Overview of daily operations
- **Profile Management:** Manage receptionist profile

### 🧑‍🤝‍🧑 Patient Portal
- **Homepage:** Patient-specific dashboard
- **Book Appointments:** Online appointment booking
- **View Appointments:** Check upcoming and past appointments
- **Profile Management:** Update personal information

### 🏥 Clinic Management
- **Equipment Management:** Track and manage clinic equipment
- **Supplies:** Inventory management
- **Maintenance:** Schedule and track maintenance tasks
- **Sanitization:** Hygiene and sanitization tracking
- **Waste Management:** Proper disposal tracking
- **Reports:** Generate clinic operation reports

### 💰 Finance Management
- **Revenue Tracking:** Monitor clinic income
- **Expense Management:** Track operational expenses
- **Financial Reports:** Generate financial analytics

---

## 📁 Project Structure

```
EyeVengers-Team-Project/
├── backend/
│   └── EyeClinicAPI/
│       ├── EyeClinicAPI.sln          # Solution file
│       ├── EyeClinicAPI/
│       │   ├── Program.cs            # Application entry point
│       │   ├── appsettings.json      # Configuration
│       │   ├── Controllers/          # API Controllers
│       │   │   ├── AuthController.cs
│       │   │   ├── DoctorsController.cs
│       │   │   ├── PatientController.cs
│       │   │   ├── AppointmentsController.cs
│       │   │   ├── DashboardController.cs
│       │   │   ├── EMRcontrol/
│       │   │   └── Clinic/
│       │   ├── Models/               # Data models
│       │   │   ├── User.cs
│       │   │   ├── Doctor.cs
│       │   │   ├── Appointment.cs
│       │   │   ├── EMR/
│       │   │   └── Clinic/
│       │   ├── Data/                 # Database context
│       │   ├── DTOs/                 # Data Transfer Objects
│       │   ├── Migrations/           # EF Core migrations
│       │   └── Uploads/              # File uploads
│       ├── Scripts/
│       │   ├── add-test-doctor.ps1
│       │   ├── add-test-users.ps1
│       │   └── fix-issues.ps1
│       └── Documentation/
│           ├── QUICK-START.md
│           ├── TROUBLESHOOTING.md
│           ├── CHECKLIST.md
│           └── CHANGES-SUMMARY.md
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx              # Application entry
        ├── AllProject.jsx        # Main routing component
        ├── App.js
        ├── DoctorDashboard/      # Doctor portal components
        ├── Appointment/          # Receptionist components
        ├── PatientManagement/    # Patient portal
        ├── ClinicsManagement/    # Clinic operations
        ├── EMR/                  # Medical records
        ├── Pages/                # Shared pages
        ├── context/              # React contexts
        │   ├── AuthContext.jsx
        │   └── DarkModeContext.jsx
        ├── services/             # API services
        ├── hooks/                # Custom React hooks
        └── images/               # Static assets
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **npm** or **yarn**
- **.NET SDK 8.0**
- **SQL Server** (LocalDB or full installation)
- **Visual Studio 2022** or **VS Code** (recommended)

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd EyeVengers-Team-Project
```

#### 2. Backend Setup

```bash
cd backend/EyeClinicAPI
```

**Configure Database Connection:**

Edit `appsettings.json` and update the connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=EyeClinicDb;Trusted_Connection=true;TrustServerCertificate=true"
  }
}
```

**Apply Database Migrations:**

```bash
cd EyeClinicAPI
dotnet ef database update
```

**Trust HTTPS Certificate:**

```bash
dotnet dev-certs https --trust
```

**Run the API:**

```bash
dotnet run --launch-profile https
```

The API will be available at:
- HTTPS: `https://localhost:7071`
- HTTP: `http://localhost:5201`
- Swagger UI: `https://localhost:7071/swagger`

#### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at: `http://localhost:5173`

---

## 🔧 Configuration

### Backend Configuration

**JWT Settings** (`appsettings.json`):

```json
{
  "Jwt": {
    "Key": "your-secret-key-here",
    "Issuer": "EyeClinicAPI",
    "Audience": "EyeClinicApp"
  }
}
```

**CORS Policy:**

The API allows requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (React default)
- Additional ports: 5174-5179, 8080

### Frontend Configuration

**API Base URL** (typically in service files):

```javascript
const API_BASE_URL = 'https://localhost:7071/api';
```

---

## 👥 User Roles

The system supports multiple user roles:

1. **Doctor**
   - Full access to patient records and EMR
   - Appointment management
   - Dashboard analytics
   - AI assistant access

2. **Receptionist**
   - Appointment scheduling
   - Patient registration
   - Basic patient information access

3. **Patient**
   - Book appointments
   - View own appointments
   - Access personal health information

4. **Admin**
   - System configuration
   - User management
   - Full system access

---

## 🔐 Authentication

The system uses JWT (JSON Web Token) authentication:

1. User logs in with email and password
2. Server validates credentials and returns JWT token
3. Token is stored in client (localStorage/sessionStorage)
4. All subsequent API requests include the token in headers
5. Server validates token on each request

**Login Endpoint:** `POST /api/Auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "Doctor"
  }
}
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/Auth/register` - Register new user
- `POST /api/Auth/login` - User login

### Doctors
- `GET /api/Doctors` - Get all doctors
- `GET /api/Doctors/{id}` - Get doctor by ID
- `POST /api/Doctors` - Create new doctor
- `PUT /api/Doctors/{id}` - Update doctor
- `DELETE /api/Doctors/{id}` - Delete doctor

### Patients
- `GET /api/Patient` - Get all patients
- `GET /api/Patient/{id}` - Get patient by ID
- `POST /api/Patient` - Register new patient
- `PUT /api/Patient/{id}` - Update patient

### Appointments
- `GET /api/Appointments` - Get all appointments
- `GET /api/Appointments/{id}` - Get appointment by ID
- `POST /api/Appointments` - Create appointment
- `PUT /api/Appointments/{id}` - Update appointment
- `DELETE /api/Appointments/{id}` - Cancel appointment

### Dashboard
- `GET /api/Dashboard/stats` - Get dashboard statistics

### EMR (Electronic Medical Records)
- Various endpoints for managing medical records, prescriptions, diagnoses, etc.

### Clinic Management
- Endpoints for equipment, supplies, maintenance, etc.

---

## 🛠️ Development

### Running Tests

```bash
# Backend tests
cd backend/EyeClinicAPI
dotnet test

# Frontend tests
cd frontend
npm test
```

### Building for Production

**Backend:**
```bash
cd backend/EyeClinicAPI/EyeClinicAPI
dotnet publish -c Release -o ./publish
```

**Frontend:**
```bash
cd frontend
npm run build
```

The production build will be in the `dist/` folder.

---

## 📝 Database Schema

### Main Tables

- **Users** - System users (doctors, receptionists, patients, admins)
- **Doctors** - Doctor-specific information
- **Patients** - Patient records
- **Appointments** - Appointment scheduling
- **DoctorSchedules** - Doctor availability
- **MedicalRecords** - Electronic Medical Records (EMR)
- **Prescriptions** - Medication prescriptions
- **ClinicEquipment** - Equipment inventory
- **ClinicSupplies** - Medical supplies
- **Transactions** - Financial records

---

## 🔄 Database Seeding

The application includes automatic database initialization with seed data.

**Add Test Doctor:**
```powershell
.\add-test-doctor.ps1
```

**Add Test Users:**
```powershell
.\add-test-users.ps1
```

Or use Swagger UI at `https://localhost:7071/swagger`

---

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Errors**
- Ensure SQL Server is running
- Verify connection string in `appsettings.json`
- Run `dotnet ef database update`

**2. HTTPS Certificate Issues**
```bash
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```

**3. CORS Errors**
- Check that frontend port matches CORS configuration in `Program.cs`
- Clear browser cache and restart both servers

**4. Port Already in Use**
- Change port in `launchSettings.json` (backend)
- Change port in `vite.config.js` (frontend)

**5. Migration Issues**
```bash
dotnet ef migrations remove
dotnet ef migrations add InitialCreate
dotnet ef database update
```

For more detailed troubleshooting, see [TROUBLESHOOTING.md](backend/EyeClinicAPI/TROUBLESHOOTING.md)

---

## 📚 Additional Documentation

- [Quick Start Guide](backend/EyeClinicAPI/QUICK-START.md) - Fast setup instructions
- [Changes Summary](backend/EyeClinicAPI/CHANGES-SUMMARY.md) - Recent updates
- [Development Checklist](backend/EyeClinicAPI/CHECKLIST.md) - Development guidelines
- [Arabic README](backend/EyeClinicAPI/README-AR.md) - Arabic documentation

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is part of an academic assignment by the EyeVengers team.

---

## 👨‍💻 Development Team

**Team Name:** EyeVengers

For questions or support, please contact the development team.

---

## 🔗 Quick Links

- **API Documentation:** https://localhost:7071/swagger
- **Frontend Development:** http://localhost:5173
- **Database Migrations:** Located in `backend/EyeClinicAPI/EyeClinicAPI/Migrations/`

---

## 📊 Project Status

This project is actively under development. Features are being continuously added and improved.

### Completed Features ✅
- User authentication and authorization
- Doctor and receptionist portals
- Appointment management system
- Patient registration and management
- Electronic Medical Records (EMR)
- Clinic operations management
- Dashboard analytics
- Dark mode support

### In Progress 🚧
- Advanced reporting features
- Payment integration
- Email notifications
- SMS reminders
- Mobile responsiveness improvements

---

## 🎯 Future Enhancements

- Mobile application (React Native)
- Telemedicine integration
- Advanced analytics and AI insights
- Multi-language support
- Integration with external lab systems
- Automated appointment reminders
- Patient portal mobile app
- Insurance claim processing

---

**Made with ❤️ by the EyeVengers Team**
