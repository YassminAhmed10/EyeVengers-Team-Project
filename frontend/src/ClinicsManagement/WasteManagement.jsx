import React, { useState } from "react";

function WasteManagement() {
  const [waste] = useState([
    { id: 1, type: "Biohazard", schedule: "Mon & Thu", last: "2025-10-24", next: "2025-10-27" },
    { id: 2, type: "Sharps", schedule: "Weekly", last: "2025-10-23", next: "2025-10-30" },
  ]);

  return (
    <div className="section-card">
      <h2 className="section-title">Waste Management</h2>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Schedule</th>
            <th>Last Collected</th>
            <th>Next Collection</th>
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

export default WasteManagement;