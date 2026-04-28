// PrescriptionForm.jsx
import React, { useState } from 'react';
import {
  Box, TextField, Typography, Grid, Button, IconButton, MenuItem, Autocomplete,
  Alert, Paper
} from "@mui/material";
import { Delete, AddCircle, Medication } from "@mui/icons-material";
import { savePrescription } from '../services/emrService';

const mockDrugs = [
  { label: "Panadol", form: "Tablet" },
  { label: "Cataflam", form: "Tablet" },
  { label: "Augmentin", form: "Syrup" },
  { label: "Tobradex", form: "Drop" },
  { label: "Brufen", form: "Tablet" },
  { label: "Otrivin", form: "Drop" },
];
const drugForms = ["Tablet", "Drop", "Syrup", "Cream", "Injection"];
const doseOptions = ["1", "2", "3", "5", "10", "15", "20", "Other"];
const frequencies = ["Once daily", "Twice daily", "Three times daily", "Every 8 hours", "Before sleep", "As needed", "Other"];

const PrescriptionForm = ({ patientId, medicalRecordId, data, setData, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (index, field, value) => {
    const updated = [...data];
    updated[index][field] = value;
    setData(updated);
  };

  const addPrescription = () => {
    setData([...data, { drug: "", form: "", dose: "", customDose: "", frequency: "", customFrequency: "", notes: "" }]);
  };

  const removePrescription = (index) => {
    setData(data.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!medicalRecordId) {
      setMessage({ type: 'error', text: 'Please create a medical record first.' });
      return;
    }
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const items = data
        .filter(item => item.drug?.trim())
        .map(item => ({
          drug: item.drug,
          form: item.form,
          dose: item.dose === 'Other' ? '' : item.dose,
          customDose: item.dose === 'Other' ? item.customDose : '',
          frequency: item.frequency === 'Other' ? '' : item.frequency,
          customFrequency: item.frequency === 'Other' ? item.customFrequency : '',
          notes: item.notes || ''
        }));
      await savePrescription(medicalRecordId, { notes: '', items });
      setMessage({ type: 'success', text: 'Prescriptions saved successfully!' });
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

      {data.map((item, index) => (
        <Paper
          key={index}
          elevation={1}
          sx={{
            mb: 2,
            p: 2,
            border: '1px solid #cae8ff',
            borderRadius: 3,
            bgcolor: 'white'
          }}
        >
          {/* Row 1: index label + delete */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{ fontFamily: "'Segoe UI', sans-serif", fontWeight: 700, fontSize: '15px', color: '#1e3a5f', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Medication fontSize="small" /> Drug #{index + 1}
            </Typography>
            <IconButton
              color="error"
              onClick={() => removePrescription(index)}
              disabled={loading}
              size="small"
              sx={{ border: '1px solid #ffcdd2', borderRadius: 2 }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>

          {/* Row 2: all 4 fields side by side */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Autocomplete
                freeSolo
                options={mockDrugs}
                getOptionLabel={(option) => option.label || ""}
                onChange={(e, value) => handleChange(index, "drug", value?.label || "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Drug Name"
                    placeholder="Search or type..."
                    fullWidth
                    value={item.drug}
                    onChange={(e) => handleChange(index, "drug", e.target.value)}
                    InputProps={{ ...params.InputProps, sx: { borderRadius: 2, fontFamily: "'Segoe UI', sans-serif", fontSize: '14px' } }}
                    InputLabelProps={{ sx: { fontFamily: "'Segoe UI', sans-serif", fontWeight: 600 } }}
                  />
                )}
                disabled={loading}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                label="Form"
                fullWidth
                value={item.form}
                onChange={(e) => handleChange(index, "form", e.target.value)}
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2, fontFamily: "'Segoe UI', sans-serif", fontSize: '14px' } }}
                InputLabelProps={{ sx: { fontFamily: "'Segoe UI', sans-serif", fontWeight: 600 } }}
              >
                {drugForms.map((form) => <MenuItem key={form} value={form}>{form}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                label="Dose"
                fullWidth
                value={item.dose}
                onChange={(e) => handleChange(index, "dose", e.target.value)}
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2, fontFamily: "'Segoe UI', sans-serif", fontSize: '14px' } }}
                InputLabelProps={{ sx: { fontFamily: "'Segoe UI', sans-serif", fontWeight: 600 } }}
              >
                {doseOptions.map((dose) => <MenuItem key={dose} value={dose}>{dose}</MenuItem>)}
              </TextField>
              {item.dose === "Other" && (
                <TextField
                  label="Custom Dose"
                  fullWidth
                  sx={{ mt: 1 }}
                  value={item.customDose}
                  onChange={(e) => handleChange(index, "customDose", e.target.value)}
                  disabled={loading}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                label="Frequency"
                fullWidth
                value={item.frequency}
                onChange={(e) => handleChange(index, "frequency", e.target.value)}
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2, fontFamily: "'Segoe UI', sans-serif", fontSize: '14px' } }}
                InputLabelProps={{ sx: { fontFamily: "'Segoe UI', sans-serif", fontWeight: 600 } }}
              >
                {frequencies.map((freq) => <MenuItem key={freq} value={freq}>{freq}</MenuItem>)}
              </TextField>
              {item.frequency === "Other" && (
                <TextField
                  label="Custom Frequency"
                  fullWidth
                  sx={{ mt: 1 }}
                  value={item.customFrequency}
                  onChange={(e) => handleChange(index, "customFrequency", e.target.value)}
                  disabled={loading}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              )}
            </Grid>

            {/* Row 3: Notes */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
                multiline
                rows={2}
                fullWidth
                value={item.notes}
                onChange={(e) => handleChange(index, "notes", e.target.value)}
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2, fontFamily: "'Segoe UI', sans-serif", fontSize: '14px' } }}
                InputLabelProps={{ sx: { fontFamily: "'Segoe UI', sans-serif", fontWeight: 600 } }}
              />
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddCircle />}
          onClick={addPrescription}
          disabled={loading}
          sx={{ backgroundColor: '#1e3a5f', '&:hover': { backgroundColor: '#16324d' }, borderRadius: 3, textTransform: 'none' }}
        >
          Add Another Drug
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={loading}
          sx={{ backgroundColor: '#1e3a5f', '&:hover': { backgroundColor: '#16324d' }, borderRadius: 3, textTransform: 'none' }}
        >
          {loading ? 'Saving...' : 'Save Prescriptions'}
        </Button>
      </Box>
    </Box>
  );
};

export default PrescriptionForm;