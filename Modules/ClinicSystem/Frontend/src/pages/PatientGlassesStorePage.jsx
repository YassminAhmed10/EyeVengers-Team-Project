import React from 'react';
import { FaGlasses, FaPalette, FaRulerCombined, FaTags } from 'react-icons/fa';
import PatientLayout from '../components/PatientLayout';
import './PatientStorePages.css';

const PatientGlassesStorePage = () => {
    return (
        <PatientLayout>
            <section className="psp-wrap">
                <div className="psp-card">
                    <div className="psp-icon"><FaGlasses /></div>
                    <h1>Glasses Store</h1>
                    <p>Browse stylish optical frames and lenses designed for comfort, clarity, and your prescription.</p>
                    <div className="psp-grid">
                        <div className="psp-item"><FaPalette /><span>Modern Styles</span></div>
                        <div className="psp-item"><FaRulerCombined /><span>Perfect Fit</span></div>
                        <div className="psp-item"><FaTags /><span>Special Offers</span></div>
                    </div>
                </div>
            </section>
        </PatientLayout>
    );
};

export default PatientGlassesStorePage;
