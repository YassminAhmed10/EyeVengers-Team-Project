# Radiology Center: Quick Start Guide

**Time to full system running**: ~15 minutes  
**Last Updated**: April 26, 2026

---

## ⚡ 5-Minute Setup

### Terminal 1: Radiology Backend

```bash
cd RadiologyCenter.Backend.Net
dotnet ef database update --project RadiologyCenter.Infrastructure --startup-project RadiologyCenter.API
dotnet run --project RadiologyCenter.API --urls "https://localhost:7001"
```

✅ **Ready when**: You see "Application started. Press Ctrl+C to shut down."

### Terminal 2: Clinic Backend

```bash
cd backend/EyeClinicAPI/EyeClinicAPI
dotnet ef database update
dotnet run --urls "https://localhost:5201"
```

✅ **Ready when**: Health check returns 200: GET https://localhost:5201/api/health

### Terminal 3: Radiology Frontend

```bash
cd radiology-center-frontend
npm install
npm run dev
```

✅ **Ready when**: You see "http://localhost:5174"

---

## 🧪 Test Immediately

### Copy-Paste to PowerShell

```powershell
# 1. Get token
$token = (Invoke-WebRequest -Uri "http://localhost:7001/fhir/token" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body '{"clientId":"clinic-system","clientSecret":"clinic-secret"}' | ConvertFrom-Json).accessToken

# 2. Create patient
$patientData = @{
    resourceType = "Patient"
    name = @(@{given = @("John"); family = "Doe"})
    birthDate = "1980-01-15"
    gender = "male"
} | ConvertTo-Json

$patient = (Invoke-WebRequest -Uri "http://localhost:7001/fhir/Patient" `
    -Method POST `
    -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/fhir+json"} `
    -Body $patientData | ConvertFrom-Json)

Write-Host "Created patient: $($patient.id)"

# 3. Send scan order from clinic
$scanOrder = @{
    patientId = 1
    scanType = "CT"
    bodyPart = "Head"
    clinicalIndication = "Headache evaluation"
    priority = "Urgent"
    referringDoctorName = "Dr. Smith"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5201/api/radiologyintegration/send-scan-order" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $scanOrder | ConvertFrom-Json

Write-Host "Scan order created: $($response.radiologyOrderId)"
```

---

## 📊 System Health Check

### 1. Backend Endpoints (All should return 200/401/400, not 502/503)

```powershell
# Radiology backend is up
Invoke-WebRequest -Uri "https://localhost:7001/api/health" -SkipCertificateCheck

# Clinic backend is up
Invoke-WebRequest -Uri "https://localhost:5201/api/health"

# FHIR token endpoint responds
Invoke-WebRequest -Uri "http://localhost:7001/fhir/token" -Method OPTIONS -SkipCertificateCheck
```

### 2. Frontend Loads

```
http://localhost:5174
```

Should show React app (not blank/error page)

### 3. Clinic can reach Radiology

Open clinic admin panel at `https://localhost:5201` and test:
```
POST /api/radiologyintegration/send-scan-order
```

---

## 🎯 Common First Steps

### For Clinic Admins
1. Create patient in clinic system
2. Enable "Send to Radiology" button  
3. Submit scan request
4. Monitor status in clinic dashboard
5. View radiology report when ready

### For Radiologists
1. Open http://localhost:5174
2. View incoming scan orders
3. Upload scan images (if applicable)
4. Complete diagnostic report
5. Submit report to FHIR API

### For Developers
1. Check Swagger: https://localhost:7001/swagger
2. Test endpoints manually via Postman/cURL
3. Debug logs: Check terminal output for errors
4. Database: Query via SQL Server Management Studio

---

## 🔧 Configuration Checklist

- [ ] `.env` file exists in `radiology-center-frontend/`
- [ ] `appsettings.json` has RadiologyCenter section in `backend/EyeClinicAPI/`
- [ ] SQL Server LocalDB is running (`sqllocaldb start mssqllocaldb`)
- [ ] Ports 7001, 5201, 5174 are not blocked by firewall
- [ ] .NET 8.0 SDK is installed (`dotnet --version`)
- [ ] Node.js 18+ is installed (`node --version`)

---

## 📋 What Each Component Does

| Component | Port | Purpose | Tech Stack |
|-----------|------|---------|-----------|
| Radiology Backend | 7001 | FHIR R4 API server | ASP.NET Core 8 + EF Core + SQL Server |
| Clinic Backend | 5201 | Clinic system with radiology integration | ASP.NET Core 8 + EF Core + SQL Server |
| Radiology Frontend | 5174 | Radiologist UI | React 18 + Vite + TailwindCSS |

---

## 🚨 Quick Troubleshooting

| Error | Fix |
|-------|-----|
| `Connection refused: localhost:7001` | Radiology backend not running - run Terminal 1 command |
| `CORS error in frontend` | Radiology backend CORS not configured - check Program.cs |
| `Invalid token` | Check credentials in both systems match |
| `Database does not exist` | Run `dotnet ef database update` in both backends |
| `Port already in use` | Another app using port 7001/5201/5174 - close it or change port |

---

## 📈 Next Steps After Verification

1. **Create more test data**: Add 5-10 patients and scan orders
2. **Test clinic → radiology workflow**: Send order from clinic, retrieve result
3. **Test CORS permissions**: Try cross-origin requests from frontend
4. **Load test**: Send 100+ concurrent scan orders
5. **Security test**: Try invalid tokens, wrong credentials
6. **Integration test**: End-to-end patient journey

---

## 💡 Pro Tips

- **Auto-reload frontend**: `npm run dev` already watches files
- **Debug backend**: Add breakpoints in Visual Studio and attach debugger
- **Test database queries**: Use SQL Server Management Studio
- **Monitor tokens**: Add logging in `RadiologyCenterFhirClient.GetToken()`
- **API documentation**: Visit https://localhost:7001/swagger while backend runs

---

**Ready to launch?** Run all three terminals and visit http://localhost:5174 🚀
