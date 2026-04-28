# Firebase Integration Setup Guide

This guide will help you set up Firebase Authentication for the Radiology Center application.

## Table of Contents
1. [Firebase Project Setup](#firebase-project-setup)
2. [Frontend Configuration](#frontend-configuration)
3. [Backend Configuration](#backend-configuration)
4. [Testing the Integration](#testing-the-integration)
5. [Troubleshooting](#troubleshooting)

---

## Firebase Project Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Enter a project name (e.g., "Radiology Center")
4. Accept the terms and click **"Create project"**
5. Wait for the project to be created

### Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** (left sidebar)
2. Click **"Get started"**
3. Click **"Email/Password"** provider
4. Toggle **"Enable"** and then **"Save"**

### Step 3: Create Firestore Database

1. Go to **Firestore Database** (left sidebar)
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose a region (select the one closest to your users)
5. Click **"Create"**
6. Add the following security rules in **Rules** tab:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write only their own documents
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Admins can read all users
    match /users/{document=**} {
      allow read: if request.auth.token.admin == true;
    }

    // Patients collection
    match /patients/{document=**} {
      allow read, write: if request.auth != null;
    }

    // Appointments collection
    match /appointments/{document=**} {
      allow read, write: if request.auth != null;
    }

    // Reports collection
    match /reports/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

7. Click **"Publish"**

### Step 4: Get Firebase Config

1. Go to **Project Settings** (gear icon at top)
2. Select the **"General"** tab
3. Scroll down to **"Your apps"** section
4. Click the web icon (**</\>**)
5. Register the app with name "Radiology Center"
6. Copy the Firebase config object

---

## Frontend Configuration

### Step 1: Install Firebase SDK

```bash
cd radiology-center-frontend
npm install firebase
```

### Step 2: Create .env File

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace the Firebase values with your config from Step 4:

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

### Step 3: Wrap App with AuthProvider

Open your main entry point (usually `main.jsx` or `App.jsx`) and wrap the app with `AuthProvider`:

```jsx
import { AuthProvider } from "./context/AuthContext";
import App from "./App";

ReactDOM.render(
  <AuthProvider>
    <App />
  </AuthProvider>,
  document.getElementById("root")
);
```

### Step 4: Use AuthContext in Components

```jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function MyComponent() {
  const { currentUser, userToken, loading, logout } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

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

---

## Backend Configuration

### Step 1: Install Firebase Admin SDK

```bash
cd radiology-center-backend
npm install firebase-admin
```

### Step 2: Get Service Account Key

1. Go to **Project Settings** > **Service Accounts**
2. Click **"Generate New Private Key"**
3. A JSON file will download

### Step 3: Configure Firebase Admin

#### Option A: Using File (Local Development)

1. Move the downloaded JSON file to the backend root directory
2. Rename it to `firebase-admin-key.json`
3. Add it to `.gitignore` to avoid committing it:
   ```
   firebase-admin-key.json
   ```

#### Option B: Using Environment Variable (Production/Vercel)

1. Copy the entire content of the JSON file
2. Add to `.env`:
   ```env
   FIREBASE_ADMIN_KEY={"type":"service_account","project_id":"...","private_key":"..."}
   ```

### Step 4: Verify Backend Setup

The middleware is already applied to all `/api` routes in `server.js`. All API endpoints now:
- Require a valid Firebase token
- Extract user UID from the token
- Attach user info to `req.user`

---

## Testing the Integration

### Test Registration

1. Start the frontend: `npm run dev`
2. Go to the registration page
3. Fill in the form and submit
4. You should see the account created with Firebase

### Test Login

1. Go to the login page
2. Use the email/password you registered with
3. You should be redirected to the results page
4. Token will be saved to localStorage

### Test API Authentication

1. In your browser console, check localStorage:
   ```javascript
   console.log(localStorage.getItem("authToken"));
   ```

2. Make an API call to test authentication:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5001/api/appointments
   ```

---

## Troubleshooting

### "Firebase not initialized" Error

**Problem:** `Error: Firebase not initialized`

**Solution:** 
- Make sure `.env` file exists and has correct values
- Make sure AuthProvider is wrapping your app
- Restart the development server

### "Missing or malformed authorization token" (Backend)

**Problem:** API calls return 401 Unauthorized

**Solution:**
- Check that the token is being sent in the Authorization header
- Format should be: `Authorization: Bearer <token>`
- Make sure token is not expired (tokens last ~1 hour)
- Try logging in again to get a fresh token

### "firebase-admin-key.json not found" (Backend)

**Problem:** Firebase Admin features not working

**Solution:**
- Make sure `firebase-admin-key.json` is in the backend root directory
- Or set the `FIREBASE_ADMIN_KEY` environment variable
- Don't commit the key file to Git

### Authentication Works Locally but Not in Production

**Problem:** Errors in deployed version

**Solution:**
- Make sure Firebase config values in `.env` match your production project
- Use environment variables for the backend (FIREBASE_ADMIN_KEY)
- Check CORS settings in Firebase Console if needed
- Verify Firestore security rules allow your app

### Token Expires Too Quickly

**Problem:** Users get logged out frequently

**Solution:**
- Firebase tokens are valid for 1 hour
- Implement token refresh using `onAuthStateChanged` (already done in AuthContext)
- The token is automatically refreshed when needed

---

## Next Steps

1. ✅ Test registration and login
2. ✅ Verify API calls work with authentication
3. ✅ Test logout functionality
4. 📝 Add password reset functionality (optional)
5. 🔧 Add two-factor authentication (optional)
6. 📱 Add social login providers (Google, GitHub, etc.)

For more information, see:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security)
