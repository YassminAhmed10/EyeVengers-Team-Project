import React from "react";

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

export default Reports;