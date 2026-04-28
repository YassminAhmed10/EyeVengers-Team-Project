import React from 'react';

const CustomerHistory = ({ customerId }) => {
  // Mock data for each customer
  const customerHistory = {
    1: [ // Doha
      { id: 1, date: '2024-01-15', type: 'Purchase', items: 'Aspirin, Vitamin C', total: 25.99 },
      { id: 2, date: '2024-01-10', type: 'Prescription', items: 'Amoxicillin', total: 45.00 },
      { id: 3, date: '2024-01-05', type: 'Purchase', items: 'Pain Relief', total: 12.50 },
    ],
    2: [ // Waleed
      { id: 1, date: '2024-01-14', type: 'Purchase', items: 'Ibuprofen, Paracetamol', total: 18.50 },
      { id: 2, date: '2024-01-08', type: 'Prescription', items: 'Vitamin D', total: 30.00 },
    ],
    3: [ // Myrna
      { id: 1, date: '2024-01-16', type: 'Purchase', items: 'Vitamin C, Zinc', total: 22.00 },
      { id: 2, date: '2024-01-12', type: 'Purchase', items: 'Antibiotics', total: 35.00 },
      { id: 3, date: '2024-01-06', type: 'Prescription', items: 'Blood Pressure Meds', total: 50.00 },
    ],
    4: [ // Ahmed
      { id: 1, date: '2024-01-13', type: 'Purchase', items: 'Pain Relief', total: 15.00 },
    ],
    5: [ // Maysoun
      { id: 1, date: '2024-01-15', type: 'Prescription', items: 'Allergy Meds', total: 28.00 },
      { id: 2, date: '2024-01-09', type: 'Purchase', items: 'Eye Drops', total: 12.00 },
    ],
    6: [ // Hassan
      { id: 1, date: '2024-01-14', type: 'Purchase', items: 'Supplements', total: 40.00 },
      { id: 2, date: '2024-01-07', type: 'Purchase', items: 'Cough Syrup', total: 8.50 },
    ],
    7: [ // Zeina
      { id: 1, date: '2024-01-16', type: 'Purchase', items: 'Skincare Products', total: 55.00 },
    ],
    8: [ // Mohamed
      { id: 1, date: '2024-01-15', type: 'Prescription', items: 'Diabetes Meds', total: 75.00 },
      { id: 2, date: '2024-01-11', type: 'Purchase', items: 'Glucometer', total: 35.00 },
    ],
    9: [ // Yasmmin
      { id: 1, date: '2024-01-10', type: 'Purchase', items: 'Baby Care', total: 45.00 },
    ],
    10: [ // Hassan (2)
      { id: 1, date: '2024-01-12', type: 'Purchase', items: 'First Aid Kit', total: 20.00 },
      { id: 2, date: '2024-01-04', type: 'Prescription', items: 'Antibiotics', total: 32.00 },
    ],
  };

  const history = customerHistory[customerId] || [];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Purchase History
      </h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Items</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id}>
                <td>{item.date}</td>
                <td>
                  <span className={`status-badge ${item.type === 'Prescription' ? 'status-info' : 'status-success'}`}>
                    {item.type}
                  </span>
                </td>
                <td>{item.items}</td>
                <td>${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerHistory;

