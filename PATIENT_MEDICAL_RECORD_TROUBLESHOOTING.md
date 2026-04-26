# 🐛 Patient Medical Record - Troubleshooting Guide

**Last Updated**: April 26, 2026

---

## ⏳ Loading Spinner Stuck?

If you see the loading spinner that says "⏳ Loading patient data..." and it doesn't load, here's how to fix it:

### Issue 1: Not Logged In
**Symptom**: Loading never stops or shows error  
**Solution**: 
1. Go to http://localhost:5173/login
2. Log in with valid patient credentials
3. Return to /patient/medical-record

---

### Issue 2: patientId Not in localStorage
**Symptom**: Loading spinner appears but nothing loads  
**Check**: Open browser DevTools (F12) → Console
```javascript
console.log(localStorage.getItem('patientId'));
console.log(localStorage.getItem('patientName'));
```

**If both return null**:
- Patient is not properly logged in
- Clear cookies/localStorage and re-login

**If patientId is present**:
- Proceed to Issue 3

---

### Issue 3: API Endpoint Not Accessible
**Symptom**: Loading spinner + "Failed to load patient data" error  
**Check**: Verify API is running
```bash
# In separate terminal, check if clinic API is running
curl http://localhost:5201/health

# Should return 200 OK
```

**If API is down**:
```bash
# Start the clinic API
cd backend/EyeClinicAPI/EyeClinicAPI
dotnet run
```

**If API is running but endpoint fails**:
- Component falls back to localStorage data
- You'll see name and email from login

---

### Issue 4: Token Invalid or Expired
**Symptom**: API returns 401 Unauthorized  
**Solution**:
1. Go to /login
2. Log in again (gets new token)
3. Return to /patient/medical-record

---

## ✅ What Should Display

### Best Case (API Data Available)
```
Footer shows: 📊 Data Source: 🌐 API
- Shows complete patient info (name, age, gender, contact, insurance, etc.)
- All sections populated with real data
```

### Fallback Case (localStorage Data)
```
Footer shows: 📊 Data Source: 💾 Local Storage
- Shows patient name from login
- Shows patient email from login
- Other fields show "Not available"
- This is expected if API endpoint doesn't exist yet
```

---

## 🔍 Debugging Steps

### Step 1: Check localStorage
```javascript
// Open browser console (F12)
Object.keys(localStorage).forEach(key => {
  console.log(`${key}: ${localStorage.getItem(key)}`);
});
```

### Step 2: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for API call to `/api/patients/[patientId]`
5. Check response (200, 404, 500, etc.)

### Step 3: Check Console Errors
1. Open DevTools (F12)
2. Go to Console tab
3. Look for any red error messages
4. Copy error message for debugging

### Step 4: Verify Component is Rendering
```javascript
// Type in console:
document.querySelector('.patient-medical-record') // Should not be null
```

---

## 📊 Data Source Priority

The component tries to load data in this order:

```
1. From Props (if passed to component)
   ↓ (if not available)
2. From API (/api/patients/{patientId})
   ↓ (if fails)
3. From localStorage (fallback)
   ↓ (if nothing available)
4. Show error message
```

---

## 🛠️ Quick Fixes

### Fix 1: Clear Cache & Reload
```
Press: Ctrl + Shift + Delete (Windows)
       Cmd + Shift + Delete (Mac)
```
- Select "All time"
- Check all boxes
- Clear browsing data
- Reload page

---

### Fix 2: Check Network
```bash
# Verify API is accessible
ping localhost:5201
curl http://localhost:5201/health
```

---

### Fix 3: Check Console Logs
In browser console, look for messages like:
```
"API fetch failed, using localStorage data: ..."
```
This means API failed but component fell back to localStorage.

---

## 💡 Expected Behavior

### Scenario 1: Full Login + API Working
```
1. User logs in
2. Redirects to /patient/medical-record
3. Shows spinner briefly
4. Displays full patient info from API
5. Footer shows: 🌐 API
```

### Scenario 2: Full Login + API Not Working
```
1. User logs in
2. Redirects to /patient/medical-record
3. Shows spinner briefly
4. API call fails (but doesn't error out)
5. Falls back to localStorage data
6. Shows patient name and email
7. Footer shows: 💾 Local Storage
```

### Scenario 3: Not Logged In
```
1. User not logged in
2. Goes to /patient/medical-record
3. localStorage.patientId = null
4. Shows error: "Could not load patient data"
5. User should go back to login
```

---

## 📝 What Each Data Source Shows

### API Data (Best)
```
✅ Patient ID
✅ Full Name
✅ Age
✅ Gender
✅ Date of Birth
✅ National ID
✅ Phone Number
✅ Email
✅ Address
✅ Insurance Company
✅ Insurance ID
✅ Policy Number
✅ Coverage
✅ Emergency Contact Name
✅ Emergency Contact Phone
```

### localStorage Data (Fallback)
```
✅ Patient ID (from localStorage)
✅ Full Name (from localStorage)
✅ Email (from localStorage)
⚠️ Age: "Not available"
⚠️ Gender: "Not available"
⚠️ Address: "Not available"
⚠️ Insurance: "Not available"
⚠️ Emergency Contact: "Not available"
```

---

## 🔗 Related Files

- Component: `frontend/src/components/PatientMedicalRecord.jsx`
- Styles: `frontend/src/components/PatientMedicalRecord.css`
- Routes: `frontend/src/AllProject.jsx`
- Route path: `/patient/medical-record`

---

## 📞 Still Having Issues?

### Check This Order:
1. ✅ Are you logged in? (Go to /login if not)
2. ✅ Is API running? (Check port 5201)
3. ✅ Do you have valid token? (Check localStorage)
4. ✅ Check browser console for errors (F12)
5. ✅ Check network tab for failed requests (F12)

### Common Error Messages:

**"Could not load patient data. Please login again."**
- Solution: Go to /login and log in again

**"⏳ Loading patient data..." (stuck)**
- Solution: Check if patientId is in localStorage
- Solution: Check if API is running on port 5201

**Data shows "Not available" for most fields**
- Expected if API endpoint doesn't exist yet
- Component falls back to localStorage data
- This is working as designed ✅

---

**Version**: 1.0  
**Status**: ✅ Production Ready with Fallbacks
