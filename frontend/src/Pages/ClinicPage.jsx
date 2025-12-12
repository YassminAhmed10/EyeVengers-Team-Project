import React, { useState } from "react";
import "./Clinic.css";

function Equipment() {
  const equipment = [
    { id: 1, name: "Slit Lamp", type: "Diagnostic", status: "Working", last: "2025-09-12", next: "2026-03-12" },
    { id: 2, name: "Phoropter", type: "Refraction", status: "Needs Calibration", last: "2025-05-01", next: "2025-11-01" },
    { id: 3, name: "OCT Machine", type: "Imaging", status: "Working", last: "2025-08-15", next: "2026-02-15" },
  ];

  return (
    <div className="section-card">
      <h2 className="section-title">Ophthalmic Equipment</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th><th>Type</th><th>Status</th><th>Last Maintenance</th><th>Next Maintenance</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map((item) => (
            <tr key={item.id} className={item.status !== "Working" ? "attention" : ""}>
              <td>{item.name}</td>
              <td>{item.type}</td>
              <td>{item.status}</td>
              <td>{item.last}</td>
              <td>{item.next}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Sanitization() {
  const areas = [
    { id: 1, area: "Exam Room", frequency: "Daily", last: "2025-10-26", next: "2025-10-27", status: "Done" },
    { id: 2, area: "Waiting Room", frequency: "Daily", last: "2025-10-26", next: "2025-10-27", status: "Pending" },
  ];

  return (
    <div className="section-card">
      <h2 className="section-title">Sanitization</h2>
      <table>
        <thead>
          <tr>
            <th>Area</th><th>Frequency</th><th>Last Cleaned</th><th>Next Cleaning</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {areas.map((a) => (
            <tr key={a.id} className={a.status === "Pending" ? "attention" : ""}>
              <td>{a.area}</td>
              <td>{a.frequency}</td>
              <td>{a.last}</td>
              <td>{a.next}</td>
              <td>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Supplies() {
  const supplies = [
    { id: 1, name: "Gloves", qty: 8, reorder: 5, supplier: "MediSupply" },
    { id: 2, name: "Syringes", qty: 1, reorder: 3, supplier: "MedEx" },
  ];

  return (
    <div className="section-card">
      <h2 className="section-title">Supplies</h2>
      <table>
        <thead>
          <tr>
            <th>Item</th><th>Quantity</th><th>Reorder Level</th><th>Supplier</th>
          </tr>
        </thead>
        <tbody>
          {supplies.map((s) => (
            <tr key={s.id} className={s.qty <= s.reorder ? "low-stock" : ""}>
              <td>{s.name}</td>
              <td>{s.qty}</td>
              <td>{s.reorder}</td>
              <td>{s.supplier}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MaintenanceTasks() {
  const tasks = [
    { id: 1, task: "Replace sterilizer gasket", category: "Equipment", due: "2025-11-15", status: "Scheduled" },
    { id: 2, task: "Air filter cleaning", category: "HVAC", due: "2025-12-01", status: "Pending" },
  ];

  return (
    <div className="section-card">
      <h2 className="section-title">Maintenance Tasks</h2>
      <table>
        <thead>
          <tr>
            <th>Task</th><th>Category</th><th>Due Date</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id} className={t.status === "Pending" ? "attention" : ""}>
              <td>{t.task}</td>
              <td>{t.category}</td>
              <td>{t.due}</td>
              <td>{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WasteManagement() {
  const waste = [
    { id: 1, type: "Biohazard", schedule: "Mon & Thu", last: "2025-10-24", next: "2025-10-27" },
    { id: 2, type: "Sharps", schedule: "Weekly", last: "2025-10-23", next: "2025-10-30" },
  ];

  return (
    <div className="section-card">
      <h2 className="section-title">Waste Management</h2>
      <table>
        <thead>
          <tr>
            <th>Type</th><th>Schedule</th><th>Last Collected</th><th>Next Collection</th>
          </tr>
        </thead>
        <tbody>
          {waste.map((w) => (
            <tr key={w.id}>
              <td>{w.type}</td>
              <td>{w.schedule}</td>
              <td>{w.last}</td>
              <td>{w.next}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Reports() {
  const summary = {
    equipment: 2,
    pendingSanitization: 1,
    lowSupplies: 1,
    maintenanceTasks: 2,
  };

  return (
    <div className="section-card">
      <h2 className="section-title">Reports</h2>
      <div className="report-grid">
        <div className="report-card">Equipment Alerts: {summary.equipment}</div>
        <div className="report-card">Pending Sanitization: {summary.pendingSanitization}</div>
        <div className="report-card">Low Supplies: {summary.lowSupplies}</div>
        <div className="report-card">Maintenance Tasks: {summary.maintenanceTasks}</div>
      </div>
    </div>
  );
}

function ClinicPage() {
  const [activeSection, setActiveSection] = useState("equipment");

  const renderSection = () => {
    switch (activeSection) {
      case "equipment":
        return <Equipment />;
      case "sanitization":
        return <Sanitization />;
      case "supplies":
        return <Supplies />;
      case "maintenance":
        return <MaintenanceTasks />;
      case "waste":
        return <WasteManagement />;
      case "reports":
        return <Reports />;
      default:
        return <Equipment />;
    }
  };

  const navigationItems = [
    { key: "equipment", label: "Ophthalmic Equipment", icon: "medical_services" },
    { key: "sanitization", label: "Sterilization", icon: "clean_hands" },
    { key: "supplies", label: "Medical Supplies", icon: "medical_information" },
    { key: "maintenance", label: "Maintenance", icon: "engineering" },
    { key: "waste", label: "Waste Management", icon: "delete" },
    { key: "reports", label: "Reports", icon: "assessment" }
  ];

  return (
    <div className="app-container">
      <div className="clinic-operations-container" style={{ marginLeft: 0 }}>
        <div className="operations-header">
          <div className="header-content">
            <h1>Clinic System</h1>

            <nav className="operations-nav">
              {navigationItems.map((item) => (
                <button
                  key={item.key}
                  className={`nav-item ${activeSection === item.key ? "active" : ""}`}
                  onClick={() => setActiveSection(item.key)}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <main className="operations-main">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}

export default ClinicPage;