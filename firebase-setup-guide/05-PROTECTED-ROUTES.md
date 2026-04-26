# Protected Routes & Advanced Features

## Part 1: Create Protected Route Component

Create file: `src/components/ProtectedRoute.jsx`

```javascript
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Show loading while checking auth state
  if (loading) {
    return <div>Loading...</div>;
  }

  // If user is NOT logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in, show the page
  return children;
}
```

---

## Part 2: Real-time Updates with Listeners

Create file: `src/firebase/firestoreListeners.js`

```javascript
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "./config";

// ✅ Listen to real-time updates of ALL patients
export const subscribeToPatients = (callback) => {
  const unsubscribe = onSnapshot(collection(db, "patients"), (querySnapshot) => {
    const patients = [];
    querySnapshot.forEach((doc) => {
      patients.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(patients);
  });

  // Return unsubscribe function to stop listening
  return unsubscribe;
};

// ✅ Listen to real-time updates of specific patient's appointments
export const subscribeToUserAppointments = (userId, callback) => {
  const q = query(
    collection(db, "appointments"),
    where("patientId", "==", userId)
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const appointments = [];
    querySnapshot.forEach((doc) => {
      appointments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(appointments);
  });

  return unsubscribe;
};

// ✅ Listen to real-time updates of reports
export const subscribeToReports = (patientId, callback) => {
  const q = query(
    collection(db, "reports"),
    where("patientId", "==", patientId)
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const reports = [];
    querySnapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(reports);
  });

  return unsubscribe;
};
```

**Usage in Component:**

```javascript
import { useEffect, useState } from "react";
import { subscribeToPatients } from "../firebase/firestoreListeners";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToPatients((data) => {
      setPatients(data);
    });

    // Cleanup subscription when component unmounts
    return unsubscribe;
  }, []);

  return (
    <div>
      <h2>Patients ({patients.length})</h2>
      {patients.map((patient) => (
        <div key={patient.id}>
          <p>{patient.name}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Part 3: Upload Files to Firebase Storage

Create file: `src/firebase/storage.js`

```javascript
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll
} from "firebase/storage";
import { storage } from "./config";

// ✅ Upload file
export const uploadReportFile = async (file, patientId, reportId) => {
  try {
    // Create a reference (path) where file will be stored
    const fileRef = ref(storage, `reports/${patientId}/${reportId}/${file.name}`);

    // Upload file
    const snapshot = await uploadBytes(fileRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      success: true,
      url: downloadURL,
      message: "File uploaded successfully"
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// ✅ Get download URL
export const getFileURL = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    const downloadURL = await getDownloadURL(fileRef);
    return {
      success: true,
      url: downloadURL
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// ✅ Delete file
export const deleteReportFile = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    return {
      success: true,
      message: "File deleted successfully"
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// ✅ List all files in a folder
export const listReportFiles = async (patientId, reportId) => {
  try {
    const folderRef = ref(storage, `reports/${patientId}/${reportId}`);
    const fileList = await listAll(folderRef);

    const files = [];
    for (const file of fileList.items) {
      const url = await getDownloadURL(file);
      files.push({
        name: file.name,
        path: file.fullPath,
        url: url
      });
    }

    return {
      success: true,
      files: files
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

**Usage - Upload Report:**

```javascript
import { useState } from "react";
import { uploadReportFile } from "../firebase/storage";
import { addPatient } from "../firebase/firestore";

export default function UploadReportPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);

    // Upload file to storage
    const uploadResult = await uploadReportFile(file, "patient1", "report1");

    if (uploadResult.success) {
      // Save report info in Firestore
      const reportData = {
        patientId: "patient1",
        fileURL: uploadResult.url,
        fileName: file.name,
        uploadedDate: new Date().toISOString(),
        findings: "Normal"
      };

      const firestoreResult = await addPatient(reportData);

      if (firestoreResult.success) {
        alert("Report uploaded successfully!");
        setFile(null);
      }
    }

    setUploading(false);
  };

  return (
    <div>
      <h2>Upload Report</h2>
      <form onSubmit={handleUploadReport}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          accept=".pdf,.jpg,.png"
          required
        />
        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}
```

---

## Part 4: Batch Operations

```javascript
import { writeBatch, doc, collection } from "firebase/firestore";
import { db } from "./config";

// ✅ Add multiple patients at once
export const addMultiplePatients = async (patientsList) => {
  try {
    const batch = writeBatch(db);

    patientsList.forEach((patient) => {
      const newDocRef = doc(collection(db, "patients"));
      batch.set(newDocRef, {
        ...patient,
        createdAt: new Date().toISOString()
      });
    });

    await batch.commit();

    return {
      success: true,
      message: `${patientsList.length} patients added successfully`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// ✅ Update multiple documents
export const updateMultipleAppointments = async (appointmentIds, updateData) => {
  try {
    const batch = writeBatch(db);

    appointmentIds.forEach((id) => {
      const docRef = doc(db, "appointments", id);
      batch.update(docRef, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });
    });

    await batch.commit();

    return {
      success: true,
      message: "Appointments updated successfully"
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

---

## Part 5: Error Handling Component

```javascript
import { useState } from "react";

export default function ErrorBoundary({ children }) {
  const [error, setError] = useState(null);

  if (error) {
    return (
      <div style={{
        padding: "20px",
        backgroundColor: "#f8d7da",
        border: "1px solid #f5c6cb",
        borderRadius: "4px",
        color: "#721c24"
      }}>
        <h3>⚠️ Something went wrong</h3>
        <p>{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: "10px 20px" }}
        >
          Reload Page
        </button>
      </div>
    );
  }

  return children;
}
```

---

## Summary - Advanced Features:

✅ Protected Routes (ProtectedRoute.jsx)
✅ Real-time Listeners (subscribe to updates)
✅ File Storage (upload/download)
✅ Batch Operations (update multiple docs)
✅ Error Handling

**Next Step:** Go to `06-BEST-PRACTICES.md`!
