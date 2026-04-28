import React from 'react'
import ReactDOM from 'react-dom/client'
import AllProject from './AllProject.jsx'
import { LanguageProvider } from './context/LanguageContext'
import { PatientProvider } from './context/PatientContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <PatientProvider>
        <AllProject />
      </PatientProvider>
    </LanguageProvider>
  </React.StrictMode>,
)
