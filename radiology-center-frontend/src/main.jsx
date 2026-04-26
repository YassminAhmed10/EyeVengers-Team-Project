import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { SignalRProvider } from './context/SignalRContext'
import { PatientProvider } from './context/PatientContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SignalRProvider>
          <PatientProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </PatientProvider>
        </SignalRProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
