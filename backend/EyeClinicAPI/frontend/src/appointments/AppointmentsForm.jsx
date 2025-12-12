import React, { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://localhost:7071'

const initial = {
  patientName: '',
  patientId: '',
  phone: '',
  email: '',
  appointmentDate: '',
  appointmentTime: '',
  doctorId: 1,
  patientGender: 'Male',
  reasonForVisit: ''
}

export default function AppointmentsForm(){
  const [form, setForm] = useState(initial)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function onChange(e){
    const {name, value} = e.target
    setForm(s => ({...s, [name]: value}))
  }

  async function onSubmit(e){
    e.preventDefault()
    setMessage('')
    setLoading(true)
    
    try{
      // construct appointment payload
      const payload = {
        DoctorId: parseInt(form.doctorId, 10),
        PatientName: form.patientName,
        PatientId: form.patientId,
        Phone: form.phone || null,
        Email: form.email || null,
        AppointmentDate: form.appointmentDate,
        // backend expects a TimeSpan like "hh:mm:ss"
        AppointmentTime: form.appointmentTime ? form.appointmentTime + ':00' : '00:00:00',
        PatientGender: form.patientGender,
        ReasonForVisit: form.reasonForVisit || null
      }

      console.log('Sending appointment:', payload)

      const res = await fetch(`${API_BASE}/api/Appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if(!res.ok){
        const txt = await res.text()
        throw new Error(txt || `Server error: ${res.status}`)
      }
      
      const result = await res.json()
      console.log('Appointment created:', result)
      
      setMessage('? Appointment saved successfully!')
      setForm(initial)
      
    } catch(err) {
      console.error('Error saving appointment:', err)
      
      if (err.message.includes('Failed to fetch')) {
        setMessage('? Cannot connect to server. Make sure API is running on ' + API_BASE)
      } else if (err.message.includes('Doctor')) {
        setMessage('? Error: ' + err.message + '. Please add a doctor first via Swagger.')
      } else {
        setMessage('? Error: ' + (err.message || 'Unknown error'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} style={{maxWidth: 600, margin: '0 auto'}}>
      <h2>New Appointment</h2>
      
      <label>
        Patient Name *
        <input 
          name="patientName" 
          value={form.patientName} 
          onChange={onChange} 
          required 
          disabled={loading}
        />
      </label>
      
      <label>
        Patient ID *
        <input 
          name="patientId" 
          value={form.patientId} 
          onChange={onChange} 
          required 
          disabled={loading}
        />
      </label>
      
      <label>
        Phone
        <input 
          name="phone" 
          value={form.phone} 
          onChange={onChange}
          disabled={loading}
          placeholder="Optional"
        />
      </label>
      
      <label>
        Email
        <input 
          type="email"
          name="email" 
          value={form.email} 
          onChange={onChange}
          disabled={loading}
          placeholder="Optional"
        />
      </label>
      
      <label>
        Date *
        <input 
          type="date" 
          name="appointmentDate" 
          value={form.appointmentDate} 
          onChange={onChange} 
          required
          disabled={loading}
        />
      </label>
      
      <label>
        Time *
        <input 
          type="time" 
          name="appointmentTime" 
          value={form.appointmentTime} 
          onChange={onChange} 
          required
          disabled={loading}
        />
      </label>
      
      <label>
        Doctor ID *
        <input 
          name="doctorId" 
          type="number"
          value={form.doctorId} 
          onChange={onChange}
          min="1"
          disabled={loading}
        />
      </label>
      
      <label>
        Gender *
        <select 
          name="patientGender" 
          value={form.patientGender} 
          onChange={onChange}
          disabled={loading}
        >
          <option>Male</option>
          <option>Female</option>
        </select>
      </label>
      
      <label>
        Reason for Visit
        <textarea 
          name="reasonForVisit" 
          value={form.reasonForVisit} 
          onChange={onChange}
          disabled={loading}
          placeholder="Optional"
          rows={3}
        />
      </label>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Appointment'}
      </button>
      
      {message && (
        <div style={{
          marginTop: 10,
          padding: 10,
          borderRadius: 5,
          backgroundColor: message.includes('?') ? '#d4edda' : '#f8d7da',
          color: message.includes('?') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('?') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}
    </form>
  )
}
