import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/shared/Navbar';
import { usePatient } from '../context/PatientContext';

export function PatientLayout() {
    const eyeClinicBaseUrl = import.meta.env.VITE_EYE_CLINIC_URL || 'http://localhost:5173';
    const backToClinicUrl = `${eyeClinicBaseUrl}/patient`;
    const { patient } = usePatient();

    return (
        <div dir="ltr" className="radiology-shell min-h-screen">
            <Navbar 
                title="Radiology Center" 
                subtitle="Book scans, track appointments, and review your reports" 
                mode="patient" 
                backToUrl={backToClinicUrl} 
                patientName={patient?.name} 
            />
            <Outlet />
        </div>
    );
}
