import React from 'react';
import { FaCapsules, FaTruck, FaClock, FaShieldAlt } from 'react-icons/fa';
import PatientLayout from '../components/PatientLayout';
import './PatientStorePages.css';

const PatientPharmacyPage = () => {
    return (
        <PatientLayout>
            <section className="psp-wrap">
                <div className="psp-card">
                    <div className="psp-icon"><FaCapsules /></div>
                    <h1>Pharmacy</h1>
                    <p>Order your prescribed eye medications and receive them quickly with trusted handling.</p>
                    <div className="psp-grid">
                        <div className="psp-item"><FaTruck /><span>Fast Delivery</span></div>
                        <div className="psp-item"><FaClock /><span>24/7 Ordering</span></div>
                        <div className="psp-item"><FaShieldAlt /><span>Verified Products</span></div>
                    </div>
                </div>
            </section>
        </PatientLayout>
    );
};

export default PatientPharmacyPage;
