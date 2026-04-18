// MedicalHistory.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Alert, Paper, Collapse, IconButton } from "@mui/material";
import { ExpandMore, ExpandLess, History } from "@mui/icons-material";
import { saveMedicalHistory } from '../services/emrService';

const MedicalHistory = ({ patientId, medicalRecordId, historyData, existingData = [], onSaved }) => {
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

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPrevious, setShowPrevious] = useState(false);

  useEffect(() => {
    let history = null;
    if (Array.isArray(historyData) && historyData.length > 0) {
      history = historyData[0];
    } else if (historyData && typeof historyData === 'object') {
      history = historyData;
    }
    if (history) {
      setFormData({
        previousEye: history.PastMedicalHistory || history.previousEye || history.eyeSurgeries || '',
        familyHistory: history.FamilyHistory || history.familyHistory || history.familyEyeDiseases || '',
        allergies: history.Allergies || history.allergies || history.eyeAllergies || history.otherAllergies || '',
        chronicDiseases: history.chronicDiseases || '',
        currentMedications: history.currentMedications || '',
        eyeSurgeries: history.eyeSurgeries || history.otherEyeSurgeries || '',
        familyEyeDiseases: history.familyEyeDiseases || history.otherFamilyDiseases || '',
        visionSymptoms: history.visionSymptoms || ''
      });
    }
  }, [historyData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!medicalRecordId) {
      setMessage({ type: 'error', text: 'Please create a medical record first.' });
      return;
    }
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      await saveMedicalHistory(medicalRecordId, formData);
      setMessage({ type: 'success', text: 'Medical history saved successfully!' });
      onSaved?.();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {message.text && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

      {existingData.length > 0 && (
        <Paper sx={{ mb: 3, bgcolor: '#f5f5f5', overflow: 'hidden' }}>
          <Box
            onClick={() => setShowPrevious(p => !p)}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
              '&:hover': { bgcolor: '#eeeeee' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <History color="primary" />
              <Typography variant="h6">Previous Medical History ({existingData.length})</Typography>
            </Box>
            <IconButton size="small">{showPrevious ? <ExpandLess /> : <ExpandMore />}</IconButton>
          </Box>
          <Collapse in={showPrevious}>
            <Box sx={{ p: 2, pt: 0 }}>
              {existingData.map((item, index) => (
                <Box key={item.id || index} sx={{ mb: 2, p: 1.5, borderBottom: '1px solid #ddd' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown date'}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1 }}>
                    {item.previousEye && <Typography variant="body2"><strong>Previous Eye:</strong> {item.previousEye}</Typography>}
                    {item.familyHistory && <Typography variant="body2"><strong>Family History:</strong> {item.familyHistory}</Typography>}
                    {item.allergies && <Typography variant="body2"><strong>Allergies:</strong> {item.allergies}</Typography>}
                    {item.chronicDiseases && <Typography variant="body2"><strong>Chronic Diseases:</strong> {item.chronicDiseases}</Typography>}
                    {item.currentMedications && <Typography variant="body2"><strong>Medications:</strong> {item.currentMedications}</Typography>}
                    {item.eyeSurgeries && <Typography variant="body2"><strong>Eye Surgeries:</strong> {item.eyeSurgeries}</Typography>}
                    {item.familyEyeDiseases && <Typography variant="body2"><strong>Family Eye Diseases:</strong> {item.familyEyeDiseases}</Typography>}
                    {item.visionSymptoms && <Typography variant="body2"><strong>Vision Symptoms:</strong> {item.visionSymptoms}</Typography>}
                  </Box>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Paper>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2, mb: 3 }}>
        <TextField label="Previous Eye History" multiline rows={4} name="previousEye" value={formData.previousEye} onChange={handleChange} disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
        <TextField label="Family History" multiline rows={4} name="familyHistory" value={formData.familyHistory} onChange={handleChange} disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
        <TextField label="Allergies / Medical Conditions" multiline rows={4} name="allergies" value={formData.allergies} onChange={handleChange} disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2, mb: 3 }}>
        <TextField label="Chronic Diseases" multiline rows={4} name="chronicDiseases" value={formData.chronicDiseases} onChange={handleChange} disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
        <TextField label="Current Medications" multiline rows={4} name="currentMedications" value={formData.currentMedications} onChange={handleChange} disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
        <TextField label="Eye Surgeries" multiline rows={4} name="eyeSurgeries" value={formData.eyeSurgeries} onChange={handleChange} disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        <TextField label="Family Eye Diseases" multiline rows={4} name="familyEyeDiseases" value={formData.familyEyeDiseases} onChange={handleChange} disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
        <TextField label="Vision Symptoms" multiline rows={4} name="visionSymptoms" value={formData.visionSymptoms} onChange={handleChange} disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
      </Box>

      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          sx={{ backgroundColor: '#1e3a5f', '&:hover': { backgroundColor: '#16324d' }, borderRadius: 3, textTransform: 'none' }}
        >
          {loading ? 'Saving...' : 'Save History'}
        </Button>
      </Box>
    </Box>
  );
};

export default MedicalHistory;