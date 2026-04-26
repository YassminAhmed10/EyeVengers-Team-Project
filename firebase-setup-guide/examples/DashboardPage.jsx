// Complete Dashboard Page Example
// File: src/pages/DashboardPage.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logoutUser } from "../firebase/auth";
import {
  getAllPatients,
  addPatient,
  deletePatient,
  updatePatient
} from "../firebase/firestore";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: ""
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    const result = await getAllPatients();
    if (result.success) {
      setPatients(result.data);
    }
    setLoading(false);
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setError("Name and email are required");
      return;
    }

    if (editingId) {
      const result = await updatePatient(editingId, formData);
      if (result.success) {
        setEditingId(null);
        fetchPatients();
        setFormData({ name: "", email: "", phone: "", age: "" });
      }
    } else {
      const result = await addPatient(formData);
      if (result.success) {
        fetchPatients();
        setFormData({ name: "", email: "", phone: "", age: "" });
      }
    }
  };

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      navigate("/login");
    }
  };

  const dashboardStyle = {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto"
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    borderBottom: "2px solid #1f6bff",
    paddingBottom: "15px"
  };

  const formStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "20px"
  };

  const inputStyle = {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px"
  };

  const buttonStyle = {
    padding: "10px 20px",
    backgroundColor: "#1f6bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px"
  };

  const thStyle = {
    backgroundColor: "#f0f0f0",
    padding: "10px",
    border: "1px solid #ddd",
    textAlign: "left"
  };

  const tdStyle = {
    padding: "10px",
    border: "1px solid #ddd"
  };

  return (
    <div style={dashboardStyle}>
      <div style={headerStyle}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome, {user?.displayName || user?.email}</p>
        </div>
        <button onClick={handleLogout} style={{ ...buttonStyle, backgroundColor: "#dc3545" }}>
          Logout
        </button>
      </div>

      {error && (
        <div style={{ padding: "10px", backgroundColor: "#f8d7da", marginBottom: "15px" }}>
          {error}
        </div>
      )}

      <h2>{editingId ? "Edit Patient" : "Add New Patient"}</h2>
      <form onSubmit={handleAddPatient}>
        <div style={formStyle}>
          <input
            style={inputStyle}
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            style={inputStyle}
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            style={inputStyle}
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <input
            style={inputStyle}
            type="number"
            placeholder="Age"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          />
        </div>

        <button type="submit" style={buttonStyle}>
          {editingId ? "Update Patient" : "Add Patient"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData({ name: "", email: "", phone: "", age: "" });
            }}
            style={{ ...buttonStyle, marginLeft: "10px", backgroundColor: "gray" }}
          >
            Cancel
          </button>
        )}
      </form>

      <h2>Patients List</h2>
      {loading ? (
        <p>Loading...</p>
      ) : patients.length === 0 ? (
        <p>No patients yet</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Age</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td style={tdStyle}>{patient.name}</td>
                <td style={tdStyle}>{patient.email}</td>
                <td style={tdStyle}>{patient.phone}</td>
                <td style={tdStyle}>{patient.age}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => {
                      setEditingId(patient.id);
                      setFormData(patient);
                    }}
                    style={{ padding: "5px 10px", marginRight: "5px" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm("Delete this patient?")) {
                        await deletePatient(patient.id);
                        fetchPatients();
                      }
                    }}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
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
