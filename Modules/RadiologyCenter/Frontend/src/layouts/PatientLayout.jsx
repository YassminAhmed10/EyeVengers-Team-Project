import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/shared/Navbar';
import { usePatient } from '../context/PatientContext';

export function PatientLayout() {
    const eyeClinicBaseUrl = import.meta.env.VITE_EYE_CLINIC_URL || 'http://localhost:5173';
    const defaultBackToClinicUrl = `${eyeClinicBaseUrl}/patient`;
    
    const { patient, entrySource, clinicSystemInfo } = usePatient();

    // Only show back button if patient comes from clinic system
    const shouldShowBackButton = entrySource === 'clinic_system';
    
    // Use clinic-provided back URL, or fallback to default clinic URL
    const backToUrl = shouldShowBackButton 
        ? (clinicSystemInfo?.backUrl || defaultBackToClinicUrl)
        : null;
    
    // Dynamic clinic system name
    const clinicName = clinicSystemInfo?.name || 'Eye Clinic';

    return (
        <div dir="ltr" className="radiology-shell min-h-screen">
            <Navbar 
                title="Radiology Center" 
                subtitle="Book scans, track appointments, and review your reports" 
                mode="patient" 
                backToUrl={backToUrl}
                clinicName={clinicName}
                isFromClinic={shouldShowBackButton}
                patientName={patient?.name} 
            />
            <Outlet />
        </div>
    );
}
