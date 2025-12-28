import React, { useState, useEffect } from 'react';
import { useMedicalRecord } from '../hooks/useMedicalRecord';
import { Box, Typography, TextField, Checkbox, FormGroup, FormControlLabel } from "@mui/material";

const MedicalHistory = ({ data, setData, historyData }) => {
    const [formData, setFormData] = useState({
        previousEye: '',
        familyHistory: '',
        allergies: '',
        chronicDiseases: '',
        currentMedications: '',
        eyeSurgeries: '',
        familyEyeDiseases: '',
        visionSymptoms: ''
    });

    // Populate form with appointment medical history data
    useEffect(() => {
        if (historyData && historyData.length > 0) {
            const history = historyData[0];
            setFormData({
                previousEye: history.PastMedicalHistory || '',
                familyHistory: history.FamilyHistory || '',
                allergies: history.Allergies || '',
                chronicDiseases: history.chronicDiseases || '',
                currentMedications: history.currentMedications || '',
                eyeSurgeries: history.eyeSurgeries || '',
                familyEyeDiseases: history.familyEyeDiseases || '',
                visionSymptoms: history.visionSymptoms || ''
            });
        }
    }, [historyData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedData = { ...formData, [name]: value };
        setFormData(updatedData);
        
        // Also update parent data if needed
        if (setData) {
            setData({ ...data, [name]: value });
        }
    };

    return (
        <Box sx={{ p: 3, border: "1px solid #ddd", borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Medical & Family History
            </Typography>

            {/* Row 1: Previous Eye History, Family History, Allergies */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mb: 3 }}>
                <TextField
                    label="Previous Eye History"
                    placeholder="Any previous eye problems"
                    multiline
                    rows={4}
                    fullWidth
                    name="previousEye"
                    value={formData.previousEye}
                    onChange={handleChange}
                />
                <TextField
                    label="Family History"
                    placeholder="Any family diseases or conditions"
                    multiline
                    rows={4}
                    fullWidth
                    name="familyHistory"
                    value={formData.familyHistory}
                    onChange={handleChange}
                />
                <TextField
                    label="Allergies / Medical Conditions"
                    placeholder="Any allergies or medical conditions"
                    multiline
                    rows={4}
                    fullWidth
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                />
            </Box>

            {/* Row 2: Chronic Diseases, Current Medications, Eye Surgeries */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mb: 3 }}>
                <TextField
                    label="Chronic Diseases"
                    placeholder="Any chronic diseases"
                    multiline
                    rows={4}
                    fullWidth
                    name="chronicDiseases"
                    value={formData.chronicDiseases}
                    onChange={handleChange}
                />
                <TextField
                    label="Current Medications"
                    placeholder="List all current medications"
                    multiline
                    rows={4}
                    fullWidth
                    name="currentMedications"
                    value={formData.currentMedications}
                    onChange={handleChange}
                />
                <TextField
                    label="Eye Surgeries"
                    placeholder="Any eye surgeries performed"
                    multiline
                    rows={4}
                    fullWidth
                    name="eyeSurgeries"
                    value={formData.eyeSurgeries}
                    onChange={handleChange}
                />
            </Box>

            {/* Row 3: Family Eye Diseases, Vision Symptoms */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <TextField
                    label="Family Eye Diseases"
                    placeholder="Any eye diseases in the family"
                    multiline
                    rows={4}
                    fullWidth
                    name="familyEyeDiseases"
                    value={formData.familyEyeDiseases}
                    onChange={handleChange}
                />
                <TextField
                    label="Vision Symptoms"
                    placeholder="Any current vision symptoms"
                    multiline
                    rows={4}
                    fullWidth
                    name="visionSymptoms"
                    value={formData.visionSymptoms}
                    onChange={handleChange}
                />
            </Box>
        </Box>
    );
};

export default MedicalHistory;