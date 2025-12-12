import React from 'react'
import AppointmentsForm from './appointments/AppointmentsForm'
import Dashboard from './dashboard/Dashboard'

export default function App(){
  return (
    <div className="app">
      <h1>Eye Clinic</h1>
      <AppointmentsForm />
      <Dashboard />
    </div>
  )
}
