// Investigations.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, TextField, Chip, Button, Stack, Divider,
  Alert, Paper, Collapse, IconButton, Card, CardContent, CircularProgress
} from "@mui/material";
import { 
  ExpandMore, ExpandLess, Science, AddCircleOutline, MedicalInformation,
  CheckCircle, Warning, SignalCellular4Bar, Assignment, Note, Save, Error
} from "@mui/icons-material";
import { saveInvestigation } from '../services/emrService';
import axios from 'axios';

const BASE_URL = "http://localhost:5201/api";

const defaultInvestigations = [
  "CBC", "Blood Sugar", "CT Scan", "MRI", "X-Ray", "OCT",
  "Visual Field Test", "Fluorescein Angiography", "Ultrasound B-Scan",
  "Electroretinography (ERG)", "Electrooculography (EOG)",
  "Corneal Topography", "Specular Microscopy", "Tear Film Analysis",
  "Genetic Testing",
];

// ✓ Unified function to read fields with different names
const getField = (obj, ...keys) => {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return null;
};

// ✓ Date and time formatting function
const formatDateTime = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleString('en-US', {
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });
};

// ✓ Function to verify that data is real (not fake)
const isValidInvestigation = (item) => {
  // Check for real ID
  const id = getField(item, 'id', 'Id');
  if (!id || id === 0 || id === '0') return false;
  
  // Check for date (if present)
  const createdAt = getField(item, 'createdAt', 'CreatedAt', 'created_at', 'date', 'Date');
  
  // If there is a date, this is a strong indicator that data is real
  if (createdAt) return true;
  
  // If there is no date, check that selectedInvestigations is not dummy text
  const investigations = getField(item, 'selectedInvestigations', 'SelectedInvestigations');
  if (investigations && typeof investigations === 'string') {
    // Ignore data containing duplicate dummy values
    if (investigations.includes('["CT Scan","MRI"]') && !createdAt) return false;
    if (investigations === '["CT Scan","MRI"]' && !createdAt) return false;
  }
  
  return true;
};

// ✓ Function to convert stored JSON to array
const parseInvestigations = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }
};

