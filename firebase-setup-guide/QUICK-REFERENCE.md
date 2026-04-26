# 📋 Firebase + React - Quick Reference

## Installation

```bash
npm install firebase
```

---

## 1. Firebase Config (`src/firebase/config.js`)

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

## 2. Authentication Functions

### Register
```javascript
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export const registerUser = async (email, password, name) => {
  const user = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user.user, { displayName: name });
  return user.user;
};
```

### Login
```javascript
import { signInWithEmailAndPassword } from "firebase/auth";

export const loginUser = async (email, password) => {
  const user = await signInWithEmailAndPassword(auth, email, password);
  return user.user;
};
```

### Logout
```javascript
import { signOut } from "firebase/auth";

export const logoutUser = async () => {
  await signOut(auth);
};
```

---

## 3. AuthContext

```javascript
import { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};
```

---

## 4. Custom Hook

```javascript
import { useContext } from "react";

export const useAuth = () => {
  return useContext(AuthContext);
};
```

---

## 5. Protected Routes

```javascript
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}
```

---

## 6. CRUD Operations

### Create
```javascript
import { collection, addDoc } from "firebase/firestore";

const addPatient = async (data) => {
  const docRef = await addDoc(collection(db, "patients"), data);
  return docRef.id;
};
```

### Read All
```javascript
import { collection, getDocs } from "firebase/firestore";

const getAllPatients = async () => {
  const snapshot = await getDocs(collection(db, "patients"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

### Read One
```javascript
import { doc, getDoc } from "firebase/firestore";

const getPatientById = async (id) => {
  const docSnap = await getDoc(doc(db, "patients", id));
  return { id: docSnap.id, ...docSnap.data() };
};
```

### Update
```javascript
import { doc, updateDoc } from "firebase/firestore";

const updatePatient = async (id, data) => {
  await updateDoc(doc(db, "patients", id), data);
};
```

### Delete
```javascript
import { doc, deleteDoc } from "firebase/firestore";

const deletePatient = async (id) => {
  await deleteDoc(doc(db, "patients", id));
};
```

---

## 7. Real-time Listener

```javascript
import { collection, onSnapshot } from "firebase/firestore";

export const subscribeToPatients = (callback) => {
  const unsubscribe = onSnapshot(collection(db, "patients"), (snapshot) => {
    const patients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(patients);
  });
  return unsubscribe;
};

// Usage:
useEffect(() => {
  const unsubscribe = subscribeToPatients(setPatients);
  return unsubscribe;
}, []);
```

---

## 8. File Upload

```javascript
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const uploadFile = async (file, path) => {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  return url;
};
```

---

## 9. Query (Filter/Search)

```javascript
import { collection, query, where, getDocs } from "firebase/firestore";

const searchPatients = async (name) => {
  const q = query(
    collection(db, "patients"),
    where("name", "==", name)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

---

## 10. Batch Operations

```javascript
import { writeBatch, doc, collection } from "firebase/firestore";

const batchAddPatients = async (patientsList) => {
  const batch = writeBatch(db);
  patientsList.forEach(patient => {
    const newRef = doc(collection(db, "patients"));
    batch.set(newRef, patient);
  });
  await batch.commit();
};
```

---

## Common Patterns

### Form Submission with Validation
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!email || !password) {
    setError("All fields required");
    return;
  }
  try {
    await loginUser(email, password);
  } catch (err) {
    setError(err.message);
  }
};
```

### Loading States
```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleAdd = async (data) => {
  setLoading(true);
  try {
    await addPatient(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

---

## Security Rules

### Allow authenticated users only
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

---

## Environment Variables

Create `.env.local`:
```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

Use in config:
```javascript
apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
```

---

## Firestore Data Structure Example

```json
{
  "patients": {
    "patient1": {
      "name": "Ahmed Hassan",
      "email": "ahmed@example.com",
      "phone": "01012345678",
      "age": 45,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  },
  "appointments": {
    "apt1": {
      "patientId": "patient1",
      "date": "2024-01-20",
      "time": "10:00",
      "status": "confirmed"
    }
  }
}
```

---

## Debugging Tips

1. **Check Console**: Press F12 → Console
2. **Check Firebase Console**: See if data is being saved
3. **Check Network Tab**: See API calls
4. **Add Console Logs**: `console.log(data)`
5. **Use Debugger**: Add `debugger;` in code

---

## Performance Tips

- Use pagination for large datasets
- Add indexes for frequently filtered fields
- Enable offline persistence
- Unsubscribe from listeners when component unmounts
- Use batch operations for multiple writes
- Cache frequently accessed data

---

## Resources

- 📖 [Firebase Docs](https://firebase.google.com/docs)
- 📖 [React Firebase Patterns](https://github.com/garylachman/react-firebase-interactions)
- 📖 [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

**Print this for quick reference!** 🖨️
