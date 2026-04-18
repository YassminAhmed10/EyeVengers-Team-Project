// Diagnoses.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, TextField, MenuItem, Typography, IconButton, Button,
  Alert, Paper, Collapse
} from "@mui/material";
import { AddCircle, Delete, ExpandMore, ExpandLess, LocalHospital, Healing } from "@mui/icons-material";
import { saveDiagnosis } from '../services/emrService';

const mockStatuses = ["Active", "Inactive", "Resolved"];
const mockSeverities = ["Mild", "Moderate", "Severe"];

const DiagnosesTab = ({ patientId, medicalRecordId, existingData = [], onSaved }) => {
  const [diagnoses, setDiagnoses] = useState(
    existingData.length > 0
      ? existingData.map(item => ({
          diagnosis: item.diagnosisName || "",
          status: item.status || "",
          severity: item.severity || "",
          notes: item.notes || "",
          checkupDate: item.checkupDate || ""
        }))
      : [{ diagnosis: "", status: "", severity: "", notes: "", checkupDate: "" }]
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPrevious, setShowPrevious] = useState(false);

  const existingDataRef = useRef(existingData);
  useEffect(() => {
    if (existingData !== existingDataRef.current) {
      existingDataRef.current = existingData;
      if (existingData.length > 0) {
        setDiagnoses(existingData.map(item => ({
          diagnosis: item.diagnosisName || item.DiagnosisName || item.diagnosis || "",
          status: item.status || item.Status || "",
          severity: item.severity || item.Severity || "",
          notes: item.notes || item.Notes || "",
          checkupDate: item.checkupDate || item.CheckupDate || ""
        })));
      }
    }
  }, [existingData]);

  const handleChange = (index, field, value) => {
    const updated = [...diagnoses];
    updated[index][field] = value;
    setDiagnoses(updated);
  };

  const addDiagnosis = () => {
    setDiagnoses([...diagnoses, {
      diagnosis: "", status: "", severity: "", notes: "", checkupDate: ""
    }]);
  };

  const removeDiagnosis = (index) => {
    setDiagnoses(diagnoses.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      if (!medicalRecordId) {
        setMessage({ type: 'error', text: 'Please create a medical record first.' });
        setLoading(false);
        return;
      }

      for (const diagnosis of diagnoses) {
        if (diagnosis.diagnosis.trim()) {
          await saveDiagnosis(medicalRecordId, {
            diagnosisName: diagnosis.diagnosis,
            status: diagnosis.status,
            severity: diagnosis.severity,
            notes: diagnosis.notes,
            checkupDate: diagnosis.checkupDate || new Date().toISOString(),
            isArchived: false
          });
        }
      }

      setMessage({ type: 'success', text: 'Diagnoses saved successfully!' });
      onSaved?.();
    } catch (error) {
      console.error('Error saving diagnoses:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save diagnoses' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
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
              <Healing color="primary" />
              <Typography variant="h6">Previous Diagnoses ({existingData.length})</Typography>
            </Box>
            <IconButton size="small">
              {showPrevious ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          <Collapse in={showPrevious}>
            <Box sx={{ p: 2, pt: 0 }}>
              {existingData.map((item, index) => (
                <Box key={item.id || index} sx={{ mb: 2, p: 1.5, borderBottom: '1px solid #ddd' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {new Date(item.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body1"><strong>Diagnosis:</strong> {item.diagnosisName}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2"><strong>Status:</strong> {item.status}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2"><strong>Severity:</strong> {item.severity}</Typography>
                    </Grid>
                    {item.notes && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="body2"><strong>Notes:</strong> {item.notes}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Paper>
      )}

      <form onSubmit={handleSubmit}>
        {diagnoses.map((item, index) => (
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
            {/* Header: label + delete */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontFamily: "'Segoe UI', sans-serif", fontWeight: 700, fontSize: '15px', color: '#1e3a5f', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalHospital fontSize="small" /> Diagnosis #{index + 1}
              </Typography>
              <IconButton
                color="error"
                onClick={() => removeDiagnosis(index)}
                disabled={loading}
                size="small"
                sx={{ border: '1px solid #ffcdd2', borderRadius: 2 }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>

            {/* Row 1: 4 fields side by side */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Diagnosis"
                  fullWidth
                  value={item.diagnosis}
                  onChange={(e) => handleChange(index, "diagnosis", e.target.value)}
                  disabled={loading}
                  InputProps={{ sx: { borderRadius: 2, fontFamily: "'Segoe UI', sans-serif", fontSize: '14px' } }}
                  InputLabelProps={{ sx: { fontFamily: "'Segoe UI', sans-serif", fontWeight: 600 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  value={item.status}
                  onChange={(e) => handleChange(index, "status", e.target.value)}
                  disabled={loading}
                  InputProps={{ sx: { borderRadius: 2, fontFamily: "'Segoe UI', sans-serif", fontSize: '14px' } }}
                  InputLabelProps={{ sx: { fontFamily: "'Segoe UI', sans-serif", fontWeight: 600 } }}
                >
                  <MenuItem value=""><em>Select</em></MenuItem>
                  {mockStatuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  label="Severity"
                  fullWidth
                  value={item.severity}
                  onChange={(e) => handleChange(index, "severity", e.target.value)}
                  disabled={loading}
                  InputProps={{ sx: { borderRadius: 2, fontFamily: "'Segoe UI', sans-serif", fontSize: '14px' } }}
                  InputLabelProps={{ sx: { fontFamily: "'Segoe UI', sans-serif", fontWeight: 600 } }}
                >
                  <MenuItem value=""><em>Select</em></MenuItem>
                  {mockSeverities.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Checkup Date & Time"
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={{ shrink: true, sx: { fontFamily: "'Segoe UI', sans-serif", fontWeight: 600 } }}
                  value={item.checkupDate || ""}
                  onChange={(e) => handleChange(index, "checkupDate", e.target.value)}
                  disabled={loading}
                  InputProps={{ sx: { borderRadius: 2, fontFamily: "'Segoe UI', sans-serif", fontSize: '14px' } }}
                />
              </Grid>

              {/* Row 2: Notes */}
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
            onClick={addDiagnosis}
            disabled={loading}
            sx={{ backgroundColor: '#1e3a5f', '&:hover': { backgroundColor: '#16324d' }, borderRadius: 3, textTransform: 'none' }}
          >
            Add Another Diagnosis
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || diagnoses.length === 0}
            sx={{ backgroundColor: '#1e3a5f', '&:hover': { backgroundColor: '#16324d' }, borderRadius: 3, textTransform: 'none' }}
          >
            {loading ? 'Saving...' : 'Save All Diagnoses'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default DiagnosesTab;