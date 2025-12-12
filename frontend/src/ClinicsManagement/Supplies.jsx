import React, { useState } from "react";

function Supplies() {
  const [supplies] = useState([
    { id: 1, name: "Gloves", qty: 8, reorder: 5, supplier: "MediSupply" },
    { id: 2, name: "Syringes", qty: 1, reorder: 3, supplier: "MedEx" },
  ]);

  return (
    <div className="section-card">
      <h2 className="section-title">Supplies</h2>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Reorder Level</th>
            <th>Supplier</th>
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

export default Supplies;