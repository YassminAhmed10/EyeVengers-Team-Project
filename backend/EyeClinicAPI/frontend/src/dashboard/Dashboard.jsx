import React, { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://localhost:7071'

export default function Dashboard(){
  const [stats, setStats] = useState(null)
  const [today, setToday] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    fetchData()
  },[])

  async function fetchData(){
    setLoading(true)
    setError(null)
    
    try {
      await Promise.all([fetchStats(), fetchToday ])
    } catch (e) {
      console.error('Error fetching dashboard data:', e)
      setError('??? ?? ????? ???? ???????. ???? ?? ????? ????? ????? ?????????.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats(){
    try{
      const res = await fetch(`${API_BASE}/api/Dashboard/Stats`)
      if(!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setStats(data)
    }catch(e){
      console.error('Error fetching stats:', e)
      throw e
    }
  }

  async function fetchToday(){
    try{
      const res = await fetch(`${API_BASE}/api/Dashboard/Today`)
      if(!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setToday(data)
    }catch(e){
      console.error('Error fetching today appointments:', e)
      throw e
    }
  }

  if (loading) {
    return <div style={{textAlign: 'center', padding: 20}}>???? ????? ???? ??????...</div>
  }

  if (error) {
    return (
      <div style={{
        padding: 20,
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderRadius: 5,
        border: '1px solid #f5c6cb'
      }}>
        <h3>?? ??? ?? ???????</h3>
        <p>{error}</p>
        <p>????? ????? ????? ?????????: {API_BASE}</p>
        <button onClick={fetchData} style={{marginTop: 10}}>
          ?? ????? ????????
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2>???? ??????</h2>
      
      {stats ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
          marginBottom: 20
        }}>
          <StatCard label="???????" value={stats.TotalAppointments} color="#007bff" />
          <StatCard label="?????" value={stats.CompletedAppointments} color="#28a745" />
          <StatCard label="?????" value={stats.TodayAppointments} color="#ffc107" />
          <StatCard label="????" value={stats.UpcomingAppointments} color="#17a2b8" />
          <StatCard label="????" value={stats.CancelledAppointments} color="#dc3545" />
        </div>
      ) : <div>?? ???? ???????? ?????</div>}

      <h3>?????? ?????</h3>
      {today.length > 0 ? (
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{backgroundColor: '#f8f9fa'}}>
              <th style={tableHeaderStyle}>?????</th>
              <th style={tableHeaderStyle}>??????</th>
              <th style={tableHeaderStyle}>ID</th>
              <th style={tableHeaderStyle}>??????</th>
              <th style={tableHeaderStyle}>??????</th>
            </tr>
          </thead>
          <tbody>
            {today.map((a, idx) => (
              <tr key={idx} style={{borderBottom: '1px solid #dee2e6'}}>
                <td style={tableCellStyle}>{a.Time}</td>
                <td style={tableCellStyle}>{a.PatientName}</td>
                <td style={tableCellStyle}>{a.PatientId}</td>
                <td style={tableCellStyle}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 3,
                    backgroundColor: getStatusColor(a.Status),
                    color: 'white',
                    fontSize: '0.85em'
                  }}>
                    {a.Status}
                  </span>
                </td>
                <td style={tableCellStyle}>{a.Doctor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{padding: 20, textAlign: 'center', color: '#6c757d'}}>
          ?? ???? ?????? ?????? ?????
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      padding: 15,
      borderRadius: 8,
      backgroundColor: color + '20',
      border: `2px solid ${color}`,
      textAlign: 'center'
    }}>
      <div style={{fontSize: '2em', fontWeight: 'bold', color}}>{value}</div>
      <div style={{fontSize: '0.9em', color: '#666', marginTop: 5}}>{label}</div>
    </div>
  )
}

function getStatusColor(status) {
  const colors = {
    'Upcoming': '#17a2b8',
    'Completed': '#28a745',
    'Cancelled': '#dc3545',
    'InProgress': '#ffc107',
    'NoShow': '#6c757d'
  }
  return colors[status] || '#6c757d'
}

const tableHeaderStyle = {
  padding: 10,
  textAlign: 'left',
  borderBottom: '2px solid #dee2e6'
}

const tableCellStyle = {
  padding: 10
}
