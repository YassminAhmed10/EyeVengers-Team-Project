// Operations.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, TextField, MenuItem, Tabs, Tab, Grid,
  Alert, Paper, Button, Collapse, IconButton
} from "@mui/material";
import { ExpandMore, ExpandLess, MedicalServices } from "@mui/icons-material";
import { saveOperation } from '../services/emrService';

const Operations = ({ patientId, medicalRecordId, existingData = [], onSaved }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [operation, setOperation] = useState(() => {
    if (existingData.length > 0) {
      const latestOp = existingData[0];
      return {
        name: latestOp.name || "",
        date: latestOp.date || "",
        eye: latestOp.eye || "",
        surgeon: latestOp.surgeon || "",
        diagnosis: latestOp.diagnosis || "",
        preMedications: latestOp.preMedications || "",
        specialInstructions: latestOp.specialInstructions || "",
        postMedications: latestOp.postMedications || "",
        followUp: latestOp.followUp || "",
        complications: latestOp.complications || "",
        status: latestOp.status || "",
        anesthesia: latestOp.anesthesia || "",
        duration: latestOp.duration || "",
      };
    }
    return {
      name: "", date: "", eye: "", surgeon: "", diagnosis: "", preMedications: "",
      specialInstructions: "", postMedications: "", followUp: "", complications: "",
      status: "", anesthesia: "", duration: "",
    };
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPrevious, setShowPrevious] = useState(false);

  const existingDataRef = useRef(existingData);
  useEffect(() => {
    if (existingData !== existingDataRef.current) {
      existingDataRef.current = existingData;
      if (existingData.length > 0) {
        const op = existingData[0];
        setOperation({
          name: op.name || op.Name || op.OperationName || "",
          date: op.date || op.Date || "",
          eye: op.eye || op.Eye || "",
          surgeon: op.surgeon || op.Surgeon || "",
          diagnosis: op.diagnosis || op.Diagnosis || "",
          preMedications: op.preMedications || op.PreMedications || "",
          specialInstructions: op.specialInstructions || op.SpecialInstructions || "",
          postMedications: op.postMedications || op.PostMedications || "",
          followUp: op.followUp || op.FollowUp || "",
          complications: op.complications || op.Complications || "",
          status: op.status || op.Status || "",
          anesthesia: op.anesthesia || op.Anesthesia || "",
          duration: op.duration || op.Duration || "",
        });
      }
    }
  }, [existingData]);

  const handleChangeField = (field, value) => {
    setOperation(prev => ({ ...prev, [field]: value }));
  };

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

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
      await saveOperation(medicalRecordId, {
        ...operation,
        date: operation.date || new Date().toISOString().split('T')[0],
        isArchived: false
      });
      setMessage({ type: 'success', text: 'Operation saved successfully!' });
      onSaved?.();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save' });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setOperation({
      name: "", date: "", eye: "", surgeon: "", diagnosis: "", preMedications: "",
      specialInstructions: "", postMedications: "", followUp: "", complications: "",
      status: "", anesthesia: "", duration: "",
    });
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
              <MedicalServices color="primary" />
              <Typography variant="h6">Previous Operations ({existingData.length})</Typography>
            </Box>
            <IconButton size="small">{showPrevious ? <ExpandLess /> : <ExpandMore />}</IconButton>
          </Box>
          <Collapse in={showPrevious}>
            <Box sx={{ p: 2, pt: 0 }}>
              {existingData.map((item, index) => (
                <Box key={item.id || index} sx={{ mb: 2, p: 1.5, borderBottom: '1px solid #ddd' }}>
                  <Typography variant="body2" color="text.secondary">{new Date(item.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Typography>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12 }}><Typography><strong>{item.name}</strong></Typography></Grid>
                    <Grid size={{ xs: 6 }}><Typography><strong>Date:</strong> {new Date(item.date).toLocaleDateString()}</Typography></Grid>
                    <Grid size={{ xs: 6 }}><Typography><strong>Eye:</strong> {item.eye}</Typography></Grid>
                    <Grid size={{ xs: 6 }}><Typography><strong>Status:</strong> {item.status}</Typography></Grid>
                    <Grid size={{ xs: 6 }}><Typography><strong>Surgeon:</strong> {item.surgeon}</Typography></Grid>
                    {item.diagnosis && <Grid size={{ xs: 12 }}><Typography><strong>Diagnosis:</strong> {item.diagnosis}</Typography></Grid>}
                  </Grid>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Paper>
      )}

      <form onSubmit={handleSubmit}>
        <Box>
          <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ mb: 2 }}>
            <Tab label="Basic Info" />
            <Tab label="Pre-Op" />
            <Tab label="Post-Op" />
            <Tab label="Status & Surgery Info" />
          </Tabs>

          {activeTab === 0 && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField label="Operation Name" fullWidth value={operation.name} onChange={(e) => handleChangeField("name", e.target.value)} disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={operation.date} onChange={(e) => handleChangeField("date", e.target.value)} disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField select label="Eye / Side" fullWidth value={operation.eye} onChange={(e) => handleChangeField("eye", e.target.value)} disabled={loading} InputProps={{ sx: { borderRadius: 2 } }}>
                    <MenuItem value=""><em>Select</em></MenuItem>
                    <MenuItem value="Right">Right</MenuItem>
                    <MenuItem value="Left">Left</MenuItem>
                    <MenuItem value="Both">Both</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ p: 2 }}>
              <TextField label="Diagnosis / Reason" fullWidth sx={{ mb: 1 }} value={operation.diagnosis} onChange={(e) => handleChangeField("diagnosis", e.target.value)} disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
              <TextField label="Pre-Op Medications" fullWidth sx={{ mb: 1 }} value={operation.preMedications} onChange={(e) => handleChangeField("preMedications", e.target.value)} disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
              <TextField label="Special Instructions" fullWidth value={operation.specialInstructions} onChange={(e) => handleChangeField("specialInstructions", e.target.value)} disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
            </Box>
          )}

          {activeTab === 2 && (
            <Box sx={{ p: 2 }}>
              <TextField label="Post-Op Medications" fullWidth sx={{ mb: 1 }} value={operation.postMedications} onChange={(e) => handleChangeField("postMedications", e.target.value)} disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
              <TextField label="Follow-up Schedule" fullWidth sx={{ mb: 1 }} value={operation.followUp} onChange={(e) => handleChangeField("followUp", e.target.value)} disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
              <TextField label="Complications" fullWidth value={operation.complications} onChange={(e) => handleChangeField("complications", e.target.value)} disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
            </Box>
          )}

          {activeTab === 3 && (
            <Box sx={{ p: 2 }}>
              <TextField select label="Status" fullWidth sx={{ mb: 1 }} value={operation.status} onChange={(e) => handleChangeField("status", e.target.value)} disabled={loading} InputProps={{ sx: { borderRadius: 2 } }}>
                <MenuItem value=""><em>Select</em></MenuItem>
                <MenuItem value="Planned">Planned</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </TextField>
              <TextField select label="Anesthesia Type" fullWidth sx={{ mb: 1 }} value={operation.anesthesia} onChange={(e) => handleChangeField("anesthesia", e.target.value)} disabled={loading} InputProps={{ sx: { borderRadius: 2 } }}>
                <MenuItem value=""><em>Select</em></MenuItem>
                <MenuItem value="Local">Local</MenuItem>
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Sedation">Sedation</MenuItem>
              </TextField>
              <TextField label="Duration" fullWidth placeholder="e.g., 1 hour" value={operation.duration} onChange={(e) => handleChangeField("duration", e.target.value)} disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
            </Box>
          )}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button type="button" variant="outlined" onClick={handleClear} disabled={loading} sx={{ borderColor: '#1e3a5f', color: '#1e3a5f', borderRadius: 3, textTransform: 'none' }}>
              Clear Form
            </Button>
            <Button type="submit" variant="contained" disabled={loading} sx={{ backgroundColor: '#1e3a5f', '&:hover': { backgroundColor: '#16324d' }, borderRadius: 3, textTransform: 'none' }}>
              {loading ? 'Saving...' : 'Save Operation'}
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default Operations;