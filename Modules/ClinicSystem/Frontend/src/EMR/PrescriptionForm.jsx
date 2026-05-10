// PrescriptionForm.jsx
import React, { useState } from 'react';
import {
  Box, TextField, Typography, Grid, Button, IconButton, MenuItem,
  Autocomplete, Alert, Paper, Card, CardContent, Chip, Collapse
} from "@mui/material";
import { Delete, AddCircle, Medication, ExpandMore, ExpandLess, LocalPharmacy } from "@mui/icons-material";
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

const formatDate = (dateStr) => {
  if (!dateStr) return 'No date available';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'No date available';
  return d.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

// Doctor Order Prescription Card
const DoctorOrderPrescriptionCard = ({ order }) => {
  const [open, setOpen] = useState(false);
  const data = order.data || {};
  const items = data.items || [];
  const date = order.createdAt || order.appointmentDate;

  return (
    <Card variant="outlined" sx={{
      mb: 1.5, borderRadius: 2,
      borderLeft: '4px solid #e65100',
      bgcolor: '#fff8f0'
    }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalPharmacy sx={{ color: '#e65100', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#e65100' }}>
              Doctor's Prescription
              {items.length > 0 && ` — ${items.map(i => i.drug).filter(Boolean).join(', ')}`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={order.status || 'Pending'}
              size="small"
              color={order.status === 'Booked' || order.status === 'Completed' ? 'success' :
                order.status === 'Accepted' ? 'primary' :
                  order.status === 'Rejected' ? 'error' : 'warning'}
              variant="outlined"
            />
            <IconButton size="small" onClick={() => setOpen(p => !p)}>
              {open ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>
        <Typography variant="caption" sx={{ color: '#666', ml: 3.5 }}>
          {formatDate(date)} · {items.length} medication{items.length !== 1 ? 's' : ''}
        </Typography>
        <Collapse in={open}>
          <Box sx={{ mt: 1.5, ml: 3.5 }}>
            {items.map((item, i) => (
              <Box key={i} sx={{ mb: 1.5, p: 1.5, bgcolor: '#fafafa', borderRadius: 1, border: '1px solid #ffe0cc' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.3 }}>
                  {item.drug}{item.form ? ` — ${item.form}` : ''}
                </Typography>
                <Typography variant="body2" sx={{ color: '#555' }}>
                  {[item.dose, item.frequency, item.duration].filter(Boolean).join(' · ')}
                </Typography>
                {item.notes && (
                  <Typography variant="caption" sx={{ color: '#888' }}>{item.notes}</Typography>
                )}
              </Box>
            ))}
            {data.notes && (
              <Typography variant="body2"><strong>Notes:</strong> {data.notes}</Typography>
            )}
            {order.appointmentDate && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                <strong>Pickup Appointment:</strong> {formatDate(order.appointmentDate)} at {order.appointmentTime || ''}
              </Typography>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

const PrescriptionForm = ({ patientId, medicalRecordId, data, setData, doctorOrders = [], onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDoctorOrders, setShowDoctorOrders] = useState(true);

  const prescriptionOrders = doctorOrders.filter(o => o.orderType === 'prescription');

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

      {/* Doctor Orders Section */}
      {prescriptionOrders.length > 0 && (
        <Paper sx={{ mb: 3, bgcolor: '#fff8f0', overflow: 'hidden', border: '1px solid #ffccbc' }}>
          <Box
            onClick={() => setShowDoctorOrders(p => !p)}
            sx={{
              p: 2, display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', cursor: 'pointer',
              userSelect: 'none', '&:hover': { bgcolor: '#ffe0cc' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalPharmacy sx={{ color: '#e65100' }} />
              <Typography variant="h6" sx={{ color: '#e65100' }}>
                Doctor's Prescription Requests ({prescriptionOrders.length})
              </Typography>
            </Box>
            <IconButton size="small">{showDoctorOrders ? <ExpandLess /> : <ExpandMore />}</IconButton>
          </Box>
          <Collapse in={showDoctorOrders}>
            <Box sx={{ p: 2, pt: 0 }}>
              {prescriptionOrders.map((order, i) => (
                <DoctorOrderPrescriptionCard key={order.id || i} order={order} />
              ))}
            </Box>
          </Collapse>
        </Paper>
      )}

      {/* Prescription Items */}
      {data.map((item, index) => (
        <Paper key={index} elevation={1} sx={{
          mb: 2, p: 2, border: '1px solid #cae8ff', borderRadius: 3, bgcolor: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#1e3a5f', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Medication fontSize="small" /> Drug #{index + 1}
            </Typography>
            <IconButton color="error" onClick={() => removePrescription(index)}
              disabled={loading} size="small" sx={{ border: '1px solid #ffcdd2', borderRadius: 2 }}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Autocomplete
                freeSolo
                options={mockDrugs}
                getOptionLabel={(option) => option.label || ""}
                onChange={(e, value) => handleChange(index, "drug", value?.label || "")}
                renderInput={(params) => (
                  <TextField {...params} label="Drug Name" placeholder="Search or type..."
                    fullWidth value={item.drug}
                    onChange={(e) => handleChange(index, "drug", e.target.value)}
                    InputProps={{ ...params.InputProps, sx: { borderRadius: 2, fontSize: '14px' } }}
                    InputLabelProps={{ sx: { fontWeight: 600 } }} />
                )}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select label="Form" fullWidth value={item.form}
                onChange={(e) => handleChange(index, "form", e.target.value)}
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2, fontSize: '14px' } }}
                InputLabelProps={{ sx: { fontWeight: 600 } }}>
                {drugForms.map(form => <MenuItem key={form} value={form}>{form}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select label="Dose" fullWidth value={item.dose}
                onChange={(e) => handleChange(index, "dose", e.target.value)}
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2, fontSize: '14px' } }}
                InputLabelProps={{ sx: { fontWeight: 600 } }}>
                {doseOptions.map(dose => <MenuItem key={dose} value={dose}>{dose}</MenuItem>)}
              </TextField>
              {item.dose === "Other" && (
                <TextField label="Custom Dose" fullWidth sx={{ mt: 1 }}
                  value={item.customDose}
                  onChange={(e) => handleChange(index, "customDose", e.target.value)}
                  disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
              )}
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select label="Frequency" fullWidth value={item.frequency}
                onChange={(e) => handleChange(index, "frequency", e.target.value)}
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2, fontSize: '14px' } }}
                InputLabelProps={{ sx: { fontWeight: 600 } }}>
                {frequencies.map(freq => <MenuItem key={freq} value={freq}>{freq}</MenuItem>)}
              </TextField>
              {item.frequency === "Other" && (
                <TextField label="Custom Frequency" fullWidth sx={{ mt: 1 }}
                  value={item.customFrequency}
                  onChange={(e) => handleChange(index, "customFrequency", e.target.value)}
                  disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField label="Notes" multiline rows={2} fullWidth value={item.notes}
                onChange={(e) => handleChange(index, "notes", e.target.value)}
                disabled={loading}
                InputProps={{ sx: { borderRadius: 2, fontSize: '14px' } }}
                InputLabelProps={{ sx: { fontWeight: 600 } }} />
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 3 }}>
        <Button variant="contained" startIcon={<AddCircle />}
          onClick={addPrescription} disabled={loading}
          sx={{ backgroundColor: '#1e3a5f', '&:hover': { backgroundColor: '#16324d' }, borderRadius: 3, textTransform: 'none' }}>
          Add Another Drug
        </Button>
        <Button variant="contained" color="primary"
          onClick={handleSave} disabled={loading}
          sx={{ backgroundColor: '#1e3a5f', '&:hover': { backgroundColor: '#16324d' }, borderRadius: 3, textTransform: 'none' }}>
          {loading ? 'Saving...' : 'Save Prescriptions'}
        </Button>
      </Box>
    </Box>
  );
};

export default PrescriptionForm;