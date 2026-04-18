import React, { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import PatientTable from "./PatientTable";
import Pagination from "./Pagination";

function PatientDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('http://localhost:5201/api/Appointments');
        const appointments = await response.json();

        // Group appointments by patientId to get unique patients with their last visit
        const patientMap = {};
        appointments.forEach(apt => {
          const pid = apt.patientId || apt.patientName;
          const aptDate = new Date(apt.appointmentDate);

          if (!patientMap[pid] || aptDate > new Date(patientMap[pid].lastVisitDate)) {
            patientMap[pid] = {
              patientId: apt.patientId,
              name: apt.patientName,
              phone: apt.phone || 'N/A',
              lastVisitDate: apt.appointmentDate,
              date: aptDate.toLocaleDateString('en-CA'), // YYYY-MM-DD format
            };
          }
        });

        // Convert to array sorted by last visit (most recent first)
        const uniquePatients = Object.values(patientMap)
          .sort((a, b) => new Date(b.lastVisitDate) - new Date(a.lastVisitDate));

        setPatients(uniquePatients);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-6" style={{ marginLeft: 0 }}>
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading patients...</div>
        ) : (
          <PatientTable patients={filteredPatients} />
        )}
        <Pagination />
      </main>
    </div>
  );
}

export default PatientDashboard;
