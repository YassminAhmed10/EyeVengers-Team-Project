# Radiology Center: Deployment & Troubleshooting Guide

**Document Version**: 1.0  
**Last Updated**: April 26, 2026  
**Purpose**: Production deployment and runtime issue resolution

---

## 📋 Pre-Deployment Checklist

### Security
- [ ] Change default credentials in `appsettings.json` (JWT secret, ClientId, ClientSecret)
- [ ] Enable HTTPS only (already configured for localhost:7001)
- [ ] Configure CORS whitelist (remove wildcard in production)
- [ ] Enable rate limiting on `/fhir/token` endpoint
- [ ] Implement API key rotation strategy
- [ ] Set up audit logging for compliance (HIPAA)
- [ ] Enable SQL Server encryption at rest
- [ ] Use Azure Key Vault for secrets (not local config)

### Performance
- [ ] Enable response caching for GET endpoints
- [ ] Configure connection pooling (default: 100)
- [ ] Set up database indexing on frequently searched columns
- [ ] Enable gzip compression in IIS/Kestrel
- [ ] Configure load balancing if multiple instances
- [ ] Set up CDN for static assets (frontend)

### Infrastructure
- [ ] SQL Server backups configured (daily at minimum)
- [ ] Database recovery model set to FULL
- [ ] Log storage limit configured (prevent disk full)
- [ ] Monitoring/alerting set up (Application Insights)
- [ ] Uptime monitoring configured
- [ ] Automated scaling configured (if cloud-deployed)

### Database
- [ ] Run migrations on production database
- [ ] Verify foreign key relationships
- [ ] Check indexes on Patient, ScanOrder, Report tables
- [ ] Test database recovery procedure
- [ ] Seed sample data for testing

---

## 🚀 Production Deployment

### Option 1: Azure App Service (Recommended)

#### Step 1: Build Release Package

```bash
# Radiology Backend
cd RadiologyCenter.Backend.Net/RadiologyCenter.API
dotnet publish -c Release -o publish

# Clinic Backend
cd backend/EyeClinicAPI/EyeClinicAPI
dotnet publish -c Release -o publish
```

#### Step 2: Create Azure App Services

```powershell
# Create resource group
az group create --name radiology-rg --location eastus

# Create App Service plans
az appservice plan create `
  --name radiology-plan `
  --resource-group radiology-rg `
  --sku B2 --is-linux

az appservice plan create `
  --name clinic-plan `
  --resource-group radiology-rg `
  --sku B2 --is-linux

# Create app services
az webapp create `
  --resource-group radiology-rg `
  --plan radiology-plan `
  --name radiology-center-api `
  --deployment-container-image-name dotnet

az webapp create `
  --resource-group radiology-rg `
  --plan clinic-plan `
  --name eyeclinic-api `
  --deployment-container-image-name dotnet
```

#### Step 3: Deploy Application

```bash
# Deploy Radiology backend
cd RadiologyCenter.Backend.Net/RadiologyCenter.API
az webapp deployment source config-zip `
  --resource-group radiology-rg `
  --name radiology-center-api `
  --src publish.zip

# Deploy Clinic backend
cd backend/EyeClinicAPI/EyeClinicAPI
az webapp deployment source config-zip `
  --resource-group radiology-rg `
  --name eyeclinic-api `
  --src publish.zip
```

#### Step 4: Configure Application Settings

```powershell
# Radiology backend settings
az webapp config appsettings set `
  --name radiology-center-api `
  --resource-group radiology-rg `
  --settings `
    "JwtSettings__SecretKey=your-production-secret-key" `
    "JwtSettings__Issuer=radiology-center" `
    "Fhir__ClientId=clinic-system" `
    "Fhir__ClientSecret=your-secure-secret"

# Clinic backend settings  
az webapp config appsettings set `
  --name eyeclinic-api `
  --resource-group radiology-rg `
  --settings `
    "RadiologyCenter__BaseUrl=https://radiology-center-api.azurewebsites.net" `
    "RadiologyCenter__ClientId=clinic-system" `
    "RadiologyCenter__ClientSecret=your-secure-secret"
