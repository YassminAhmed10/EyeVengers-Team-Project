# Firebase Integration - Quick Start Guide

Get Firebase Authentication working in 10 minutes!

## 1️⃣ Firebase Project Setup (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project: **"Radiology Center"**
3. Go to **Authentication** → Enable **Email/Password**
4. Go to **Firestore** → Create database in **Production mode**
5. Go to **Project Settings** → Copy your config values

## 2️⃣ Frontend Setup (2 minutes)

```bash
cd radiology-center-frontend
npm install firebase
```

Create `.env` file (copy from `.env.example`):
```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_RADIOLOGY_API_URL=http://localhost:5001/api
```

## 3️⃣ Backend Setup (2 minutes)

```bash
cd radiology-center-backend
npm install firebase-admin
```

**Option A - Local Development:**
1. Download service account key from Firebase Console
2. Rename to `firebase-admin-key.json`
3. Place in `radiology-center-backend` root
4. Add to `.gitignore`

**Option B - Production:**
Add to `.env`:
```env
FIREBASE_ADMIN_KEY={"type":"service_account",...}
```

## 4️⃣ Wire Up App (1 minute)

Update `src/main.jsx`:
```jsx
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

## 5️⃣ Start Testing!

```bash
# Frontend
npm run dev

# Backend (separate terminal)
npm start
```

Register → Login → Done! 🎉

---

## 📌 Quick Reference

### Use Auth in Components
```jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function MyComponent() {
  const { currentUser, logout } = useContext(AuthContext);
  
  return (
    <div>
      Welcome, {currentUser?.email}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### OR Use Custom Hook
```jsx
import { useAuth } from "../hooks/useAuth";

function MyComponent() {
  const { currentUser, logout } = useAuth();
  // Same as above...
}
```

### Make API Calls
```jsx
import { axiosInstance } from "../api/axiosInstance";

// Token is automatically added!
const data = await axiosInstance.get("/appointments");
```

---

## ✅ What Was Changed

**Frontend:**
- ✅ Firebase SDK files created (`config.js`, `auth.js`, `firestore.js`)
- ✅ `AuthContext.jsx` created for global auth state
- ✅ `RegisterPage.jsx` updated with real Firebase registration
- ✅ `LoginPage.jsx` updated with real Firebase login
- ✅ `axiosInstance.js` updated to inject token in API calls
- ✅ `useAuth` hook created for easy auth access

**Backend:**
- ✅ Firebase Admin middleware created
- ✅ `server.js` updated to protect API routes
- ✅ All `/api/*` routes now require authentication

---

## 🔑 Key Features Implemented

| Feature | Status | Details |
|---------|--------|---------|
| User Registration | ✅ | Email/Password with Firestore storage |
| User Login | ✅ | Email/Password with token in localStorage |
| User Logout | ✅ | Clears token and redirects |
| Token Injection | ✅ | Auto-added to all API calls |
| Token Verification | ✅ | Backend verifies with Firebase Admin |
| Error Handling | ✅ | User-friendly error messages |
| Loading States | ✅ | Spinners on buttons during async ops |
| Protected Routes | ✅ | All API endpoints secured |

---

## 🚀 You're Ready!

Everything is set up and ready to go. Just:
1. Configure Firebase (copy config values to `.env`)
2. Run `npm install` on both frontend and backend
3. Start the dev server
4. Try registration and login

For detailed setup instructions, see:
- [FIREBASE_SETUP.md](./radiology-center-frontend/FIREBASE_SETUP.md) - Detailed Firebase setup
- [FIREBASE_IMPLEMENTATION.md](./FIREBASE_IMPLEMENTATION.md) - Complete implementation guide

---

## ❓ Common Issues

**Q: "Firebase not initialized"**
A: Check your `.env` file has the correct Firebase config values

**Q: "401 Unauthorized from API"**
A: Make sure you're logged in and the token is in localStorage

**Q: "firebase-admin-key.json not found"**
A: Either place the file in backend root OR use `FIREBASE_ADMIN_KEY` environment variable

---

## 📞 Need Help?

1. Check the **Troubleshooting** section in [FIREBASE_IMPLEMENTATION.md](./FIREBASE_IMPLEMENTATION.md)
2. Review [FIREBASE_SETUP.md](./radiology-center-frontend/FIREBASE_SETUP.md)
3. Check Firebase Console for service status
4. Review browser console for errors
5. Check backend logs: `node server.js`
