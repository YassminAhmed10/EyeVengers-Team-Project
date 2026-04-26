# React + Firebase Integration Guide

## Part 1: Install Firebase SDK

### Step 1: Install packages
```bash
cd radiology-center-frontend
npm install firebase
```

### Step 2: Create Firebase Config File

Create a new file: `src/firebase/config.js`

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Replace with your Firebase config from console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
```

**Replace** the values with your Firebase config!

---

## Part 2: Project Structure

Create this folder structure in `src/`:

```
src/
├── firebase/
│   ├── config.js           # Firebase configuration
│   ├── auth.js             # Authentication functions
│   └── firestore.js        # Firestore functions
├── context/
│   └── AuthContext.jsx     # User state management
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   └── ...
├── components/
│   ├── ProtectedRoute.jsx  # For private pages
│   └── ...
└── ...
```

---

## Part 3: Understanding the Modules

### 1. **firebase/config.js**
- Initialize Firebase
- Export auth, db, storage objects

### 2. **firebase/auth.js**
- Login function
- Register function
- Logout function
- Verify password reset

### 3. **firebase/firestore.js**
- Add data (Create)
- Read data (Read)
- Update data (Update)
- Delete data (Delete)

### 4. **context/AuthContext.jsx**
- Manage logged-in user
- Provide user data to whole app

### 5. **components/ProtectedRoute.jsx**
- Prevent unauthorized access
- Redirect to login if not authenticated

---

## Next Steps:
➡️ Go to `03-AUTHENTICATION.md` to learn login/register
➡️ Go to `04-FIRESTORE-CRUD.md` to learn database operations