// ============================================================
// Doctor Order Investigation Card
// ============================================================
const DoctorOrderInvestigationCard = ({ order }) => {
  const [open, setOpen] = useState(false);
  const data = order.data || {};
  const tests = parseInvestigations(data.selectedTests || data.tests || data.selectedInvestigations);
  const requestName = data.requestName || data.name || (tests.length ? tests.join(', ') : 'Medical Test');
  const priority = data.priority || 'Routine';
  const notes = data.notes || '';
  const date = order.createdAt || order.appointmentDate;

  const priorityColors = {
    'Routine': '#2e7d32',
    'Urgent': '#ed6c02',
    'Emergency': '#d32f2f'
  };

  return (
    <Card variant="outlined" sx={{
      mb: 1.5, borderRadius: 2,
      borderLeft: '4px solid #1e3a5f',
      bgcolor: '#f0f4ff'
    }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MedicalInformation sx={{ color: '#1e3a5f', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e3a5f' }}>
              Doctor's Order — {requestName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={
                order.status === 'Booked' ? 'Booked' :
                order.status === 'Completed' ? 'Completed' :
                order.status === 'Accepted' ? 'Accepted' :
                order.status === 'Rejected' ? 'Rejected' : 'Pending'
              }
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 3.5, mt: 0.5 }}>
          <Typography variant="caption" sx={{ color: '#666' }}>
            {formatDateTime(date) || 'No date'} 
          </Typography>
          <Chip 
            label={priority === 'Routine' ? 'Routine' : priority === 'Urgent' ? 'Urgent' : 'Emergency'}
            size="small"
            sx={{ 
              height: 20, 
              fontSize: '0.7rem',
              bgcolor: priorityColors[priority] + '20',
              color: priorityColors[priority],
              fontWeight: 600
            }}
          />
        </Box>
        <Collapse in={open}>
          <Box sx={{ mt: 1.5, ml: 3.5 }}>
            {tests.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Required Tests:</Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.5}>
                  {tests.map((t, i) => <Chip key={i} label={t} size="small" color="primary" variant="outlined" />)}
                </Stack>
              </Box>
            )}
            {notes && (
              <Typography variant="body2"><strong>Doctor's Notes:</strong> {notes}</Typography>
            )}
            {order.appointmentDate && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                <strong>Appointment Date:</strong> {formatDateTime(order.appointmentDate)} {order.appointmentTime ? `at ${order.appointmentTime}` : ''}
              </Typography>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

// ============================================================
// Main Component
// ============================================================
const Investigations = ({ 
  patientId, 
  medicalRecordId, 
  existingData = [], 
  doctorOrders = [], 
  onSaved, 
  readOnly = false 
}) => {
  const [selectedInvestigations, setSelectedInvestigations] = useState([]);
  const [customInvestigation, setCustomInvestigation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPrevious, setShowPrevious] = useState(true);
  const [showDoctorOrders, setShowDoctorOrders] = useState(true);
  const [previousInvestigations, setPreviousInvestigations] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  const investigationOrders = doctorOrders.filter(o => o.orderType === 'investigation');

  // ✓ Function to fetch previous investigations from API only (ignore dummy existingData)
  const fetchInvestigations = useCallback(async () => {
    if (!medicalRecordId) {
      console.log('[WARNING] medicalRecordId not found');
      setPreviousInvestigations([]);
      return;
    }
    
    setFetchingHistory(true);
    try {
      console.log('[FETCH] Fetching investigations from API:', `${BASE_URL}/Investigation/ByRecord/${medicalRecordId}`);
      const response = await axios.get(`${BASE_URL}/Investigation/ByRecord/${medicalRecordId}`);
      
      console.log('[SUCCESS] API response:', response.data);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        // ✓ Filter dummy data and keep only real data
        const validData = response.data.filter(item => isValidInvestigation(item));
        console.log('[DATA] Valid data only:', validData);
        setPreviousInvestigations(validData);
      } else {
        console.log('[WARNING] No data from API');
        setPreviousInvestigations([]);
      }
    } catch (err) {
      console.error('[ERROR] Failed to fetch investigations:', err.response?.status, err.message);
      setPreviousInvestigations([]);
    } finally {
      setFetchingHistory(false);
    }
  }, [medicalRecordId]);

  // Fetch investigations when component loads
  useEffect(() => {
    fetchInvestigations();
  }, [fetchInvestigations]);

  // ✓ Function to add new investigation
  const handleSelect = (test) => {
    if (readOnly) return;
    setSelectedInvestigations(prev =>
      prev.includes(test) ? prev.filter(i => i !== test) : [...prev, test]
    );
  };

  const handleAddCustom = () => {
    if (readOnly) return;
    if (customInvestigation.trim()) {
      setSelectedInvestigations(prev => [...prev, customInvestigation.trim()]);
      setCustomInvestigation("");
    }
  };

  const handleRemove = (item) => {
    if (readOnly) return;
    setSelectedInvestigations(prev => prev.filter(i => i !== item));
  };

  // ✓ Function to save new investigations
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) return;
    
    if (selectedInvestigations.length === 0) {
      setMessage({ type: 'warning', text: 'Please select at least one test' });
      return;
    }
    
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      if (!medicalRecordId) {
        setMessage({ type: 'error', text: 'Please save the medical record first' });
        return;
      }

      console.log('[SAVE] Saving investigations:', selectedInvestigations);
      
      await saveInvestigation(medicalRecordId, {
        selectedInvestigations: JSON.stringify(selectedInvestigations),
        notes,
        isArchived: false,
      });

      setMessage({ type: 'success', text: 'Investigations saved successfully!' });
      
      // ✓ Refetch data to show new investigation
      await fetchInvestigations();
      
      if (onSaved) onSaved();
      
      setSelectedInvestigations([]);
      setNotes("");

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    } catch (error) {
      console.error('[ERROR] Save error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save investigations' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {/* Doctor's Orders */}
      {investigationOrders.length > 0 && (
        <Paper sx={{ mb: 3, bgcolor: '#eef2ff', overflow: 'hidden', border: '1px solid #c7d2fe' }}>
          <Box
            onClick={() => setShowDoctorOrders(p => !p)}
            sx={{
              p: 2, display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', cursor: 'pointer',
              userSelect: 'none', '&:hover': { bgcolor: '#e0e7ff' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MedicalInformation sx={{ color: '#1e3a5f' }} />
              <Typography variant="h6" sx={{ color: '#1e3a5f' }}>
                Doctor's Test Orders ({investigationOrders.length})
              </Typography>
            </Box>
            <IconButton size="small">{showDoctorOrders ? <ExpandLess /> : <ExpandMore />}</IconButton>
          </Box>
          <Collapse in={showDoctorOrders}>
            <Box sx={{ p: 2, pt: 0 }}>
              {investigationOrders.map((order, i) => (
                <DoctorOrderInvestigationCard key={order.id || i} order={order} />
              ))}
            </Box>
          </Collapse>
        </Paper>
      )}

      {/* Previous Investigations - displays only real data from API */}
      {previousInvestigations.length > 0 ? (
        <Paper sx={{ mb: 3, bgcolor: '#f5f5f5', overflow: 'hidden' }}>
          <Box
            onClick={() => setShowPrevious(p => !p)}
            sx={{
              p: 2, display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', cursor: 'pointer',
              userSelect: 'none', '&:hover': { bgcolor: '#eeeeee' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Science color="primary" />
              <Typography variant="h6">
                Previous Investigations ({previousInvestigations.length})
                {fetchingHistory && <CircularProgress size={14} sx={{ ml: 1 }} />}
              </Typography>
            </Box>
            <IconButton size="small">{showPrevious ? <ExpandLess /> : <ExpandMore />}</IconButton>
          </Box>
          <Collapse in={showPrevious}>
            <Box sx={{ p: 2, pt: 0 }}>
              {previousInvestigations.map((item, index) => {
                const rawDate = getField(item, 'createdAt', 'CreatedAt', 'created_at', 'date', 'Date');
                const dateDisplay = formatDateTime(rawDate);
                const invRaw = getField(item, 'selectedInvestigations', 'SelectedInvestigations', 'tests', 'Tests');
                const investigationsList = parseInvestigations(invRaw);
                const notesRaw = getField(item, 'notes', 'Notes');
                const itemId = getField(item, 'id', 'Id');
                
                return (
                  <Box
                    key={itemId || index}
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      bgcolor: 'white',
                      borderRadius: 2,
                      border: '1px solid #e0e0e0',
                      '&:last-child': { mb: 0 }
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1,
                        color: dateDisplay ? '#1e3a5f' : '#999',
                        fontWeight: dateDisplay ? 600 : 400,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <Science sx={{ fontSize: 16 }} />
                      {dateDisplay || '📅 No date recorded'}
                    </Typography>

                    {investigationsList.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Tests:
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                          {investigationsList.map((inv, idx) => (
                            <Chip 
                              key={idx} 
                              label={inv} 
                              size="small"
                              sx={{ bgcolor: '#e3f2fd', fontWeight: 500 }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {notesRaw && (
                      <Typography variant="body2" sx={{ mt: 1, color: '#555' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Note sx={{ fontSize: '1.2rem', color: '#1976d2' }} />
                          <strong>Notes:</strong> {notesRaw}
                        </Stack>
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Collapse>
        </Paper>
      ) : (
        !fetchingHistory && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ py: 3 }}>
              <Assignment sx={{ fontSize: '2rem', color: '#9e9e9e' }} />
              <Typography variant="body1" sx={{ color: '#9e9e9e' }}>
                No previous investigations recorded. You can add new investigations using the form below.
              </Typography>
            </Stack>
          </Alert>
        )
      )}

      {/* Form to add new investigations */}
      {!readOnly && (
        <form onSubmit={handleSubmit}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1e3a5f', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddCircleOutline /> Add New Investigations
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select the required tests for the patient or add a custom test.
            </Typography>
            
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
              {defaultInvestigations.map((test) => (
                <Chip
                  key={test}
                  label={test}
                  clickable
                  color={selectedInvestigations.includes(test) ? "primary" : "default"}
                  onClick={() => handleSelect(test)}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <TextField
                label="Add Custom Test"
                variant="outlined"
                size="small"
                value={customInvestigation}
                onChange={(e) => setCustomInvestigation(e.target.value)}
                sx={{ flexGrow: 1 }}
                disabled={loading}
              />
              <Button
                variant="contained"
                startIcon={<AddCircleOutline />}
                onClick={handleAddCustom}
                disabled={loading || !customInvestigation.trim()}
                sx={{ backgroundColor: '#1e3a5f' }}
              >
                Add
              </Button>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom>Selected Tests:</Typography>
            {selectedInvestigations.length > 0 ? (
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
                {selectedInvestigations.map((item, index) => (
                  <Chip
                    key={index}
                    label={item}
                    color="success"
                    onDelete={() => handleRemove(item)}
                    disabled={loading}
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No tests selected yet.
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom>Additional Notes</Typography>
            <TextField
              multiline
              rows={3}
              placeholder="Add any notes or special instructions..."
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || selectedInvestigations.length === 0}
                sx={{ 
                  backgroundColor: '#1e3a5f', 
                  minWidth: 200,
                  py: 1
                }}
              >
                <Save sx={{ mr: 1 }} />
                {loading ? 'Saving...' : 'Save Investigations'}
              </Button>
            </Box>
          </Paper>
        </form>
      )}
    </Box>
  );
};

export default Investigations;