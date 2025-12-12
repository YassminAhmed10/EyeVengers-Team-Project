# ?? ????? ????? - Quick Commands

## ? ????? ?????? (Quick Start)

### 1. ????? ?? ??? ????????:
```powershell
.\fix-issues.ps1
```

### 2. ????? API:
```bash
cd EyeClinicAPI
dotnet run --launch-profile https
```

### 3. ????? Frontend:
```bash
cd frontend
npm run dev
```

---

## ?? Database Commands

### ????? Migrations:
```bash
cd EyeClinicAPI
dotnet ef database update
```

### ????? Migration ????:
```bash
dotnet ef migrations add MigrationName
```

### ??? ??? Migration:
```bash
dotnet ef migrations remove
```

### ??? Database ??????:
```bash
dotnet ef database drop
dotnet ef database update
```

---

## ?? HTTPS Certificate

### ????? Certificate:
```bash
dotnet dev-certs https --trust
```

### ????? ????? Certificate:
```bash
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```

---

## ?? Package Management

### Backend (NuGet):
```bash
dotnet restore
dotnet add package PackageName
dotnet remove package PackageName
```

### Frontend (npm):
```bash
npm install
npm install package-name
npm uninstall package-name
```

---

## ??? Build Commands

### Backend:
```bash
cd EyeClinicAPI
dotnet clean
dotnet build
dotnet build --no-restore
dotnet run
dotnet watch run  # Auto-reload
```

### Frontend:
```bash
cd frontend
npm run build
npm run preview
```

---

## ?? Testing API

### ???????? PowerShell:
```powershell
# Get Doctors
Invoke-RestMethod -Uri https://localhost:7071/api/Doctors

# Get Stats
Invoke-RestMethod -Uri https://localhost:7071/api/Dashboard/Stats

# Add Doctor
$doctor = @{
    fullName = "Dr. Test"
    specialization = "Eye Doctor"
    phoneNumber = "123456"
    email = "test@test.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri https://localhost:7071/api/Doctors `
    -Method Post `
    -Body $doctor `
    -ContentType "application/json"
```

### ???????? curl:
```bash
# Get Doctors
curl https://localhost:7071/api/Doctors -k

# Get Stats
curl https://localhost:7071/api/Dashboard/Stats -k

# Add Doctor
curl -X POST https://localhost:7071/api/Doctors -k `
  -H "Content-Type: application/json" `
  -d '{
    "fullName": "Dr. Test",
    "specialization": "Eye Doctor",
    "phoneNumber": "123456",
    "email": "test@test.com"
  }'
```

---

## ??? SQL Commands

### ??????? ?????? ????????:
```sql
USE EyeClinicDB;
```

### ??? ???? Doctors:
```sql
SELECT * FROM Doctors;
```

### ??? ???? Appointments:
```sql
SELECT * FROM Appointments;
```

### ??? Appointments ?? Doctor:
```sql
SELECT 
    a.AppointmentId,
    a.PatientName,
    a.PatientId,
    a.Phone,
    a.Email,
    a.AppointmentDate,
    a.AppointmentTime,
    d.FullName AS DoctorName
FROM Appointments a
JOIN Doctors d ON a.DoctorId = d.DoctorId;
```

### ??? ???? Appointments:
```sql
DELETE FROM Appointments;
```

### ??? ???? Doctors:
```sql
DELETE FROM Doctors;
```

---

## ?? Cleanup Commands

### ????? ???? ?????? API:
```powershell
Get-Process -Name "EyeClinicAPI" | Stop-Process -Force
Get-Process -Name "dotnet" | Stop-Process -Force
```

### ????? Build outputs:
```bash
cd EyeClinicAPI
dotnet clean
Remove-Item -Recurse -Force bin, obj
```

### ????? node_modules:
```bash
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
```

---

## ?? Debugging Commands

### ??? ???? Processes:
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*dotnet*"}
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

### ??? Port 7071:
```powershell
Get-NetTCPConnection -LocalPort 7071
```

### ??? Process ??? Port ????:
```powershell
$port = 7071
Get-NetTCPConnection -LocalPort $port | 
    Select-Object -ExpandProperty OwningProcess | 
    ForEach-Object { Stop-Process -Id $_ -Force }
```

---

## ?? Logs & Monitoring

### ??? Logs:
```bash
# ?? ???? API
dotnet run --verbosity detailed
```

### Monitor File Changes:
```bash
# Backend
cd EyeClinicAPI
dotnet watch run

# Frontend
cd frontend
npm run dev
```

---

## ?? Quick Tests

### Test 1: API Running?
```powershell
try {
    Invoke-RestMethod -Uri https://localhost:7071/api/Doctors
    Write-Host "? API is running" -ForegroundColor Green
} catch {
    Write-Host "? API is not running" -ForegroundColor Red
}
```

### Test 2: Database Connected?
```powershell
cd EyeClinicAPI
dotnet ef database update --verbose
```

### Test 3: Frontend Building?
```bash
cd frontend
npm run build
```

---

## ?? Git Commands

### Basic:
```bash
git status
git add .
git commit -m "message"
git push origin DashboardY
```

### Undo changes:
```bash
git checkout -- filename
git reset --hard HEAD
```

### View changes:
```bash
git diff
git log --oneline
```

---

## ?? Reset Everything

### ??????? ?? ???? ??????:
```powershell
# 1. Stop all processes
Get-Process -Name "EyeClinicAPI","dotnet","node" -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Clean backend
cd EyeClinicAPI
dotnet clean
Remove-Item -Recurse -Force bin, obj

# 3. Clean frontend
cd ..\frontend
Remove-Item -Recurse -Force node_modules, dist

# 4. Reset database
cd ..\EyeClinicAPI
dotnet ef database drop -f
dotnet ef database update

# 5. Reinstall everything
dotnet restore
cd ..\frontend
npm install

# 6. Run fix script
cd ..
.\fix-issues.ps1
```

---

## ?? Development Workflow

### ??????? ??????:
```bash
# ??????
git pull origin DashboardY
cd EyeClinicAPI && dotnet restore
cd ../frontend && npm install

# ????? ??????? (Terminal 1)
cd EyeClinicAPI
dotnet watch run --launch-profile https

# ????? ??????? (Terminal 2)
cd frontend
npm run dev

# ?????
git add .
git commit -m "description of changes"
git push origin DashboardY
```

---

## ?? Emergency Commands

### ?? ??? ????:
```powershell
taskkill /F /IM dotnet.exe
taskkill /F /IM node.exe
taskkill /F /IM EyeClinicAPI.exe
```

### Port ?????:
```powershell
# ????? Process ??? Port 7071
netstat -ano | findstr :7071
# ?? ?????? PID:
taskkill /F /PID <PID>
```

### Database ????:
```sql
USE master;
ALTER DATABASE EyeClinicDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
ALTER DATABASE EyeClinicDB SET MULTI_USER;
```

---

## ?? ??????? ??????? (Aliases)

??? ??? ?? PowerShell Profile:

```powershell
# ????? aliases
function Start-API { cd C:\path\to\EyeClinicAPI; dotnet watch run }
function Start-Frontend { cd C:\path\to\frontend; npm run dev }
function Fix-All { .\fix-issues.ps1 }

Set-Alias api Start-API
Set-Alias frontend Start-Frontend
Set-Alias fix Fix-All
```

?? ????? ??? ?????:
```
api
frontend
fix
```

---

**?? ?????:** ???? ??? ????? ?? bookmark ?????? ???? ?????!
