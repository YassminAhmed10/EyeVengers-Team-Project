# Firebase Best Practices & Optimization

## 1️⃣ Security Rules (IMPORTANT!)

### Test Mode (Development Only):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Production Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Only authenticated users can read/write their own patient data
    match /patients/{patientId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }

    // Only authenticated users can read/write their own appointments
    match /appointments/{appointmentId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }

    // Doctors can read/write reports
    match /reports/{reportId} {
      allow read: if request.auth.uid in resource.data.allowedUsers;
      allow write: if request.auth.token.claims.role == "doctor";
    }

    // Admins can read/write everything
    match /{document=**} {
      allow read, write: if request.auth.token.claims.admin == true;
    }
  }
}
```

---

## 2️⃣ Performance Optimization

### Cache Queries:
```javascript
import { enableIndexedDbPersistence } from "firebase/firestore";

export const enableOfflineMode = async () => {
  try {
    await enableIndexedDbPersistence(db);
    console.log("Offline persistence enabled");
  } catch (err) {
    if (err.code === 'failed-precondition') {
      console.log("Multiple tabs open");
    } else if (err.code === 'unimplemented') {
      console.log("Not supported");
    }
  }
};
```

### Pagination:
```javascript
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs
} from "firebase/firestore";

export const getPaginatedPatients = async (pageSize = 10, lastVisible = null) => {
  try {
    let q;

    if (!lastVisible) {
      // First page
      q = query(
        collection(db, "patients"),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    } else {
      // Next pages
      q = query(
        collection(db, "patients"),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(q);
    const patients = [];
    let newLastVisible = null;

    querySnapshot.forEach((doc) => {
      patients.push({
        id: doc.id,
        ...doc.data()
      });
      newLastVisible = doc;
    });

    return {
      success: true,
      data: patients,
      lastVisible: newLastVisible
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

**Usage:**
```javascript
const [patients, setPatients] = useState([]);
const [lastVisible, setLastVisible] = useState(null);

const loadMore = async () => {
  const result = await getPaginatedPatients(10, lastVisible);
  if (result.success) {
    setPatients([...patients, ...result.data]);
    setLastVisible(result.lastVisible);
  }
};
```

---

## 3️⃣ Error Handling

```javascript
export const handleFirebaseError = (error) => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'User not found. Please register.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'Email is already registered.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'permission-denied':
      return 'You do not have permission to access this.';
    case 'not-found':
      return 'Document not found.';
    case 'already-exists':
      return 'Document already exists.';
    default:
      return error.message || 'An error occurred.';
  }
};
```

---

## 4️⃣ Data Validation

```javascript
// Validation schema
export const validatePatientData = (data) => {
  const errors = {};

  if (!data.name || data.name.trim() === '') {
    errors.name = 'Name is required';
  }

  if (!data.email || !data.email.includes('@')) {
    errors.email = 'Valid email is required';
  }

  if (!data.phone || data.phone.length < 10) {
    errors.phone = 'Valid phone number is required';
  }

  if (data.age && (data.age < 0 || data.age > 150)) {
    errors.age = 'Age must be between 0 and 150';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Usage:
const { isValid, errors } = validatePatientData(formData);
if (!isValid) {
  console.log(errors);
}
```

---

## 5️⃣ Loading States & Error Messages

```javascript
import { useState } from "react";

export default function PatientsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const showNotification = (message, type) => {
    if (type === 'error') {
      setError(message);
      setTimeout(() => setError(null), 5000);
    } else if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  return (
    <div>
      {error && (
        <div style={{
          padding: "10px",
          backgroundColor: "#f8d7da",
          color: "#721c24",
          borderRadius: "4px",
          marginBottom: "10px"
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: "10px",
          backgroundColor: "#d4edda",
          color: "#155724",
          borderRadius: "4px",
          marginBottom: "10px"
        }}>
          ✅ {success}
        </div>
      )}

      {loading && <p>Loading...</p>}
    </div>
  );
}
```

---

## 6️⃣ Custom Hooks for Common Operations

```javascript
// hooks/useFirestore.js
import { useState } from "react";
import { handleFirebaseError } from "../firebase/errorHandler";

export const useFirestore = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeOperation = async (operation) => {
    setLoading(true);
    setError(null);
    try {
      const result = await operation();
      return result;
    } catch (err) {
      const errorMessage = handleFirebaseError(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, executeOperation };
};

// Usage:
const { loading, error, executeOperation } = useFirestore();

const handleAdd = async () => {
  await executeOperation(() => addPatient(data));
};
```

---

## 7️⃣ Environment Variables

Create `.env.local`:
```
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

Update `src/firebase/config.js`:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

---

## 8️⃣ Checklist

### Before Going to Production:

✅ Change security rules from test mode to production rules
✅ Enable authentication methods (Email/Password, Google, etc.)
✅ Set up proper error handling
✅ Add input validation
✅ Use environment variables for config
✅ Enable offline persistence
✅ Set up monitoring and logging
✅ Test all CRUD operations
✅ Review security rules
✅ Set up backup strategy

### Monitoring:

1. Go to **Firebase Console** → **Firestore** → **Usage**
2. Monitor read/write operations
3. Check for suspicious activity

---

## 9️⃣ Common Issues & Solutions

### Issue: "Permission denied" error
**Solution:** Check Firestore security rules. Ensure user is authenticated.

### Issue: Slow queries
**Solution:** Create indexes in Firestore for commonly filtered fields.

### Issue: "Too many requests"
**Solution:** Add pagination. Implement caching.

### Issue: Data not syncing
**Solution:** Check internet connection. Verify real-time listener is active.

---

## Resources:

- 📚 [Firebase Docs](https://firebase.google.com/docs)
- 📚 [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- 📚 [Firebase Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- 📚 [React + Firebase Patterns](https://www.freecodecamp.org/news/react-and-firebase-databases/)

---

✅ You've completed the Firebase guide!
🎉 You're ready to build production-ready apps!
