#!/bin/bash
# FHIR Segment Logging - Quick Start Script

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         FHIR/HL7 SEGMENT LOGGING - QUICK START                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if services are already running
echo "Checking for existing processes on ports 5201, 5301, 5173..."
lsof -i :5201 &>/dev/null && echo "⚠️  Port 5201 in use - killing process..." && pkill -f "dotnet.*ClinicSystem" || true
lsof -i :5301 &>/dev/null && echo "⚠️  Port 5301 in use - killing process..." && pkill -f "dotnet.*RadiologyCenter" || true
lsof -i :5173 &>/dev/null && echo "⚠️  Port 5173 in use - killing process..." && pkill -f "npm.*dev" || true

sleep 2

echo ""
echo "Building backends..."
echo ""

# Build Clinic
echo "1️⃣  Building Eye Clinic Backend..."
cd Modules/ClinicSystem/Backend
dotnet build -q
if [ $? -ne 0 ]; then echo "❌ Clinic build failed"; exit 1; fi
echo "✅ Clinic build successful"
cd ../../..

echo ""

# Build Radiology
echo "2️⃣  Building Radiology Center Backend..."
cd Modules/RadiologyCenter/Backend
dotnet build -q
if [ $? -ne 0 ]; then echo "❌ Radiology build failed"; exit 1; fi
echo "✅ Radiology build successful"
cd ../../..

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              OPENING 3 TERMINALS FOR SERVICES                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Terminal 1 (Eye Clinic - Port 5201):"
echo "  cd Modules/ClinicSystem/Backend && dotnet run"
echo ""
echo "Terminal 2 (Radiology - Port 5301):"
echo "  cd Modules/RadiologyCenter/Backend && dotnet run"
echo ""
echo "Terminal 3 (Frontend - Port 5173):"
echo "  cd Modules/RadiologyCenter/Frontend && npm run dev"
echo ""
echo "Then navigate to: http://localhost:5173/radiology/profile"
echo ""
echo "Watch the terminals for FHIR segment boxes:"
echo "  ╔════════════════════════════════════════════╗"
echo "  ║ [PID] PATIENT IDENTIFICATION SEGMENT      ║"
echo "  ║ Direction: → OUT (Eye Clinic → Radiology) ║"
echo "  ╚════════════════════════════════════════════╝"
