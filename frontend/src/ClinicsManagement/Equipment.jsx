import React, { useState } from "react";

function Equipment() {
  const [equipment] = useState([
    { id: 1, name: "Slit Lamp", type: "Diagnostic", status: "Working", last: "2025-09-12", next: "2026-03-12" },
    { id: 2, name: "Phoropter", type: "Refraction", status: "Needs Calibration", last: "2025-05-01", next: "2025-11-01" },
    { id: 3, name: "OCT Machine", type: "Imaging", status: "Working", last: "2025-08-15", next: "2026-02-15" },
  ]);

  return (
    <div className="section-card">
      <h2 className="section-title">Ophthalmic Equipment</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Status</th>
            <th>Last Maintenance</th>
            <th>Next Maintenance</th>
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

export default Equipment;