import React, { useState } from 'react';
import { useMedicalRecord } from '../../hooks/useMedicalRecord';
import Equipment from "./Equipment";
import Sanitization from "./Sanitization";
import Supplies from "./Supplies";
import MaintenanceTasks from "./MaintenanceTasks";
import WasteManagement from "./WasteManagement";
import Reports from "./Reports";

function ClinicOperations() {
  const { saveData, loading, error } = useMedicalRecord(patientId);
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

  

nction
    return \(
    <>
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

      <main className="operations-main">
        {renderSection()}
      </main>
    </>
  );
}

export default ClinicOperations;