```

### Option 2: Docker Containerization

#### Dockerfile for Radiology Backend

```dockerfile
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["RadiologyCenter.API/RadiologyCenter.API.csproj", "RadiologyCenter.API/"]
COPY ["RadiologyCenter.Core/RadiologyCenter.Core.csproj", "RadiologyCenter.Core/"]
COPY ["RadiologyCenter.Infrastructure/RadiologyCenter.Infrastructure.csproj", "RadiologyCenter.Infrastructure/"]

RUN dotnet restore "RadiologyCenter.API/RadiologyCenter.API.csproj"

COPY . .
WORKDIR "/src/RadiologyCenter.API"
RUN dotnet build "RadiologyCenter.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "RadiologyCenter.API.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=publish /app/publish .

ENV ASPNETCORE_URLS=https://+:443;http://+:80
EXPOSE 80 443

ENTRYPOINT ["dotnet", "RadiologyCenter.API.dll"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  # SQL Server Database
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      SA_PASSWORD: "YourSAPassword123!"
      ACCEPT_EULA: "Y"
    ports:
      - "1433:1433"
    volumes:
      - sqldata:/var/opt/mssql
    healthcheck:
      test: ["CMD", "/opt/mssql-tools/bin/sqlcmd", "-S", "localhost", "-U", "sa", "-P", "YourSAPassword123!", "-Q", "SELECT 1"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Radiology Backend
  radiology-api:
    build:
      context: ./RadiologyCenter.Backend.Net
      dockerfile: Dockerfile
    ports:
      - "7001:443"
    environment:
      ConnectionStrings__DefaultConnection: "Server=sqlserver;Database=RadiologyCenter;User Id=sa;Password=YourSAPassword123!;"
      JwtSettings__SecretKey: "your-super-secret-key-change-in-production"
      ASPNETCORE_ENVIRONMENT: "Production"
    depends_on:
      sqlserver:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Clinic Backend
  clinic-api:
    build:
      context: ./backend/EyeClinicAPI
      dockerfile: Dockerfile
    ports:
      - "5201:443"
    environment:
      ConnectionStrings__DefaultConnection: "Server=sqlserver;Database=EyeClinic;User Id=sa;Password=YourSAPassword123!;"
      RadiologyCenter__BaseUrl: "http://radiology-api"
      RadiologyCenter__ClientId: "clinic-system"
      RadiologyCenter__ClientSecret: "clinic-secret"
      ASPNETCORE_ENVIRONMENT: "Production"
    depends_on:
      sqlserver:
        condition: service_healthy

  # Radiology Frontend
  radiology-frontend:
    build:
      context: ./radiology-center-frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
    environment:
      VITE_RADIOLOGY_API_URL: "http://radiology-api/fhir"
      VITE_CLINIC_API_URL: "http://clinic-api/api"
    depends_on:
      - radiology-api

volumes:
  sqldata:
```

#### Build and Deploy with Docker Compose

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Clean up volumes
docker-compose down -v
```

---

## 🩺 Monitoring & Health Checks

### Health Check Endpoints

```bash
# Radiology backend
curl -X GET https://radiology-center-api.azurewebsites.net/api/health

# Clinic backend
curl -X GET https://eyeclinic-api.azurewebsites.net/api/health
```

### Application Insights Setup

```csharp
// Add to Program.cs
builder.Services.AddApplicationInsightsTelemetry();
builder.Services.AddApplicationInsightsWebJobs();

var app = builder.Build();
app.UseApplicationInsightsRequestLogging();
```

### Key Metrics to Monitor

| Metric | Alert Threshold | Action |
|--------|-----------------|--------|
| API Response Time | > 2 seconds | Scale up or optimize queries |
| Error Rate | > 1% | Review logs, rollback if needed |
| Database CPU | > 80% | Add indexes, optimize queries |
| Disk Space | < 10% remaining | Add storage, cleanup old logs |
| Token Generation Time | > 500ms | Increase cache hit rate |
| FHIR Endpoint Latency | > 1 second | Check database performance |

---

## 🐛 Common Issues & Solutions

### Issue 1: "Unable to connect to database"

**Symptoms**: 503 Service Unavailable when accessing any endpoint

**Diagnosis**:
```bash
# Check connection string in appsettings.json
# Verify SQL Server is running
sqlcmd -S localhost -U sa -P password -Q "SELECT @@VERSION"

# Check firewall rules
netstat -an | findstr 1433
```

**Solution**:
1. Verify SQL Server connection string
2. Ensure SQL Server TCP/IP protocol is enabled
3. Check Windows Firewall allows port 1433
4. Verify database migrations have run

```bash
# Run migrations
dotnet ef database update --project RadiologyCenter.Infrastructure --startup-project RadiologyCenter.API
```

---

### Issue 2: "Invalid token" errors

**Symptoms**: 401 Unauthorized responses, even with valid credentials

**Diagnosis**:
```csharp
// Add token validation logging
var tokenHandler = new JwtSecurityTokenHandler();
try 
{
    tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
}
catch (SecurityTokenException ex)
{
    logger.LogError($"Token validation failed: {ex.Message}");
}
```

**Solution**:
1. Verify JWT secret key matches in all systems
2. Check token expiration time
3. Ensure token was issued by correct issuer
4. Verify token signature

```bash
# Decode token to inspect claims (use jwt.io)
# Token should have: sub, oidc (scope), exp (expiration)
```

---

### Issue 3: "CORS error in frontend"

**Symptoms**: Browser console shows "Access to XMLHttpRequest blocked by CORS policy"

**Diagnosis**:
```csharp
// Check Program.cs for CORS configuration
var corsPolicy = "AllowRadiologyFrontend";
app.UseCors(corsPolicy);
```

**Solution**:
1. Add frontend origin to CORS whitelist

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowRadiologyFrontend", builder =>
    {
        builder.WithOrigins("http://localhost:5174", "https://radiology-frontend.azurewebsites.net")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});
```

2. Verify preflight requests (OPTIONS) return 200
3. Check Authorization header is being sent

---

### Issue 4: "Too many redirects" or "Connection timeout"

**Symptoms**: Network request hangs, page keeps redirecting

**Diagnosis**:
```bash
# Test endpoint connectivity
curl -v http://localhost:7001/fhir/token

# Check for firewall/proxy blocks
tracert localhost:7001
```

**Solution**:
1. Verify backend is actually running
2. Check port 7001 is accessible (not blocked by antivirus)
3. Disable VPN/proxy temporarily to test
4. Check for reverse proxy misconfiguration

---

### Issue 5: "Database concurrent access violation"

**Symptoms**: "The transaction log for database 'RadiologyCenter' is full"

**Diagnosis**:
```sql
-- Check database size
SELECT
    database_id,
    name,
    (size * 8 / 1024) AS size_mb,
    (FILEPROPERTY(name, 'SpaceUsed') * 8 / 1024) AS used_mb
FROM sys.database_files;

-- Check log space
DBCC SQLPERF(logspace);
```

**Solution**:
1. Increase SQL Server max database size
2. Enable log file autogrowth
3. Perform transaction log backup
4. Archive old diagnostic reports

```sql
-- Increase log file size
ALTER DATABASE RadiologyCenter
MODIFY FILE (NAME = RadiologyCenter_log, SIZE = 1024 MB);

-- Enable autogrowth
ALTER DATABASE RadiologyCenter
MODIFY FILE (NAME = RadiologyCenter_log, FILEGROWTH = 256 MB);
```

---

### Issue 6: "Slow FHIR queries"

**Symptoms**: `/fhir/Patient` or `/fhir/DiagnosticReport` queries take > 5 seconds

**Diagnosis**:
```sql
-- Check for missing indexes
SELECT OBJECT_NAME(ips.object_id) AS TableName,
       i.name AS IndexName,
       ips.user_seeks,
       ips.user_scans,
       ips.user_lookups
FROM sys.dm_db_index_usage_stats ips
JOIN sys.indexes i ON ips.index_id = i.index_id
     AND ips.object_id = i.object_id
WHERE database_id = DB_ID()
ORDER BY ips.user_seeks DESC;

-- Run query execution plan
SET STATISTICS IO ON;
SELECT * FROM Patient WHERE Name LIKE '%Smith%';
SET STATISTICS IO OFF;
```

**Solution**:
1. Add indexes on frequently queried columns

```sql
-- Add indexes
CREATE INDEX idx_Patient_Name ON Patient(Name);
CREATE INDEX idx_ScanOrder_PatientId ON ScanOrder(PatientId);
CREATE INDEX idx_Report_PatientId ON Report(PatientId);
CREATE INDEX idx_Report_Status ON Report(Status);
```

2. Implement query pagination
3. Add database query caching

---

### Issue 7: "Frontend shows blank page"

**Symptoms**: http://localhost:5174 loads but no UI elements appear

**Diagnosis**:
```bash
# Check console for errors
# Open DevTools (F12) and check Console tab
# Verify build completed without errors

npm run build

# Check for 404 errors in Network tab
# Verify .env variables are set correctly
```

**Solution**:
1. Clear browser cache and rebuild
2. Check .env file has FHIR API URL
3. Verify backend is accessible from frontend
4. Check browser console for JavaScript errors

```bash
cd radiology-center-frontend
npm run dev
# Verify "ready in XXms" message appears
```

---

## 📊 Performance Tuning

### Database Query Optimization

```sql
-- Add covering index for common search
CREATE INDEX idx_ServiceRequest_Subject_Status 
ON ServiceRequest(PatientId, Status) 
INCLUDE (CreatedDate, Priority);

-- Partition large tables if > 1GB
ALTER TABLE Report 
ADD CONSTRAINT PK_Report_Partition PRIMARY KEY (ReportId, CreatedDate);

-- Implement read replicas for reporting
-- Configure Always-On Availability Groups
```

### API Response Caching

```csharp
[HttpGet("{id}")]
[ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Any)]
public async Task<IActionResult> GetPatient(int id)
{
    var patient = await _fhirService.GetPatientAsync(id);
    return Ok(patient);
}
```

### Frontend Performance

```javascript
// Implement request deduplication
const requestCache = new Map();

