import React, { useState } from "react";

function MaintenanceTasks() {
  const [tasks] = useState([
    { id: 1, task: "Replace sterilizer gasket", category: "Equipment", due: "2025-11-15", status: "Scheduled" },
    { id: 2, task: "Air filter cleaning", category: "HVAC", due: "2025-12-01", status: "Pending" },
  ]);

  return (
    <div className="section-card">
      <h2 className="section-title">Maintenance Tasks</h2>
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Category</th>
            <th>Due Date</th>
            <th>Status</th>
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

export default MaintenanceTasks;