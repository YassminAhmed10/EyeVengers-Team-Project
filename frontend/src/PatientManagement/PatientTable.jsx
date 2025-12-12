import React from "react";
import { useNavigate } from "react-router-dom";

function PatientTable({ patients }) {
  const navigate = useNavigate();

  const handleViewRecord = (patient) => {
    navigate(`/doctor/view-medical-record/${encodeURIComponent(patient.name)}`);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-md mt-6 overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-600">
        <thead className="bg-blue-100 text-gray-800 uppercase text-xs font-semibold">
          <tr>
            <th className="px-6 py-3">Patient Name</th>
            <th className="px-6 py-3">Phone Number</th>
            <th className="px-6 py-3">Last Visit</th>
            <th className="px-6 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p, index) => (
            <tr
              key={index}
              className="border-b hover:bg-blue-50 transition-all duration-150"
            >
              <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
              <td className="px-6 py-4">{p.phone}</td>
              <td className="px-6 py-4">{p.date}</td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => handleViewRecord(p)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all"
                >
                  View Record
                </button>
              </td>
            </tr>
          ))}
          {patients.length === 0 && (
            <tr>
              <td
                colSpan="4"
                className="text-center py-6 text-gray-500 italic"
              >
                No patients found matching your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PatientTable;
