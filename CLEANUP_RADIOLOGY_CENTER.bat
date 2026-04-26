@echo off
REM Cleanup Script - Remove Unused Folders from EyeVengers Project
REM Keep only: RadiologyCenter.Backend.Net, radiology-center-frontend, backend/EyeClinicAPI

echo Cleaning up EyeVengers Project - Focus on Radiology Center Only
echo.
echo WARNING: This will delete unused folders. Make sure you have backups!
echo.
pause

REM Navigate to project root
cd /d C:\Users\LOQ\Downloads\backup\EyeVengers-Team-Project

REM Delete unused frontend folders
if exist "frontend" (
    echo Deleting frontend...
    rmdir /s /q frontend
)

if exist "glass-store-frontend" (
    echo Deleting glass-store-frontend...
    rmdir /s /q glass-store-frontend
)

if exist "pharmacy-frontend" (
    echo Deleting pharmacy-frontend...
    rmdir /s /q pharmacy-frontend
)

if exist "firebase-setup-guide" (
    echo Deleting firebase-setup-guide...
    rmdir /s /q firebase-setup-guide
)

if exist "radiology-center-backend" (
    echo Deleting radiology-center-backend (old Firebase backend)...
    rmdir /s /q radiology-center-backend
)

REM Delete Firebase documentation files (keep only FHIR docs)
if exist "FIREBASE_QUICK_START.md" del FIREBASE_QUICK_START.md
if exist "FIREBASE_IMPLEMENTATION.md" del FIREBASE_IMPLEMENTATION.md
if exist "FIREBASE_INTEGRATION_COMPLETE.md" del FIREBASE_INTEGRATION_COMPLETE.md
if exist "FIREBASE_INTEGRATION_SUMMARY.md" del FIREBASE_INTEGRATION_SUMMARY.md
if exist "FIREBASE-COMPLETE-GUIDE.md" del FIREBASE-COMPLETE-GUIDE.md

REM Delete old setup guides (keep only Radiology Center guides)
if exist "BACKEND_SETUP_GUIDE.md" del BACKEND_SETUP_GUIDE.md

echo.
echo Cleanup complete!
echo.
echo Remaining structure:
echo   - RadiologyCenter.Backend.Net   (FHIR-compliant backend)
echo   - radiology-center-frontend     (React frontend)
echo   - backend/EyeClinicAPI          (Clinic system backend)
echo.
echo Next steps:
echo   1. Update radiology-center-frontend/.env
echo   2. Update EyeClinicAPI to use FHIR endpoints
echo   3. Review RADIOLOGY_CENTER_INTEGRATION.md
echo.
pause
