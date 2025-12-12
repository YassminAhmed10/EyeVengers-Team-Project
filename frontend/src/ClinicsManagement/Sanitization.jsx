import React, { useState } from "react";

function Sanitization() {
  const [areas] = useState([
    { id: 1, area: "Exam Room", frequency: "Daily", last: "2025-10-26", next: "2025-10-27", status: "Done" },
    { id: 2, area: "Waiting Room", frequency: "Daily", last: "2025-10-26", next: "2025-10-27", status: "Pending" },
  ]);

  return (
    <div className="section-card">
      <h2 className="section-title">Sanitization</h2>
      <table>
        <thead>
          <tr>
            <th>Area</th>
            <th>Frequency</th>
            <th>Last Cleaned</th>
            <th>Next Cleaning</th>
            <th>Status</th>
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

export default Sanitization;