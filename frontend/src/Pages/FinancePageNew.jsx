import React, { useState, useEffect } from 'react';
import { 
    FaMoneyBillWave, FaChartLine, FaFileInvoiceDollar, FaWallet,
    FaCalendarAlt, FaDownload, FaFilter, FaSearch, FaUserMd,
    FaHospital, FaCreditCard, FaChartPie
} from 'react-icons/fa';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import * as XLSX from 'xlsx';
import './FinanceNew.css';

const FinancePageNew = () => {
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [financeData, setFinanceData] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        pendingPayments: 0,
        recentTransactions: [],
        monthlyData: [],
        paymentMethods: [],
        topServices: [],
        revenueChange: 0,
        expensesChange: 0,
        profitChange: 0
    });

    useEffect(() => {
        fetchFinanceData();
    }, [selectedPeriod]);

    const fetchFinanceData = async () => {
        try {
            setLoading(true);
            
            // Fetch appointments for revenue calculation
            const response = await fetch('http://localhost:5201/api/Appointments');
            const appointments = await response.json();
            
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            
            // Filter appointments based on selected period
            let filteredAppointments = appointments;
            let previousPeriodAppointments = [];
            
            if (selectedPeriod === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
                filteredAppointments = appointments.filter(apt => new Date(apt.appointmentDate) >= weekAgo);
                previousPeriodAppointments = appointments.filter(apt => {
                    const date = new Date(apt.appointmentDate);
                    return date >= twoWeeksAgo && date < weekAgo;
                });
            } else if (selectedPeriod === 'month') {
                filteredAppointments = appointments.filter(apt => {
                    const date = new Date(apt.appointmentDate);
                    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                });
                const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
                previousPeriodAppointments = appointments.filter(apt => {
                    const date = new Date(apt.appointmentDate);
                    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
                });
            } else if (selectedPeriod === 'quarter') {
                const quarterStart = Math.floor(currentMonth / 3) * 3;
                filteredAppointments = appointments.filter(apt => {
                    const date = new Date(apt.appointmentDate);
                    const aptMonth = date.getMonth();
                    return date.getFullYear() === currentYear && aptMonth >= quarterStart && aptMonth < quarterStart + 3;
                });
                const prevQuarterStart = quarterStart - 3 < 0 ? 9 : quarterStart - 3;
                const prevQuarterYear = quarterStart - 3 < 0 ? currentYear - 1 : currentYear;
                previousPeriodAppointments = appointments.filter(apt => {
                    const date = new Date(apt.appointmentDate);
                    const aptMonth = date.getMonth();
                    return date.getFullYear() === prevQuarterYear && aptMonth >= prevQuarterStart && aptMonth < prevQuarterStart + 3;
                });
            } else if (selectedPeriod === 'year') {
                filteredAppointments = appointments.filter(apt => new Date(apt.appointmentDate).getFullYear() === currentYear);
                previousPeriodAppointments = appointments.filter(apt => new Date(apt.appointmentDate).getFullYear() === currentYear - 1);
            }
            
            // Calculate current period metrics
            const paidAppointments = filteredAppointments.filter(apt => 
                apt.paymentStatus === 'Paid' || apt.paymentStatus === 'paid'
            );
            const totalRevenue = paidAppointments.reduce((sum, apt) => 
                sum + (apt.finalPrice || 0), 0
            );
            
            const allCurrentPeriodRevenue = filteredAppointments.reduce((sum, apt) => 
                sum + (apt.finalPrice || 0), 0
            );
            const pendingPayments = allCurrentPeriodRevenue - totalRevenue;
            
            // Calculate expenses (30% of revenue as operating costs)
            const totalExpenses = Math.round(totalRevenue * 0.30);
            const netProfit = totalRevenue - totalExpenses;
            
            // Calculate previous period metrics for comparison
            const prevPaidAppointments = previousPeriodAppointments.filter(apt => 
                apt.paymentStatus === 'Paid' || apt.paymentStatus === 'paid'
            );
            const prevRevenue = prevPaidAppointments.reduce((sum, apt) => 
                sum + (apt.finalPrice || 0), 0
            );
            const prevExpenses = Math.round(prevRevenue * 0.30);
            const prevProfit = prevRevenue - prevExpenses;
            
            // Calculate percentage changes
            const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100) : 0;
            const expensesChange = prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses * 100) : 0;
            const profitChange = prevProfit > 0 ? ((netProfit - prevProfit) / prevProfit * 100) : 0;
            
            // Group by month for chart
            const monthlyData = generateMonthlyData(appointments);
            
            // Payment methods distribution
            const paymentMethods = calculatePaymentMethods(paidAppointments);
            
            // Top services
            const topServices = calculateTopServices(paidAppointments);
            
            // Recent transactions (last 10)
            const sortedAppointments = [...appointments].sort((a, b) => 
                new Date(b.appointmentDate) - new Date(a.appointmentDate)
            );
            const recentTransactions = sortedAppointments
                .slice(0, 10)
                .map(apt => ({
                    id: apt.appointmentId,
                    patientName: apt.patientName,
                    amount: apt.finalPrice || 0,
                    status: apt.paymentStatus || 'Pending',
                    date: new Date(apt.appointmentDate).toLocaleDateString(),
                    method: apt.paymentMethod || 'Cash'
                }));
            
            setFinanceData({
                totalRevenue,
                totalExpenses,
                netProfit,
                pendingPayments,
                recentTransactions,
                monthlyData,
                paymentMethods,
                topServices,
                revenueChange,
                expensesChange,
                profitChange
            });
            
        } catch (error) {
            console.error('Error fetching finance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateMonthlyData = (appointments) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // Get last 6 months
        const monthsToShow = [];
        for (let i = 5; i >= 0; i--) {
            let month = currentMonth - i;
            let year = currentYear;
            if (month < 0) {
                month += 12;
                year -= 1;
            }
            monthsToShow.push({ month, year, name: months[month] });
        }
        
        return monthsToShow.map(({ month, year, name }) => {
            const monthAppointments = appointments.filter(apt => {
                const aptDate = new Date(apt.appointmentDate);
                return aptDate.getMonth() === month && 
                       aptDate.getFullYear() === year &&
                       (apt.paymentStatus === 'Paid' || apt.paymentStatus === 'paid');
            });
            
            const revenue = monthAppointments.reduce((sum, apt) => 
                sum + (apt.finalPrice || 0), 0
            );
            
            // Calculate expenses as 30% of revenue
            const expenses = Math.round(revenue * 0.30);
            
            return {
                month: name,
                revenue,
                expenses,
                profit: revenue - expenses
            };
        });
    };

    const calculatePaymentMethods = (appointments) => {
        const methods = {};
        appointments.forEach(apt => {
            const method = apt.paymentMethod || 'Cash';
            methods[method] = (methods[method] || 0) + 1;
        });
        
        return Object.entries(methods).map(([name, value]) => ({ name, value }));
    };

    const calculateTopServices = (appointments) => {
        const services = {};
        appointments.forEach(apt => {
            const service = apt.reasonForVisit || 'General Consultation';
            services[service] = (services[service] || 0) + (apt.finalPrice || 0);
        });
        
        return Object.entries(services)
            .map(([name, revenue]) => ({ name, revenue }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    };

    const COLORS = ['#0D47A1', '#1976D2', '#42A5F5', '#90CAF9', '#BBDEFB'];

    const exportToExcel = () => {
        try {
            // Create a new workbook
            const wb = XLSX.utils.book_new();
            
            // Summary Sheet
            const summaryData = [
                ['Eye Clinic Financial Report'],
                ['Period:', selectedPeriod],
                ['Generated:', new Date().toLocaleString()],
                [''],
                ['Financial Summary'],
                ['Metric', 'Amount (EGP)', 'Change (%)'],
                ['Total Revenue', financeData.totalRevenue, financeData.revenueChange.toFixed(1) + '%'],
                ['Total Expenses', financeData.totalExpenses, financeData.expensesChange.toFixed(1) + '%'],
                ['Net Profit', financeData.netProfit, financeData.profitChange.toFixed(1) + '%'],
                ['Pending Payments', financeData.pendingPayments, '']
            ];
            const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
            
            // Monthly Data Sheet
            const monthlyData = [
                ['Monthly Revenue & Expenses'],
                ['Month', 'Revenue (EGP)', 'Expenses (EGP)', 'Profit (EGP)'],
                ...financeData.monthlyData.map(m => [m.month, m.revenue, m.expenses, m.profit])
            ];
            const wsMonthly = XLSX.utils.aoa_to_sheet(monthlyData);
            XLSX.utils.book_append_sheet(wb, wsMonthly, 'Monthly Data');
            
            // Payment Methods Sheet
            const paymentMethodsData = [
                ['Payment Methods Distribution'],
                ['Method', 'Count'],
                ...financeData.paymentMethods.map(pm => [pm.name, pm.value])
            ];
            const wsPayments = XLSX.utils.aoa_to_sheet(paymentMethodsData);
            XLSX.utils.book_append_sheet(wb, wsPayments, 'Payment Methods');
            
            // Top Services Sheet
            const topServicesData = [
                ['Top Services by Revenue'],
                ['Service', 'Revenue (EGP)'],
                ...financeData.topServices.map(s => [s.name, s.revenue])
            ];
            const wsServices = XLSX.utils.aoa_to_sheet(topServicesData);
            XLSX.utils.book_append_sheet(wb, wsServices, 'Top Services');
            
            // Transactions Sheet
            const transactionsData = [
                ['Recent Transactions'],
                ['Transaction ID', 'Patient Name', 'Amount (EGP)', 'Payment Method', 'Date', 'Status'],
                ...financeData.recentTransactions.map(t => [
                    t.id, t.patientName, t.amount, t.method, t.date, t.status
                ])
            ];
            const wsTransactions = XLSX.utils.aoa_to_sheet(transactionsData);
            XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions');
            
            // Generate filename with date
            const fileName = `Financial_Report_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.xlsx`;
            
            // Write and download the file
            XLSX.writeFile(wb, fileName);
            
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('Failed to export report. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="finance-loading">
                <div className="spinner"></div>
                <p>Loading financial data...</p>
            </div>
        );
    }

    return (
        <div className="finance-page-new">
            {/* Header */}
            <div className="finance-header">
                <div className="header-content">
                    <h1><FaChartLine /> Financial Dashboard</h1>
                    <p>Comprehensive financial overview and analytics</p>
                </div>
                <div className="header-actions">
                    <select 
                        className="period-selector"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                    >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                    </select>
                    <button className="export-btn" onClick={exportToExcel}>
                        <FaDownload /> Export Report
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="finance-summary-cards">
                <div className="summary-card revenue">
                    <div className="card-icon">
                        <FaMoneyBillWave />
                    </div>
                    <div className="card-info">
                        <h3>Total Revenue</h3>
                        <p className="amount">{financeData.totalRevenue.toLocaleString()} EGP</p>
                        <span className={`trend ${financeData.revenueChange >= 0 ? 'positive' : 'negative'}`}>
                            {financeData.revenueChange >= 0 ? '+' : ''}{financeData.revenueChange.toFixed(1)}% from last {selectedPeriod}
                        </span>
                    </div>
                </div>

                <div className="summary-card expenses">
                    <div className="card-icon">
                        <FaWallet />
                    </div>
                    <div className="card-info">
                        <h3>Total Expenses</h3>
                        <p className="amount">{financeData.totalExpenses.toLocaleString()} EGP</p>
                        <span className={`trend ${financeData.expensesChange >= 0 ? 'negative' : 'positive'}`}>
                            {financeData.expensesChange >= 0 ? '+' : ''}{financeData.expensesChange.toFixed(1)}% from last {selectedPeriod}
                        </span>
                    </div>
                </div>

                <div className="summary-card profit">
                    <div className="card-icon">
                        <FaChartLine />
                    </div>
                    <div className="card-info">
                        <h3>Net Profit</h3>
                        <p className="amount">{financeData.netProfit.toLocaleString()} EGP</p>
                        <span className={`trend ${financeData.profitChange >= 0 ? 'positive' : 'negative'}`}>
                            {financeData.profitChange >= 0 ? '+' : ''}{financeData.profitChange.toFixed(1)}% from last {selectedPeriod}
                        </span>
                    </div>
                </div>

                <div className="summary-card pending">
                    <div className="card-icon">
                        <FaFileInvoiceDollar />
                    </div>
                    <div className="card-info">
                        <h3>Pending Payments</h3>
                        <p className="amount">{financeData.pendingPayments.toLocaleString()} EGP</p>
                        <span className="count">{financeData.recentTransactions.filter(t => t.status === 'Pending' || t.status === 'pending').length} invoices</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-container">
                {/* Revenue vs Expenses Chart */}
                <div className="chart-card large">
                    <div className="chart-header">
                        <h3>Revenue vs Expenses</h3>
                        <div className="chart-legend">
                            <span className="legend-item revenue-legend">Revenue</span>
                            <span className="legend-item expenses-legend">Expenses</span>
                            <span className="legend-item profit-legend">Profit</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={financeData.monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="month" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip />
                            <Area type="monotone" dataKey="revenue" stackId="1" stroke="#0D47A1" fill="#0D47A1" fillOpacity={0.6} />
                            <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef5350" fill="#ef5350" fillOpacity={0.6} />
                            <Area type="monotone" dataKey="profit" stackId="3" stroke="#66bb6a" fill="#66bb6a" fillOpacity={0.6} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Payment Methods Distribution */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Payment Methods</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={financeData.paymentMethods}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {financeData.paymentMethods.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Services Revenue */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Top Services by Revenue</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={financeData.topServices} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis type="number" stroke="#666" />
                            <YAxis dataKey="name" type="category" width={120} stroke="#666" />
                            <Tooltip />
                            <Bar dataKey="revenue" fill="#1976D2" radius={[0, 8, 8, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="transactions-section">
                <div className="section-header">
                    <h3><FaFileInvoiceDollar /> Recent Transactions</h3>
                    <div className="search-box">
                        <FaSearch />
                        <input type="text" placeholder="Search transactions..." />
                    </div>
                </div>
                <div className="transactions-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Patient Name</th>
                                <th>Amount</th>
                                <th>Payment Method</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {financeData.recentTransactions.map(transaction => (
                                <tr key={transaction.id}>
                                    <td className="transaction-id">{transaction.id}</td>
                                    <td>{transaction.patientName}</td>
                                    <td className="amount">{transaction.amount.toLocaleString()} EGP</td>
                                    <td>
                                        <span className="payment-method">
                                            <FaCreditCard /> {transaction.method}
                                        </span>
                                    </td>
                                    <td>{transaction.date}</td>
                                    <td>
                                        <span className={`status-badge ${transaction.status.toLowerCase()}`}>
                                            {transaction.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-btn view">View</button>
                                        <button className="action-btn print">Print</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinancePageNew;
