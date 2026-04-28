// Investigations.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, TextField, Chip, Button, Stack, Divider,
  Alert, Paper, Collapse, IconButton
} from "@mui/material";
import { ExpandMore, ExpandLess, Science, AddCircleOutline } from "@mui/icons-material";
import { saveInvestigation } from '../services/emrService';

const defaultInvestigations = [
  "CBC", "Blood Sugar", "CT Scan", "MRI", "X-Ray", "OCT",
  "Visual Field Test", "Fluorescein Angiography", "Ultrasound B-Scan",
  "Electroretinography (ERG)", "Electrooculography (EOG)",
  "Corneal Topography", "Specular Microscopy", "Tear Film Analysis",
  "Genetic Testing",
];

const Investigations = ({ patientId, medicalRecordId, existingData = [], onSaved }) => {
  const [selectedInvestigations, setSelectedInvestigations] = useState(() => {
    if (existingData.length > 0 && existingData[0].selectedInvestigations) {
      try {
        return JSON.parse(existingData[0].selectedInvestigations) || [];
      } catch { return []; }
    }
    return [];
  });

  const [customInvestigation, setCustomInvestigation] = useState("");
  const [notes, setNotes] = useState(existingData.length > 0 ? existingData[0].notes || "" : "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPrevious, setShowPrevious] = useState(false);

  const existingDataRef = useRef(existingData);
  useEffect(() => {
    if (existingData !== existingDataRef.current) {
      existingDataRef.current = existingData;
      if (existingData.length > 0) {
        const item = existingData[0];
        try {
          const parsed = item.selectedInvestigations ? JSON.parse(item.selectedInvestigations) : [];
          setSelectedInvestigations(Array.isArray(parsed) ? parsed : []);
        } catch { setSelectedInvestigations([]); }
        setNotes(item.notes || item.Notes || "");
      }
    }
  }, [existingData]);

  const handleSelect = (test) => {
    const updated = selectedInvestigations.includes(test)
      ? selectedInvestigations.filter((item) => item !== test)
      : [...selectedInvestigations, test];
    setSelectedInvestigations(updated);
  };

  const handleAddCustom = () => {
    if (customInvestigation.trim() !== "") {
      setSelectedInvestigations([...selectedInvestigations, customInvestigation.trim()]);
      setCustomInvestigation("");
    }
  };

  const handleRemoveInvestigation = (item) => {
    setSelectedInvestigations(selectedInvestigations.filter((i) => i !== item));
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
      await saveInvestigation(medicalRecordId, {
        selectedInvestigations: JSON.stringify(selectedInvestigations),
        notes: notes,
        isArchived: false
      });
      setMessage({ type: 'success', text: 'Investigations saved successfully!' });
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
              <Science color="primary" />
              <Typography variant="h6">Previous Investigations ({existingData.length})</Typography>
            </Box>
            <IconButton size="small">{showPrevious ? <ExpandLess /> : <ExpandMore />}</IconButton>
          </Box>
          <Collapse in={showPrevious}>
            <Box sx={{ p: 2, pt: 0 }}>
              {existingData.map((item, index) => (
                <Box key={item.id || index} sx={{ mb: 2, p: 1.5, borderBottom: '1px solid #ddd' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {new Date(item.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  {item.selectedInvestigations && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2"><strong>Investigations:</strong></Typography>
                      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                        {(() => {
                          try {
                            const invs = JSON.parse(item.selectedInvestigations);
                            return invs.map((inv, idx) => <Chip key={idx} label={inv} size="small" />);
                          } catch { return null; }
                        })()}
                      </Stack>
                    </Box>
                  )}
                  {item.notes && <Typography variant="body2"><strong>Notes:</strong> {item.notes}</Typography>}
                </Box>
              ))}
            </Box>
          </Collapse>
        </Paper>
      )}

      <form onSubmit={handleSubmit}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select or add investigations requested for the patient.
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
              label="Add Custom Investigation" variant="outlined" size="small"
              value={customInvestigation} onChange={(e) => setCustomInvestigation(e.target.value)}
              sx={{ flexGrow: 1 }}
              disabled={loading}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <Button
              variant="contained"
              startIcon={<AddCircleOutline />}
              onClick={handleAddCustom}
              disabled={loading || !customInvestigation.trim()}
              sx={{ backgroundColor: '#1e3a5f', '&:hover': { backgroundColor: '#16324d' }, borderRadius: 3, textTransform: 'none' }}
            >
              Add
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>Selected Investigations:</Typography>
          {selectedInvestigations.length > 0 ? (
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
              {selectedInvestigations.map((item, index) => (
                <Chip
                  key={index}
                  label={item}
                  color="success"
                  onDelete={() => handleRemoveInvestigation(item)}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">No investigations selected yet.</Typography>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>Notes</Typography>
          <TextField
            multiline rows={3} placeholder="Add any special notes or comments..." fullWidth
            value={notes} onChange={(e) => setNotes(e.target.value)} disabled={loading}
            InputProps={{ sx: { borderRadius: 2 } }}
          />

          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ backgroundColor: '#1e3a5f', '&:hover': { backgroundColor: '#16324d' }, borderRadius: 3, textTransform: 'none' }}
            >
              {loading ? 'Saving...' : 'Save Investigations'}
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default Investigations;