# Firebase Authentication Implementation - Complete Guide

This document summarizes all the changes made to integrate Firebase Authentication into the Radiology Center application.

## 📋 Table of Contents
- [Files Created](#files-created)
- [Files Modified](#files-modified)
- [Installation Steps](#installation-steps)
- [Configuration Steps](#configuration-steps)
- [Usage Examples](#usage-examples)
- [Architecture Overview](#architecture-overview)
- [API Authentication](#api-authentication)

---

## 📁 Files Created

### Frontend - Firebase Configuration
- **`src/firebase/config.js`** - Firebase SDK initialization
- **`src/firebase/auth.js`** - Authentication functions (register, login, logout)
- **`src/firebase/firestore.js`** - Firestore database operations
- **`src/context/AuthContext.jsx`** - Global authentication state management
- **`src/hooks/useAuth.js`** - Custom hook for easy auth access
- **`FIREBASE_SETUP.md`** - Detailed Firebase setup guide
- **`.env.example`** - Updated with Firebase config variables

### Backend - Firebase Authentication
- **`middleware/firebaseAuth.js`** - Token verification middleware
- **`firebase-admin.js`** - Firebase Admin SDK initialization
- **`.env.example`** - Updated with Firebase Admin key options

---

## ✏️ Files Modified

### Frontend
1. **`src/pages/Radiology/RegisterPage.jsx`**
   - Added Firebase authentication import
   - Added loading state for submit button
   - Replaced fake handleSubmit with real Firebase registration
   - Added error handling for Firebase errors
   - Added loading spinner on submit button
   - Errors now display under relevant input fields

2. **`src/pages/Radiology/LoginPage.jsx`**
   - Added Firebase authentication import
   - Added loading state for submit button
   - Replaced fake handleSubmit with real Firebase login
   - Added error handling for Firebase-specific errors
   - Added loading spinner on submit button
   - Email login uses Firebase; Phone/Patient ID show "not implemented" message
   - Token saved to localStorage for API authentication

3. **`src/api/axiosInstance.js`**
   - Added request interceptor to inject Firebase token in Authorization header
   - Added response interceptor to handle 401 errors (token expiration)
   - Automatically clears localStorage on unauthorized access

### Backend
1. **`server.js`**
   - Added Firebase Admin SDK initialization
   - Applied authentication middleware to all `/api` routes
   - Health check endpoint remains public

---

## 🚀 Installation Steps

### Step 1: Install Frontend Dependencies

```bash
cd radiology-center-frontend
npm install firebase
npm install  # Install other dependencies if needed
```

### Step 2: Install Backend Dependencies

```bash
cd radiology-center-backend
npm install firebase-admin
npm install  # Install other dependencies if needed
```

---

## ⚙️ Configuration Steps

### Step 1: Firebase Project Setup

Follow the detailed instructions in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md):
1. Create Firebase project
2. Enable Email/Password authentication
3. Create Firestore database with security rules
4. Get Firebase config values

### Step 2: Frontend Environment Setup

1. Create `.env` file in `radiology-center-frontend`:
   ```bash
   cp .env.example .env
   ```

2. Add your Firebase config values:
   ```env
   VITE_FIREBASE_API_KEY=YOUR_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
   VITE_RADIOLOGY_API_URL=http://localhost:5001/api
   ```

### Step 3: Backend Environment Setup

1. Create `.env` file in `radiology-center-backend`:
   ```bash
   cp .env.example .env
   ```

2. Choose ONE of these options:

   **Option A: Using File (Local Development)**
   - Download service account key from Firebase Console
   - Rename to `firebase-admin-key.json`
   - Place in `radiology-center-backend` root
   - Add to `.gitignore`: `firebase-admin-key.json`

   **Option B: Using Environment Variable (Production)**
   - Get service account key JSON content
   - Add to `.env`:
     ```env
     FIREBASE_ADMIN_KEY={"type":"service_account","project_id":"..."}
     ```

### Step 4: Wrap App with AuthProvider

Update your app entry point (e.g., `src/main.jsx`):

```jsx
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

---

## 💻 Usage Examples

### Using Auth Context

```jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function MyComponent() {
  const { currentUser, userToken, loading, logout } = useContext(AuthContext);

  if (loading) return <div>Loading auth state...</div>;

  if (currentUser) {
    return (
      <div>
        <p>Welcome, {currentUser.email}</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return <div>Please log in</div>;
}
```

### Using Custom Hook

```jsx
import { useAuth } from "../hooks/useAuth";

function Dashboard() {
  const { currentUser, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>User: {currentUser.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Making Authenticated API Calls

All API calls through `axiosInstance` automatically include the Firebase token:

```jsx
import { axiosInstance } from "../api/axiosInstance";

async function fetchAppointments() {
  try {
    // Token is automatically added to Authorization header
    const response = await axiosInstance.get("/appointments");
    console.log(response.data);
  } catch (error) {
    console.error("Error:", error.message);
  }
}
```

### Using Firebase Auth Functions Directly

```jsx
import { registerUser, loginUser, logoutUser } from "../firebase/auth";
import { saveUserData, getUserData } from "../firebase/firestore";

// Register
const result = await registerUser("user@example.com", "password");
if (result.success) {
  await saveUserData(result.user.uid, {
    firstName: "John",
    lastName: "Doe",
    email: result.user.email,
  });
}

// Login
const loginResult = await loginUser("user@example.com", "password");

// Logout
await logoutUser();
```

---

## 🏗️ Architecture Overview

```
Frontend App
│
├── AuthProvider (context/AuthContext.jsx)
│   ├── Listens to onAuthStateChanged
│   ├── Manages global auth state
│   └── Exposes: currentUser, userToken, logout
│
├── RegisterPage & LoginPage
│   ├── Use Firebase auth functions
│   ├── Save user data to Firestore
│   ├── Show loading states and errors
│   └── Redirect on success
│
├── API Calls (axiosInstance)
│   ├── Request interceptor injects token
│   ├── Bearer token format: "Bearer {idToken}"
│   └── Response interceptor handles 401
│
└── Backend Server
    │
    ├── Firebase Admin SDK
    │   └── Verifies tokens with firebaseAuth middleware
    │
    └── Routes
        ├── /health (public)
        └── /api/* (protected with middleware)
            ├── /appointments
            ├── /patients
            ├── /scan-orders
            └── /reports
```

---

## 🔐 API Authentication

### Frontend - Sending Token

All requests using `axiosInstance` automatically include the token:

```javascript
// Automatically becomes:
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjFkODNhNzIxMTcyMDg0M2Y1MzdjMjMxNzgxYzUzZTdhZjMxMmM2YmMifQ...
```

### Backend - Verifying Token

The middleware automatically:
1. Extracts token from `Authorization: Bearer {token}` header
2. Verifies token with Firebase Admin SDK
3. Attaches user info to `req.user`
4. Returns 401 if token is invalid/expired

```javascript
// In your route handler
app.get("/api/appointments", firebaseAuthMiddleware, (req, res) => {
  console.log(req.user.uid); // Firebase UID
  console.log(req.user.email); // User email
  // Your logic here
});
```

### Error Handling

**Frontend (axiosInstance):**
- 401 Unauthorized → Clear localStorage and redirect
- Network errors → Show error message
- Server errors → Show error from response

**Backend (middleware):**
- Missing token → 401 "Missing or malformed authorization token"
- Invalid token → 403 "Authentication failed"
- Expired token → 401 "Token has expired"
- Revoked token → 401 "Token has been revoked"

---

## 📝 Database Schema

### Firestore Collections

#### `users/{uid}`
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "patient",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### `patients/{patientId}`
```json
{
  "userId": "uid",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### `appointments/{appointmentId}`
```json
{
  "userId": "uid",
  "patientId": "patientId",
  "date": "2024-02-01",
  "time": "10:00",
  "status": "scheduled",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### `reports/{reportId}`
```json
{
  "userId": "uid",
  "patientId": "patientId",
  "appointmentId": "appointmentId",
  "type": "X-Ray",
  "status": "completed",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## 🧪 Testing Checklist

- [ ] User can register with email and password
- [ ] User receives appropriate error on duplicate email
- [ ] User receives appropriate error on weak password
- [ ] User can log in with email and password
- [ ] User receives appropriate error on wrong password
- [ ] User receives appropriate error on non-existent email
- [ ] Token is saved to localStorage on successful login
- [ ] User data is saved to Firestore on registration
- [ ] Logout clears localStorage and auth state
- [ ] API calls include Authorization header
- [ ] API calls fail with 401 if no token
- [ ] API calls fail with 401 if token is invalid
- [ ] Token refresh happens automatically on page reload
- [ ] Redirect to login on token expiration
- [ ] Loading spinners show during async operations
- [ ] Error messages display under relevant fields

---

## 🚨 Troubleshooting

### Common Issues

#### "Firebase is not initialized"
- Check `.env` file exists with correct values
- Restart dev server
- Clear browser cache

#### "Missing or malformed authorization token" (401 from API)
- Check token is in localStorage: `localStorage.getItem('authToken')`
- Check token format: `Authorization: Bearer <token>`
- Try logging in again to get fresh token
- Check backend middleware is properly applied

#### "No user data found in Firestore"
- Register new user first
- Check Firestore database in Firebase Console
- Check Firestore security rules allow read/write

#### CORS Errors
- Check `src/api/axiosInstance.js` baseURL
- Check backend CORS middleware in `server.js`
- Make sure frontend and backend URLs match in .env

---

## 📚 Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Firebase Console](https://console.firebase.google.com)

---

## 🎯 Next Steps

1. **Setup Firebase Project** - Follow FIREBASE_SETUP.md
2. **Install Dependencies** - Run npm install commands
3. **Configure Environment** - Add .env files with Firebase config
4. **Wrap App** - Update main.jsx with AuthProvider
5. **Test Registration** - Try registering new user
6. **Test Login** - Try logging in with registered account
7. **Test API** - Make API calls and verify authentication
8. **Deploy** - Set up environment variables in production

---

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review FIREBASE_SETUP.md for detailed setup instructions
3. Check Firebase Console for any service status issues
4. Review browser console for error messages
5. Check backend server logs for API errors
