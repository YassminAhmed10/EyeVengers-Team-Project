# Firestore Database - CRUD Operations

## Part 1: Create Firestore Functions

Create file: `src/firebase/firestore.js`

```javascript
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "./config";

// ✅ CREATE - Add new document
export const addPatient = async (patientData) => {
  try {
    const docRef = await addDoc(collection(db, "patients"), {
      ...patientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return {
      success: true,
      id: docRef.id,
      message: "Patient added successfully"
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// ✅ READ - Get all documents from a collection
export const getAllPatients = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "patients"));
    const patients = [];

    querySnapshot.forEach((doc) => {
      patients.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      data: patients
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// ✅ READ - Get single document by ID
export const getPatientById = async (patientId) => {
  try {
    const docRef = doc(db, "patients", patientId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: {
          id: docSnap.id,
          ...docSnap.data()
        }
      };
    } else {
      return {
        success: false,
        error: "Patient not found"
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// ✅ READ - Get documents with WHERE condition
export const getPatientsByEmail = async (email) => {
  try {
    const q = query(
      collection(db, "patients"),
      where("email", "==", email)
    );

    const querySnapshot = await getDocs(q);
    const patients = [];

    querySnapshot.forEach((doc) => {
      patients.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      data: patients
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// ✅ READ - Get recent documents with sorting and limit
export const getRecentPatients = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, "patients"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const patients = [];

    querySnapshot.forEach((doc) => {
      patients.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      data: patients
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// ✅ UPDATE - Update existing document
export const updatePatient = async (patientId, updatedData) => {
  try {
    const docRef = doc(db, "patients", patientId);
    await updateDoc(docRef, {
      ...updatedData,
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: "Patient updated successfully"
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// ✅ DELETE - Delete document
export const deletePatient = async (patientId) => {
  try {
    const docRef = doc(db, "patients", patientId);
    await deleteDoc(docRef);

    return {
      success: true,
      message: "Patient deleted successfully"
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

## Part 2: Create Database Schema Example

**Recommended Firestore Structure:**

```
firestore/
├── patients/
│   ├── patient1 (document)
│   │   ├── name: "Ahmed Hassan"
│   │   ├── email: "ahmed@example.com"
│   │   ├── phone: "01012345678"
│   │   ├── age: 45
│   │   ├── gender: "Male"
│   │   ├── medicalHistory: "No known allergies"
│   │   ├── createdAt: "2024-01-15T10:00:00Z"
│   │   └── updatedAt: "2024-01-15T10:00:00Z"
│   └── patient2 (document)
│
├── appointments/
│   ├── apt1 (document)
│   │   ├── patientId: "patient1"
│   │   ├── doctorId: "doctor1"
│   │   ├── date: "2024-01-20"
│   │   ├── time: "10:00"
│   │   ├── scanType: "MRI"
│   │   ├── status: "confirmed"
│   │   └── createdAt: "2024-01-15T10:00:00Z"
│   └── apt2
│
├── reports/
│   ├── report1
│   │   ├── patientId: "patient1"
│   │   ├── appointmentId: "apt1"
│   │   ├── findings: "Normal study"
│   │   ├── impression: "No abnormalities"
│   │   ├── radiologistName: "Dr. Smith"
│   │   └── uploadedDate: "2024-01-20T14:00:00Z"
│   └── report2
│
└── doctors/
    ├── doctor1
    │   ├── name: "Dr. Smith"
    │   ├── specialization: "Radiology"
    │   ├── email: "doctor@clinic.com"
    │   └── phone: "01087654321"
    └── doctor2
```

---

## Part 3: Create Patient Management Component

Create file: `src/pages/PatientsPage.jsx`

```javascript
import { useState, useEffect } from "react";
import {
  getAllPatients,
  addPatient,
  updatePatient,
  deletePatient
} from "../firebase/firestore";
import { useAuth } from "../hooks/useAuth";

export default function PatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "Male",
    medicalHistory: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  // Fetch patients when component loads
  useEffect(() => {
    fetchPatients();
  }, []);

  // ✅ Fetch all patients
  const fetchPatients = async () => {
    setLoading(true);
    const result = await getAllPatients();
    if (result.success) {
      setPatients(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  // ✅ Add new patient
  const handleAddPatient = async (e) => {
    e.preventDefault();
    setError("");

    // Validate
    if (!formData.name || !formData.email || !formData.phone) {
      setError("Please fill all required fields");
      return;
    }

    // Add patient
    if (editingId) {
      const result = await updatePatient(editingId, formData);
      if (result.success) {
        setEditingId(null);
        fetchPatients();
      } else {
        setError(result.error);
      }
    } else {
      const result = await addPatient(formData);
      if (result.success) {
        fetchPatients();
      } else {
        setError(result.error);
      }
    }

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      age: "",
      gender: "Male",
      medicalHistory: ""
    });
  };

  // ✅ Edit patient
  const handleEditPatient = (patient) => {
    setEditingId(patient.id);
    setFormData(patient);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Delete patient
  const handleDeletePatient = async (patientId) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      const result = await deletePatient(patientId);
      if (result.success) {
        fetchPatients();
      } else {
        setError(result.error);
      }
    }
  };

  if (loading) return <div>Loading patients...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h1>Patients Management</h1>
      <p>Welcome, {user?.displayName || user?.email}</p>

      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

      {/* Add/Edit Form */}
      <form onSubmit={handleAddPatient} style={{ marginBottom: "30px" }}>
        <h3>{editingId ? "Edit Patient" : "Add New Patient"}</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{ padding: "8px" }}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ padding: "8px" }}
            required
          />

          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            style={{ padding: "8px" }}
            required
          />

          <input
            type="number"
            placeholder="Age"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            style={{ padding: "8px" }}
          />

          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            style={{ padding: "8px" }}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="text"
            placeholder="Medical History"
            value={formData.medicalHistory}
            onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
            style={{ padding: "8px" }}
          />
        </div>

        <div style={{ marginTop: "15px" }}>
          <button type="submit" style={{ padding: "10px 20px", marginRight: "10px" }}>
            {editingId ? "Update Patient" : "Add Patient"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  age: "",
                  gender: "Male",
                  medicalHistory: ""
                });
              }}
              style={{ padding: "10px 20px", backgroundColor: "gray" }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Patients Table */}
      <h3>Patients List ({patients.length})</h3>

      {patients.length === 0 ? (
        <p>No patients found</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ border: "1px solid #ddd", padding: "10px" }}>Name</th>
              <th style={{ border: "1px solid #ddd", padding: "10px" }}>Email</th>
              <th style={{ border: "1px solid #ddd", padding: "10px" }}>Phone</th>
              <th style={{ border: "1px solid #ddd", padding: "10px" }}>Age</th>
              <th style={{ border: "1px solid #ddd", padding: "10px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>{patient.name}</td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>{patient.email}</td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>{patient.phone}</td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>{patient.age}</td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  <button
                    onClick={() => handleEditPatient(patient)}
                    style={{ marginRight: "5px", padding: "5px 10px" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePatient(patient.id)}
                    style={{ padding: "5px 10px", backgroundColor: "red", color: "white" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

---

## Summary CRUD Operations:

| Operation | Function | Purpose |
|-----------|----------|---------|
| **CREATE** | `addDoc()` | Add new document |
| **READ** | `getDocs()` | Get all documents |
| **READ** | `getDoc()` | Get single document |
| **READ** | `query()` | Filter documents |
| **UPDATE** | `updateDoc()` | Update document |
| **DELETE** | `deleteDoc()` | Delete document |

**Next Step:** Go to `05-PROTECTED-ROUTES.md` to secure pages!