export async function getCachedRequest(url, options) {
    if (requestCache.has(url)) {
        return requestCache.get(url);
    }
    const promise = fetch(url, options);
    requestCache.set(url, promise);
    return promise;
}

// Use React.memo for components
export const PatientCard = React.memo(({ patient }) => {
    return <div>{patient.name}</div>;
});
```

---

## 📝 Logging & Diagnostics

### Configure Detailed Logging

```csharp
// In Program.cs
var logging = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .WriteTo.Console()
    .WriteTo.File("logs/radiology-.txt", rollingInterval: RollingInterval.Day)
    .WriteTo.ApplicationInsights(new TelemetryClient(), TelemetryConverter.Traces)
    .CreateLogger();

builder.Logging.ClearProviders();
builder.Logging.AddSerilog(logging);
```

### View Production Logs

```bash
# Azure App Service logs
az webapp log tail --name radiology-center-api --resource-group radiology-rg

# Docker container logs
docker logs radiology-api -f

# Local application logs
Get-Content logs/radiology-*.txt -Tail 100 -Wait
```

---

## 🔄 Rollback Procedure

If deployment causes issues:

```bash
# Identify last good deployment
az webapp deployment list --name radiology-center-api --resource-group radiology-rg

# Rollback to previous version
az webapp deployment slot swap --name radiology-center-api --resource-group radiology-rg

# Verify health
curl https://radiology-center-api.azurewebsites.net/api/health
```

---

## ✅ Post-Deployment Validation

Run these checks after deployment:

```bash
#!/bin/bash

# 1. Health checks
echo "Checking Radiology Backend..."
curl -s -o /dev/null -w "%{http_code}" https://radiology-center-api.azurewebsites.net/api/health
echo ""

# 2. Token generation
echo "Testing authentication..."
curl -X POST https://radiology-center-api.azurewebsites.net/fhir/token \
  -d '{"clientId":"clinic-system","clientSecret":"clinic-secret"}' | jq .

# 3. Database connectivity
echo "Checking database..."
curl https://radiology-center-api.azurewebsites.net/fhir/Patient/1 \
  -H "Authorization: Bearer {token}"

# 4. CORS configuration
echo "Testing CORS..."
curl -i -X OPTIONS https://radiology-center-api.azurewebsites.net/fhir/Patient

# 5. Frontend accessibility
echo "Checking frontend..."
curl -s https://radiology-frontend.azurewebsites.net | head -20
```

---

**Document Status**: ✅ Complete  
**Last Reviewed**: April 26, 2026  
**Next Review Date**: May 1, 2026
