// EyeExaminationForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Box, TextField, Grid, Typography, MenuItem, Alert, Paper,
    FormControl, InputLabel, Select, Button, Collapse, IconButton
} from "@mui/material";
import { ExpandMore, ExpandLess, Visibility } from "@mui/icons-material";
import { saveEyeExamination } from '../services/emrService';

const pupilOptions = ["Brisk", "Sluggish", "Non-reactive", "Other"];
const alignmentOptions = ["Orthophoria", "Esotropia", "Exotropia", "Other"];
const movementsOptions = ["Normal", "Restricted", "Other"];

const EyeExaminationForm = ({ patientId, medicalRecordId, existingData = [], onSaved }) => {
    const [formData, setFormData] = useState(() => {
        if (existingData.length > 0) {
            const latestExam = existingData[0];
            return {
                rightEye: latestExam.rightEye || "",
                leftEye: latestExam.leftEye || "",
                eyePressure: latestExam.eyePressure || "",
                pupilReaction: latestExam.pupilReaction || "",
                pupilReactionOther: latestExam.pupilReactionOther || "",
                eyeAlignment: latestExam.eyeAlignment || "",
                eyeAlignmentOther: latestExam.eyeAlignmentOther || "",
                eyeMovements: latestExam.eyeMovements || "",
                eyeMovementsOther: latestExam.eyeMovementsOther || "",
                anteriorSegment: latestExam.anteriorSegment || "",
                fundusObservation: latestExam.fundusObservation || "",
                otherNotes: latestExam.otherNotes || ""
            };
        }
        return {
            rightEye: "",
            leftEye: "",
            eyePressure: "",
            pupilReaction: "",
            pupilReactionOther: "",
            eyeAlignment: "",
            eyeAlignmentOther: "",
            eyeMovements: "",
            eyeMovementsOther: "",
            anteriorSegment: "",
            fundusObservation: "",
            otherNotes: ""
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
                const e = existingData[0];
                setFormData({
                    rightEye: e.rightEye || e.RightEye || "",
                    leftEye: e.leftEye || e.LeftEye || "",
                    eyePressure: e.eyePressure || e.EyePressure || "",
                    pupilReaction: e.pupilReaction || e.PupilReaction || "",
                    pupilReactionOther: e.pupilReactionOther || e.PupilReactionOther || "",
                    eyeAlignment: e.eyeAlignment || e.EyeAlignment || "",
                    eyeAlignmentOther: e.eyeAlignmentOther || e.EyeAlignmentOther || "",
                    eyeMovements: e.eyeMovements || e.EyeMovements || "",
                    eyeMovementsOther: e.eyeMovementsOther || e.EyeMovementsOther || "",
                    anteriorSegment: e.anteriorSegment || e.AnteriorSegment || "",
                    fundusObservation: e.fundusObservation || e.FundusObservation || "",
                    otherNotes: e.otherNotes || e.OtherNotes || ""
                });
            }
        }
    }, [existingData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!medicalRecordId) {
            setMessage({ type: 'error', text: 'Please create a medical record first.' });
            return;
        }
        try {
            setLoading(true);
            setMessage({ type: '', text: '' });
            await saveEyeExamination(medicalRecordId, {
                ...formData,
                isArchived: false
            });
            setMessage({ type: 'success', text: 'Eye examination saved successfully!' });
            onSaved?.();
        } catch (error) {
            console.error('Error saving eye examination:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to save eye examination' });
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            rightEye: "",
            leftEye: "",
            eyePressure: "",
            pupilReaction: "",
            pupilReactionOther: "",
            eyeAlignment: "",
            eyeAlignmentOther: "",
            eyeMovements: "",
            eyeMovementsOther: "",
            anteriorSegment: "",
            fundusObservation: "",
            otherNotes: ""
        });
    };

    return (
        <Box>
            {message.text && (
                <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>
            )}

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
                            <Visibility color="primary" />
                            <Typography variant="h6">Previous Eye Examinations ({existingData.length})</Typography>
                        </Box>
                        <IconButton size="small">{showPrevious ? <ExpandLess /> : <ExpandMore />}</IconButton>
                    </Box>
                    <Collapse in={showPrevious}>
                        <Box sx={{ p: 2, pt: 0 }}>
                            {existingData.map((exam, index) => (
                                <Box key={exam.id || index} sx={{ mb: 2, p: 1.5, borderBottom: '1px solid #ddd' }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        {new Date(exam.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                    <Grid container spacing={1}>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="body2"><strong>Right Eye:</strong> {exam.rightEye || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="body2"><strong>Left Eye:</strong> {exam.leftEye || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="body2"><strong>Pressure:</strong> {exam.eyePressure || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="body2"><strong>Pupil Reaction:</strong> {exam.pupilReaction || 'N/A'}</Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}
                        </Box>
                    </Collapse>
                </Paper>
            )}

            <form onSubmit={handleSubmit}>
                <Box>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Right Eye"
                                placeholder="e.g., 20/20"
                                name="rightEye"
                                value={formData.rightEye}
                                onChange={handleChange}
                                disabled={loading}
                                InputProps={{ sx: { borderRadius: 2 } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Left Eye"
                                placeholder="e.g., 20/20"
                                name="leftEye"
                                value={formData.leftEye}
                                onChange={handleChange}
                                disabled={loading}
                                InputProps={{ sx: { borderRadius: 2 } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Eye Pressure (mmHg)"
                                placeholder="e.g., 15"
                                name="eyePressure"
                                value={formData.eyePressure}
                                onChange={handleChange}
                                disabled={loading}
                                InputProps={{ sx: { borderRadius: 2 } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Pupil Reaction</InputLabel>
                                <Select
                                    name="pupilReaction"
                                    value={formData.pupilReaction}
                                    onChange={handleChange}
                                    label="Pupil Reaction"
                                    disabled={loading}
                                    sx={{ borderRadius: 2 }}
                                >
                                    <MenuItem value=""><em>Select</em></MenuItem>
                                    {pupilOptions.map((opt) => (
                                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {formData.pupilReaction === "Other" && (
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Specify Pupil Reaction"
                                    name="pupilReactionOther"
                                    value={formData.pupilReactionOther || ""}
                                    onChange={handleChange}
                                    sx={{ mt: 1 }}
                                    disabled={loading}
                                    InputProps={{ sx: { borderRadius: 2 } }}
                                />
                            )}
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Eye Alignment</InputLabel>
                                <Select
                                    name="eyeAlignment"
                                    value={formData.eyeAlignment}
                                    onChange={handleChange}
                                    label="Eye Alignment"
                                    disabled={loading}
                                    sx={{ borderRadius: 2 }}
                                >
                                    <MenuItem value=""><em>Select</em></MenuItem>
                                    {alignmentOptions.map((opt) => (
                                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {formData.eyeAlignment === "Other" && (
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Specify Alignment"
                                    name="eyeAlignmentOther"
                                    value={formData.eyeAlignmentOther || ""}
                                    onChange={handleChange}
                                    sx={{ mt: 1 }}
                                    disabled={loading}
                                    InputProps={{ sx: { borderRadius: 2 } }}
                                />
                            )}
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Eye Movements</InputLabel>
                                <Select
                                    name="eyeMovements"
                                    value={formData.eyeMovements}
                                    onChange={handleChange}
                                    label="Eye Movements"
                                    disabled={loading}
                                    sx={{ borderRadius: 2 }}
                                >
                                    <MenuItem value=""><em>Select</em></MenuItem>
                                    {movementsOptions.map((opt) => (
                                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {formData.eyeMovements === "Other" && (
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Specify Eye Movements"
                                    name="eyeMovementsOther"
                                    value={formData.eyeMovementsOther || ""}
                                    onChange={handleChange}
                                    sx={{ mt: 1 }}
                                    disabled={loading}
                                    InputProps={{ sx: { borderRadius: 2 } }}
                                />
                            )}
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, display: "flex", gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                        <TextField
                            fullWidth
                            size="small"
                            multiline
                            rows={3}
                            label="Anterior Segment Observation"
                            placeholder="Enter observations..."
                            name="anteriorSegment"
                            value={formData.anteriorSegment}
                            onChange={handleChange}
                            disabled={loading}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />

                        <TextField
                            fullWidth
                            size="small"
                            multiline
                            rows={3}
                            label="Fundus/Retina Observation"
                            placeholder="Enter observations..."
                            name="fundusObservation"
                            value={formData.fundusObservation}
                            onChange={handleChange}
                            disabled={loading}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            multiline
                            rows={3}
                            label="Other Notes"
                            placeholder="Enter any other notes..."
                            name="otherNotes"
                            value={formData.otherNotes}
                            onChange={handleChange}
                            disabled={loading}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                    </Box>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={handleClear}
                            disabled={loading}
                            sx={{ borderColor: '#1e3a5f', color: '#1e3a5f', borderRadius: 3, textTransform: 'none' }}
                        >
                            Clear Form
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{ backgroundColor: '#1e3a5f', '&:hover': { backgroundColor: '#16324d' }, borderRadius: 3, textTransform: 'none' }}
                        >
                            {loading ? 'Saving...' : 'Save Examination'}
                        </Button>
                    </Box>
                </Box>
            </form>
        </Box>
    );
};

export default EyeExaminationForm;