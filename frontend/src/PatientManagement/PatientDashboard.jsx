import React, { useState } from "react";
import PageHeader from "./PageHeader";
import SearchBar from "./SearchBar";
import PatientTable from "./PatientTable";
import Pagination from "./Pagination";

function PatientDashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  const initialPatients = [
    { name: "Doha Waleed", phone: "0103564787", date: "2023-10-26" },
    { name: "Zeina Mohamed", phone: "0113654786", date: "2023-10-25" },
    { name: "Myrna Ahmed", phone: "0124589741", date: "2023-10-24" },
    { name: "Maysoun Hassan", phone: "0154789650", date: "2023-10-23" },
    { name: "Yassmin Ahmed", phone: "01013427001", date: "2023-10-22" },
  ];

  const filteredPatients = initialPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-6" style={{ marginLeft: 0 }}>
        <PageHeader />
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <PatientTable patients={filteredPatients} />
        <Pagination />
      </main>
    </div>
  );
}

export default PatientDashboard;