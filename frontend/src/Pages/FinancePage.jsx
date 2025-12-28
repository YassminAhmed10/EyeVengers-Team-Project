import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Finance.css';

const FinancePage = () => {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const API_BASE_URL = 'http://localhost:5201/api';

  // Fetch invoices and expenses from backend
  useEffect(() => {
    if (!userRole) {
      navigate('/login');
      return;
    }
    
    fetchFinanceData();
  }, [dateRange]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch invoices (appointments with payment info)
      const invoicesResponse = await fetch(`${API_BASE_URL}/Appointments`);
      if (!invoicesResponse.ok) throw new Error('Failed to fetch invoices');
      const invoicesData = await invoicesResponse.json();
      
      // Transform appointments to invoices format
      const transformedInvoices = invoicesData.map(apt => ({
        id: apt.appointmentId || apt.id,
        patient: apt.patientName,
        doctor: `Dr. ${apt.doctorName || 'Mohab'}`,
        service: apt.reasonForVisit || 'Consultation',
        amount: apt.consultationFee || 250,
        status: apt.paymentStatus || 'Pending',
        payment: apt.paymentMethod || 'Cash',
        date: new Date(apt.appointmentDate).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })
      }));
      
      setInvoices(transformedInvoices);
      
      // For now, keep expenses as static until backend is ready
      setExpenses([
        { id: 'EXP-001', category: 'Medical Supplies', amount: 1200, date: 'Oct 20, 2023', addedBy: 'Admin', notes: 'Monthly supplies' },
        { id: 'EXP-002', category: 'Equipment', amount: 4500, date: 'Oct 15, 2023', addedBy: 'Admin', notes: 'New microscope' },
        { id: 'EXP-003', category: 'Utilities', amount: 800, date: 'Oct 10, 2023', addedBy: 'Manager', notes: 'Monthly bills' },
      ]);
      
    } catch (err) {
      console.error('Error fetching finance data:', err);
      setError(err.message);
      // Keep default data on error
      setInvoices([]);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const revenueExpenseData = [
    { month: 'Jan', revenue: 42000, expenses: 18000 },
    { month: 'Feb', revenue: 38000, expenses: 16000 },
    { month: 'Mar', revenue: 45000, expenses: 19000 },
    { month: 'Apr', revenue: 52000, expenses: 21000 },
    { month: 'May', revenue: 48000, expenses: 20000 },
    { month: 'Jun', revenue: 55000, expenses: 23000 },
  ];

  const paymentMethodsData = [
    { name: 'Cash', value: 35 },
    { name: 'Visa', value: 45 },
    { name: 'Insurance', value: 20 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const doctorsPayments = [
    { name: 'Dr. Emily Carter', totalRevenue: 45850, commission: 40, payable: 18330 },
    { name: 'Dr. Eva Adams', totalRevenue: 23950, commission: 40, payable: 9580 },
  ];

  const insuranceData = [
    { company: 'MediCare', pendingClaims: 12, totalCoverage: 25000 },
    { company: 'HealthPlus', pendingClaims: 8, totalCoverage: 18000 },
    { company: 'Blue Shield', pendingClaims: 5, totalCoverage: 15000 },
  ];

  const handleAddInvoice = () => {
    const newInvoice = {
      id: `RV-{String(invoices.length + 1).padStart(3, '0')}`,
      patient: 'New Patient',
      doctor: 'Dr. Carter',
      service: 'New Service',
      amount: 200,
      status: 'Pending',
      payment: 'Cash',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setInvoices([...invoices, newInvoice]);
  };

  const handleDeleteInvoice = (id) => {
    setInvoices(invoices.filter(invoice => invoice.id !== id));
  };

  const handleAddExpense = () => {
    const newExpense = {
      id: `EXP-{String(expenses.length + 1).padStart(3, '0')}`,
      category: 'New Category',
      amount: 1000,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      addedBy: 'Admin',
      notes: 'New expense'
    };
    setExpenses([...expenses, newExpense]);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const handleGeneratePDF = () => {
    alert('PDF report is being generated...');
  };

  const handleExportExcel = () => {
    alert('Exporting to Excel...');
  };

  const handlePrint = () => {
    window.print();
  };

  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const pendingInvoices = invoices.filter(inv => inv.status === 'Pending').length;

  if (!userRole) {
    navigate('/login');
    return null;
  }

  return (
    <div className="finance-container">
      <div className="finance-main-content" style={{ marginLeft: 0 }}>
        <header className="finance-header">
          <div>
            <h1 className="finance-title">Finance Overview</h1>
            <div className="date-selector">
              {['today', 'thisMonth', 'custom'].map(range => (
                <button
                  key={range}
                  className={`date-button ${dateRange === range ? 'active' : ''}`}
                  onClick={() => setDateRange(range)}
                >
                  {range === 'today' ? 'Today' : range === 'thisMonth' ? 'This Month' : 'Custom'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="header-actions">
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input 
                type="text" 
                placeholder="Search invoices..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="icon-button">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="icon-button">
              <span className="material-symbols-outlined">person</span>
            </button>
          </div>
        </header>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#0D47A1' }}>
            <p style={{ fontSize: '1.2rem' }}>Loading financial data...</p>
          </div>
        )}

        {error && (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            background: '#ffebee', 
            color: '#d32f2f',
            borderRadius: '8px',
            margin: '1rem 0'
          }}>
            <p style={{ fontSize: '1.1rem' }}>Error: {error}</p>
            <button 
              onClick={fetchFinanceData}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1.5rem',
                background: '#0D47A1',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
        <section className="stats-grid">
          <div className="stat-card">
            <h3 className="stat-title">Total Revenue</h3>
            <p className="stat-value">{totalRevenue.toLocaleString()}</p>
            <span className="stat-change positive">+3.2%</span>
          </div>
          
          <div className="stat-card">
            <h3 className="stat-title">Total Expenses</h3>
            <p className="stat-value">{totalExpenses.toLocaleString()}</p>
            <span className="stat-change positive">+2.1%</span>
          </div>
          
          <div className="stat-card">
            <h3 className="stat-title">Net Profit</h3>
            <p className="stat-value">{netProfit.toLocaleString()}</p>
            <span className="stat-change positive">+8.3%</span>
          </div>
          
          <div className="stat-card">
            <h3 className="stat-title">Pending Invoices</h3>
            <p className="stat-value">{pendingInvoices}</p>
            <span className="stat-change negative">-10%</span>
          </div>
          
        </section>

        <section className="table-section">
          <div className="table-header">
            <div>
              <h3 className="table-title">Recent Invoices</h3>
              <p className="table-subtitle">Manage and track all patient invoices</p>
            </div>
            <button className="primary-button" onClick={handleAddInvoice}>
              <span className="material-symbols-outlined">add</span>
              Add Invoice
            </button>
          </div>
          
          <div className="table-container">
            <table className="finance-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td>{invoice.id}</td>
                    <td>{invoice.patient}</td>
                    <td>{invoice.doctor}</td>
                    <td>{invoice.service}</td>
                    <td>{invoice.amount}</td>
                    <td>
                      <span className={`status-badge {invoice.status === 'Paid' ? 'paid' : 'pending'}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td>{invoice.payment}</td>
                    <td>{invoice.date}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-button" title="View">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                        <button className="action-button" title="Edit">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button 
                          className="action-button" 
                          title="Delete"
                          onClick={() => handleDeleteInvoice(invoice.id)}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="table-section">
          <div className="table-header">
            <div>
              <h3 className="table-title">Expenses</h3>
              <p className="table-subtitle">Track and manage clinic expenses</p>
            </div>
            <button className="primary-button" onClick={handleAddExpense}>
              <span className="material-symbols-outlined">add</span>
              Add Expense
            </button>
          </div>
          
          <div className="table-container">
            <table className="finance-table">
              <thead>
                <tr>
                  <th>Expense ID</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Added By</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(expense => (
                  <tr key={expense.id}>
                    <td>{expense.id}</td>
                    <td>{expense.category}</td>
                    <td>{expense.amount}</td>
                    <td>{expense.date}</td>
                    <td>{expense.addedBy}</td>
                    <td>{expense.notes}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-button" title="View">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                        <button className="action-button" title="Edit">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button 
                          className="action-button" 
                          title="Delete"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="stats-grid">
          {insuranceData.map(insurance => (
            <div key={insurance.company} className="insurance-card">
              <h3 className="insurance-title">{insurance.company}</h3>
              <div className="insurance-stats">
                <div>
                  <p className="insurance-label">Pending Claims</p>
                  <p className="insurance-value">{insurance.pendingClaims}</p>
                </div>
                <div>
                  <p className="insurance-label">Total Coverage</p>
                  <p className="insurance-value">{insurance.totalCoverage.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="reports-section">
          <div className="reports-card">
            <h3 className="reports-title">Reports & Export</h3>
            <p className="reports-subtitle">Generate and download financial reports</p>
            
            <div className="report-buttons">
              <button className="report-button" onClick={handleGeneratePDF}>
                <span className="material-symbols-outlined">download</span>
                Generate PDF Report
              </button>
              <button className="report-button" onClick={handleExportExcel}>
                <span className="material-symbols-outlined">download</span>
                Export to Excel
              </button>
              <button className="report-button" onClick={handlePrint}>
                <span className="material-symbols-outlined">print</span>
                Print Statement
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FinancePage;