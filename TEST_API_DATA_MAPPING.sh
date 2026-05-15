#!/bin/bash
# API Data Mapping Test Script
# This script tests the complete data mapping from the medical record API

echo "========================================"
echo "  Patient Medical Record API Test"
echo "========================================"
echo ""

# Configuration
API_BASE="http://localhost:5201"
PATIENT_ID="P-000123"  # Change this to your test patient ID
TOKEN=""  # Add your JWT token here if needed

echo "API Base URL: $API_BASE"
echo "Patient ID: $PATIENT_ID"
echo ""

# Test 1: Check if record exists
echo "1️⃣  Testing: Check if medical record exists"
echo "   Endpoint: GET /api/MedicalRecord/check/{patientId}"
echo ""

curl -s -X GET \
  "$API_BASE/api/MedicalRecord/check/$PATIENT_ID" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  ${TOKEN:+-H "Authorization: Bearer $TOKEN"} | jq '.'

echo ""
echo "---"
echo ""

# Test 2: Get appointment info (most important - this is what the frontend uses)
echo "2️⃣  Testing: Get appointment info (Frontend Data Source)"
echo "   Endpoint: GET /api/MedicalRecord/appointment-info/{patientId}"
echo ""

echo "📋 EXPECTED FIELDS TO CHECK:"
echo "   ✓ gender"
echo "   ✓ nationalId"
echo "   ✓ address"
echo "   ✓ insuranceCompany"
echo "   ✓ insuranceId"
echo "   ✓ email"
echo "   ✓ phone"
echo "   ✓ birthDate"
echo ""

RESPONSE=$(curl -s -X GET \
  "$API_BASE/api/MedicalRecord/appointment-info/$PATIENT_ID" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  ${TOKEN:+-H "Authorization: Bearer $TOKEN"})

echo "📌 Full API Response:"
echo "$RESPONSE" | jq '.'

echo ""
echo "📊 Data Extraction Summary:"
echo "$RESPONSE" | jq '{
  "patientId": .patientId,
  "name": .name,
  "gender": .gender,
  "nationalId": .nationalId,
  "address": .address,
  "email": .email,
  "phone": .phone,
  "birthDate": .birthDate,
  "insuranceCompany": .insuranceCompany,
  "insuranceId": .insuranceId,
  "policyNumber": .policyNumber,
  "coverage": .coverage,
  "emergencyContactName": .emergencyContactName,
  "emergencyContactPhone": .emergencyContactPhone
}'

echo ""
echo "---"
echo ""

# Test 3: Get full medical record
echo "3️⃣  Testing: Get full medical record"
echo "   Endpoint: GET /api/MedicalRecord/patient/{patientId}"
echo ""

curl -s -X GET \
  "$API_BASE/api/MedicalRecord/patient/$PATIENT_ID" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  ${TOKEN:+-H "Authorization: Bearer $TOKEN"} | jq '.[] | {patientId, gender, nationalId, address, insuranceCompany}'

echo ""
echo "========================================"
echo "  Test Complete"
echo "========================================"
echo ""
echo "✅ If all fields (gender, nationalId, address, insuranceCompany) are populated,"
echo "   then the data mapping is working correctly!"
echo ""
