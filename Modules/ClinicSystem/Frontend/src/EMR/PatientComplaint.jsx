// PatientComplaint.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Box, TextField, Typography, Button, FormControl, InputLabel, Select, MenuItem,
  Alert, Tooltip, Chip, Paper, Collapse, IconButton
} from "@mui/material";
import { ExpandMore, ExpandLess, Mic, Stop, Translate, Assignment, FiberManualRecord } from "@mui/icons-material";
import { saveComplaint } from '../services/emrService';

const PatientComplaint = ({ medicalRecordId, data = {}, setData, onSaved, existingData = [] }) => {
  const [recording, setRecording] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [browserSupport, setBrowserSupport] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [currentText, setCurrentText] = useState(data.complaint || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPrevious, setShowPrevious] = useState(false);
  const recognitionRef = useRef(null);
  const finalTextRef = useRef(data.complaint || "");

  useEffect(() => {
    finalTextRef.current = data.complaint || "";
    setCurrentText(data.complaint || "");
  }, [data.complaint]);

  useEffect(() => {
    const supported = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    setBrowserSupport(supported);
  }, []);

  const startRecording = () => {
    if (!browserSupport) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => { setIsListening(true); setRecording(true); };
    recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          const separator = finalTextRef.current && !finalTextRef.current.endsWith(" ") ? " " : "";
          finalTextRef.current += separator + transcript;
          setData(prev => ({ ...prev, complaint: finalTextRef.current }));
        } else {
          interimTranscript += transcript;
        }
      }
      setCurrentText(finalTextRef.current + (interimTranscript ? " " + interimTranscript : ""));
    };
    recognition.onerror = () => stopRecording();
    recognition.onend = () => {
      setIsListening(false);
      setRecording(false);
      setCurrentText(finalTextRef.current);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
    setIsListening(false);
    setCurrentText(finalTextRef.current);
    setData({ ...data, complaint: finalTextRef.current });
  };

  const handleChange = (e) => {
    const value = e.target.value;
    finalTextRef.current = value;
    setCurrentText(value);
    setData({ ...data, complaint: value });
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    if (recording) stopRecording();
  };

  const handleSave = async () => {
    if (!medicalRecordId) {
      setMessage({ type: 'error', text: 'Please create a medical record first.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      await saveComplaint(medicalRecordId, { complaint: finalTextRef.current });
      setMessage({ type: 'success', text: 'Complaint saved successfully!' });
      onSaved?.();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save' });
    } finally {
      setLoading(false);
    }
  };

  const isArabic = language.startsWith("ar");

  return (
    <Box sx={{ p: 3 }}>
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
              <Assignment color="primary" />
              <Typography variant="h6">Previous Complaints ({existingData.length})</Typography>
            </Box>
            <IconButton size="small">{showPrevious ? <ExpandLess /> : <ExpandMore />}</IconButton>
          </Box>
          <Collapse in={showPrevious}>
            <Box sx={{ p: 2, pt: 0 }}>
              {existingData.map((item, index) => (
                <Box key={item.id || index} sx={{ mb: 2, p: 1.5, borderBottom: '1px solid #ddd' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown date'}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {item.originalText || item.complaint || item.OriginalText || item.Complaint || '—'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Paper>
      )}

      {!browserSupport && <Alert severity="warning" sx={{ mb: 2 }}>Browser does not support speech recognition</Alert>}

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2, p: 2, borderRadius: 2, backgroundColor: "#f8f9fa", border: "1px solid #e0e0e0" }}>
        <FormControl sx={{ minWidth: 190 }}>
          <InputLabel><Translate sx={{ mr: 1, verticalAlign: 'middle' }} /> Language</InputLabel>
          <Select value={language} label="Language" onChange={handleLanguageChange} disabled={recording}>
            <MenuItem value="en-US">English</MenuItem>
            <MenuItem value="ar-EG">العربية (EG)</MenuItem>
            <MenuItem value="ar-SA">العربية (SA)</MenuItem>
          </Select>
        </FormControl>
        <Chip icon={<Translate />} label={language} variant="outlined" size="small" />
        <Tooltip title={recording ? "Stop Recording" : "Start Voice Input"}>
          <Button
            variant="contained"
            onClick={recording ? stopRecording : startRecording}
            sx={{
              ml: "auto", minWidth: "70px", height: "70px", borderRadius: "50%",
              backgroundColor: recording ? "#f44336" : "#4caf50",
              "&:hover": { backgroundColor: recording ? "#d32f2f" : "#388e3c" },
              boxShadow: recording ? "0 0 0 8px rgba(244, 67, 54, 0.3)" : "0 0 0 8px rgba(76, 175, 80, 0.3)",
              animation: recording ? "pulse 1.5s infinite" : "none"
            }}
          >
            {recording ? <Stop size={32} /> : <Mic size={32} />}
          </Button>
        </Tooltip>
      </Box>

      <TextField
        multiline rows={8} fullWidth value={currentText} onChange={handleChange}
        label={isArabic ? "شكوى المريض" : "Patient Complaint"}
        placeholder={isArabic ? "اكتب شكوى المريض أو استخدم الإدخال الصوتي..." : "Type patient complaint or use voice input..."}
        sx={{
          "& .MuiOutlinedInput-root": { borderRadius: 2, direction: isArabic ? "rtl" : "ltr", backgroundColor: isListening ? "#eef7ff" : "#fafafa" },
          "& textarea": { textAlign: isArabic ? "right" : "left", fontFamily: isArabic ? "'Cairo', 'Segoe UI', Arial" : "inherit" }
        }}
        disabled={loading}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
        <Typography variant="caption" color="text.secondary">Characters: {currentText.length}</Typography>
        {recording && (
          <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "error.main", fontWeight: 600 }}>
            <FiberManualRecord fontSize="small" /> Recording
          </Typography>
        )}
      </Box>

      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          sx={{ backgroundColor: '#1e3a5f', '&:hover': { backgroundColor: '#16324d' }, borderRadius: 3, textTransform: 'none' }}
        >
          {loading ? 'Saving...' : 'Save Complaint'}
        </Button>
      </Box>
    </Box>
  );
};

export default PatientComplaint;