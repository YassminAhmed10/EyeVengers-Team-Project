// EyeExaminationForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Box, TextField, Grid, Typography, MenuItem, Alert, Paper,
    FormControl, InputLabel, Select, Button, Collapse, IconButton,
    Card, CardContent, Chip, Stack
} from "@mui/material";
import { ExpandMore, ExpandLess, Visibility, MedicalInformation } from "@mui/icons-material";
import { saveEyeExamination } from '../services/emrService';

const pupilOptions = ["Brisk", "Sluggish", "Non-reactive", "Other"];
const alignmentOptions = ["Orthophoria", "Esotropia", "Exotropia", "Other"];
const movementsOptions = ["Normal", "Restricted", "Other"];

const formatDate = (dateStr) => {
    if (!dateStr) return 'No date available';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'No date available';
    return d.toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

// Doctor Order Eye Exam Card
const DoctorOrderEyeExamCard = ({ order }) => {
    const [open, setOpen] = useState(false);
    const data = order.data || {};
    const rightEye = data.rightEye || {};
    const leftEye = data.leftEye || {};
    const date = order.createdAt || order.appointmentDate;

    return (
        <Card variant="outlined" sx={{
            mb: 1.5, borderRadius: 2,
            borderLeft: '4px solid #2e7d32',
            bgcolor: '#f1f8e9'
        }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Visibility sx={{ color: '#2e7d32', fontSize: 20 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                            Doctor's Eye Exam Request
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
                    {formatDate(date)}
                </Typography>
                <Collapse in={open}>
                    <Box sx={{ mt: 1.5, ml: 3.5 }}>
                        <Grid container spacing={1}>
                            {rightEye.visualAcuity && (
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2">
                                        <strong>Right Eye (OD):</strong> VA {rightEye.visualAcuity}
                                        {rightEye.eyePressure ? ` · Pressure ${rightEye.eyePressure} mmHg` : ''}
                                    </Typography>
                                </Grid>
                            )}
                            {leftEye.visualAcuity && (
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2">
                                        <strong>Left Eye (OS):</strong> VA {leftEye.visualAcuity}
                                    </Typography>
                                </Grid>
                            )}
                            {data.pupilReaction && (
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2">
                                        <strong>Pupil Reaction:</strong> {data.pupilReaction}
                                    </Typography>
                                </Grid>
                            )}
                            {data.eyeAlignment && (
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2">
                                        <strong>Eye Alignment:</strong> {data.eyeAlignment}
                                    </Typography>
                                </Grid>
                            )}
                            {data.anteriorSegment && (
                                <Grid item xs={12}>
                                    <Typography variant="body2">
                                        <strong>Anterior Segment:</strong> {data.anteriorSegment}
                                    </Typography>
                                </Grid>
                            )}
                            {data.fundusObservation && (
                                <Grid item xs={12}>
                                    <Typography variant="body2">
                                        <strong>Fundus:</strong> {data.fundusObservation}
                                    </Typography>
                                </Grid>
                            )}
                            {data.notes && (
                                <Grid item xs={12}>
                                    <Typography variant="body2">
                                        <strong>Notes:</strong> {data.notes}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                        {order.appointmentDate && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                <strong>Appointment:</strong> {formatDate(order.appointmentDate)} at {order.appointmentTime || ''}
                            </Typography>
                        )}
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
};

const EyeExaminationForm = ({ patientId, medicalRecordId, existingData = [], doctorOrders = [], onSaved }) => {
    const emptyForm = {
        rightEye: "", leftEye: "", eyePressure: "",
        pupilReaction: "", pupilReactionOther: "",
        eyeAlignment: "", eyeAlignmentOther: "",
        eyeMovements: "", eyeMovementsOther: "",
        anteriorSegment: "", fundusObservation: "", otherNotes: ""
    };

    const [formData, setFormData] = useState(() => {
        if (existingData.length > 0) {
            const e = existingData[0];
            return {
                rightEye: e.rightEye || e.RightEye || "",
                leftEye: e.leftEye || e.LeftEye || "",
                eyePressure: e.eyePressure || e.EyePressure || "",
                pupilReaction: e.pupilReaction || e.PupilReaction || "",
                pupilReactionOther: e.pupilReactionOther || "",
                eyeAlignment: e.eyeAlignment || e.EyeAlignment || "",
                eyeAlignmentOther: e.eyeAlignmentOther || "",
                eyeMovements: e.eyeMovements || e.EyeMovements || "",
                eyeMovementsOther: e.eyeMovementsOther || "",
                anteriorSegment: e.anteriorSegment || e.AnteriorSegment || "",
                fundusObservation: e.fundusObservation || e.FundusObservation || "",
                otherNotes: e.otherNotes || e.OtherNotes || ""
            };
        }
        return emptyForm;
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPrevious, setShowPrevious] = useState(false);
    const [showDoctorOrders, setShowDoctorOrders] = useState(true);

    const eyeExamOrders = doctorOrders.filter(o => o.orderType === 'eyeExam');

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
                    pupilReactionOther: e.pupilReactionOther || "",
                    eyeAlignment: e.eyeAlignment || e.EyeAlignment || "",
                    eyeAlignmentOther: e.eyeAlignmentOther || "",
                    eyeMovements: e.eyeMovements || e.EyeMovements || "",
                    eyeMovementsOther: e.eyeMovementsOther || "",
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
            await saveEyeExamination(medicalRecordId, { ...formData, isArchived: false });
            setMessage({ type: 'success', text: 'Eye examination saved successfully!' });
            onSaved?.();
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to save eye examination' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            {message.text && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

            {/* Doctor Orders Section */}
            {eyeExamOrders.length > 0 && (
                <Paper sx={{ mb: 3, bgcolor: '#f1f8e9', overflow: 'hidden', border: '1px solid #c8e6c9' }}>
                    <Box
                        onClick={() => setShowDoctorOrders(p => !p)}
                        sx={{
                            p: 2, display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', cursor: 'pointer',
                            userSelect: 'none', '&:hover': { bgcolor: '#dcedc8' }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Visibility sx={{ color: '#2e7d32' }} />
                            <Typography variant="h6" sx={{ color: '#2e7d32' }}>
                                Doctor's Eye Exam Requests ({eyeExamOrders.length})
                            </Typography>
                        </Box>
                        <IconButton size="small">{showDoctorOrders ? <ExpandLess /> : <ExpandMore />}</IconButton>
                    </Box>
                    <Collapse in={showDoctorOrders}>
                        <Box sx={{ p: 2, pt: 0 }}>
                            {eyeExamOrders.map((order, i) => (
                                <DoctorOrderEyeExamCard key={order.id || i} order={order} />
                            ))}
                        </Box>
                    </Collapse>
                </Paper>
            )}

            {/* Previous Examinations */}
            {existingData.length > 0 && (
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
                                        {formatDate(exam.createdAt)}
                                    </Typography>
                                    <Grid container spacing={1}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2"><strong>Right Eye:</strong> {exam.rightEye || exam.RightEye || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2"><strong>Left Eye:</strong> {exam.leftEye || exam.LeftEye || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2"><strong>Pressure:</strong> {exam.eyePressure || exam.EyePressure || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2"><strong>Pupil Reaction:</strong> {exam.pupilReaction || exam.PupilReaction || 'N/A'}</Typography>
                                        </Grid>
                                        {(exam.anteriorSegment || exam.AnteriorSegment) && (
                                            <Grid item xs={12}>
                                                <Typography variant="body2"><strong>Anterior Segment:</strong> {exam.anteriorSegment || exam.AnteriorSegment}</Typography>
                                            </Grid>
                                        )}
                                        {(exam.fundusObservation || exam.FundusObservation) && (
                                            <Grid item xs={12}>
                                                <Typography variant="body2"><strong>Fundus:</strong> {exam.fundusObservation || exam.FundusObservation}</Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Box>
                            ))}
                        </Box>
                    </Collapse>
                </Paper>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth size="small" label="Right Eye" placeholder="e.g., 20/20"
                                name="rightEye" value={formData.rightEye} onChange={handleChange}
                                disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth size="small" label="Left Eye" placeholder="e.g., 20/20"
                                name="leftEye" value={formData.leftEye} onChange={handleChange}
                                disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth size="small" label="Eye Pressure (mmHg)" placeholder="e.g., 15"
                                name="eyePressure" value={formData.eyePressure} onChange={handleChange}
                                disabled={loading} InputProps={{ sx: { borderRadius: 2 } }} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Pupil Reaction</InputLabel>
                                <Select name="pupilReaction" value={formData.pupilReaction}
                                    onChange={handleChange} label="Pupil Reaction"
                                    disabled={loading} sx={{ borderRadius: 2 }}>
                                    <MenuItem value=""><em>Select</em></MenuItem>
                                    {pupilOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                </Select>
                            </FormControl>
                            {formData.pupilReaction === "Other" && (
                                <TextField fullWidth size="small" label="Specify Pupil Reaction"
                                    name="pupilReactionOther" value={formData.pupilReactionOther || ""}
                                    onChange={handleChange} sx={{ mt: 1 }} disabled={loading}
                                    InputProps={{ sx: { borderRadius: 2 } }} />
                            )}
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Eye Alignment</InputLabel>
                                <Select name="eyeAlignment" value={formData.eyeAlignment}
                                    onChange={handleChange} label="Eye Alignment"
                                    disabled={loading} sx={{ borderRadius: 2 }}>
                                    <MenuItem value=""><em>Select</em></MenuItem>
                                    {alignmentOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                </Select>
                            </FormControl>
                            {formData.eyeAlignment === "Other" && (
                                <TextField fullWidth size="small" label="Specify Alignment"
                                    name="eyeAlignmentOther" value={formData.eyeAlignmentOther || ""}
                                    onChange={handleChange} sx={{ mt: 1 }} disabled={loading}
                                    InputProps={{ sx: { borderRadius: 2 } }} />
                            )}
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Eye Movements</InputLabel>
                                <Select name="eyeMovements" value={formData.eyeMovements}
                                    onChange={handleChange} label="Eye Movements"
                                    disabled={loading} sx={{ borderRadius: 2 }}>
                                    <MenuItem value=""><em>Select</em></MenuItem>
                                    {movementsOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                </Select>
                            </FormControl>
                            {formData.eyeMovements === "Other" && (
                                <TextField fullWidth size="small" label="Specify Eye Movements"
                                    name="eyeMovementsOther" value={formData.eyeMovementsOther || ""}
                                    onChange={handleChange} sx={{ mt: 1 }} disabled={loading}
                                    InputProps={{ sx: { borderRadius: 2 } }} />
                            )}
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, display: "flex", gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                        <TextField fullWidth size="small" multiline rows={3}
                            label="Anterior Segment Observation" placeholder="Enter observations..."
                            name="anteriorSegment" value={formData.anteriorSegment}
                            onChange={handleChange} disabled={loading}
                            InputProps={{ sx: { borderRadius: 2 } }} />
                        <TextField fullWidth size="small" multiline rows={3}
                            label="Fundus/Retina Observation" placeholder="Enter observations..."
                            name="fundusObservation" value={formData.fundusObservation}
                            onChange={handleChange} disabled={loading}
                            InputProps={{ sx: { borderRadius: 2 } }} />
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        <TextField fullWidth size="small" multiline rows={3}
                            label="Other Notes" placeholder="Enter any other notes..."
                            name="otherNotes" value={formData.otherNotes}
                            onChange={handleChange} disabled={loading}
                            InputProps={{ sx: { borderRadius: 2 } }} />
                    </Box>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button type="button" variant="outlined" onClick={() => setFormData(emptyForm)}
                            disabled={loading}
                            sx={{ borderColor: '#1e3a5f', color: '#1e3a5f', borderRadius: 3, textTransform: 'none' }}>
                            Clear Form
                        </Button>
                        <Button type="submit" variant="contained" disabled={loading}
                            sx={{ backgroundColor: '#1e3a5f', '&:hover': { backgroundColor: '#16324d' }, borderRadius: 3, textTransform: 'none' }}>
                            {loading ? 'Saving...' : 'Save Examination'}
                        </Button>
                    </Box>
                </Box>
            </form>
        </Box>
    );
};

export default EyeExaminationForm;