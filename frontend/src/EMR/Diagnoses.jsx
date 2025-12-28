import React, { useState } from 'react';
import { useMedicalRecord } from '../hooks/useMedicalRecord';
import {
    Box, Grid, TextField, MenuItem, Typography, IconButton, Button,
    Alert, Paper
} from "@mui/material";
import { AddCircle, Delete } from "@mui/icons-material";

const mockStatuses = ["Active", "Inactive", "Resolved"];
const mockSeverities = ["Mild", "Moderate", "Severe"];

const DiagnosesTab = ({ patientId, existingData = [] }) => {
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

    const { saveDiagnosis } = useMedicalRecord(patientId);

    const handleChange = (index, field, value) => {
        const updated = [...diagnoses];
        updated[index][field] = value;
        setDiagnoses(updated);
    };

    const addDiagnosis = () => {
        setDiagnoses([...diagnoses, {
            diagnosis: "",
            status: "",
            severity: "",
            notes: "",
            checkupDate: ""
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

            // Save each diagnosis
            for (const diagnosis of diagnoses) {
                if (diagnosis.diagnosis.trim()) {
                    await saveDiagnosis({
                        diagnosisName: diagnosis.diagnosis,
                        status: diagnosis.status,
                        severity: diagnosis.severity,
                        notes: diagnosis.notes,
                        checkupDate: diagnosis.checkupDate || new Date().toISOString(),
                        isArchived: false
                    });
                }
            }

            setMessage({
                type: 'success',
                text: 'Diagnoses saved successfully!'
            });

            // Reload after 1.5 seconds
            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (error) {
            console.error('Error saving diagnoses:', error);
            setMessage({
                type: 'error',
                text: error.message || 'Failed to save diagnoses'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ mt: 3 }}>
            {message.text && (
                <Alert severity={message.type} sx={{ mb: 2 }}>
                    {message.text}
                </Alert>
            )}

            {existingData.length > 0 && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                    <Typography variant="h6" gutterBottom>
                        Previous Diagnoses ({existingData.length})
                    </Typography>
                    {existingData.map((item, index) => (
                        <Box key={item.id || index} sx={{ mb: 2, p: 1, borderBottom: '1px solid #ddd' }}>
                            <Typography variant="body2" color="text.secondary">
                                {new Date(item.createdAt).toLocaleDateString()}
                            </Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={12}>
                                    <Typography variant="body1">
                                        <strong>Diagnosis:</strong> {item.diagnosisName}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">
                                        <strong>Status:</strong> {item.status}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">
                                        <strong>Severity:</strong> {item.severity}
                                    </Typography>
                                </Grid>
                                {item.notes && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2">
                                            <strong>Notes:</strong> {item.notes}
                                        </Typography>
                                    </Grid>
                                )}
                                {item.checkupDate && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2">
                                            <strong>Checkup Date:</strong> {new Date(item.checkupDate).toLocaleDateString()}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    ))}
                </Paper>
            )}

            <form onSubmit={handleSubmit}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    Diagnoses
                </Typography>

                {diagnoses.map((item, index) => (
                    <Grid
                        container
                        spacing={2}
                        key={index}
                        sx={{
                            mb: 2,
                            p: 2,
                            border: "1px solid #ccc",
                            borderRadius: 2,
                            backgroundColor: "#fafafa",
                            alignItems: "center",
                        }}
                    >
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Diagnosis"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={item.diagnosis}
                                onChange={(e) => handleChange(index, "diagnosis", e.target.value)}
                                placeholder="Enter diagnosis..."
                                disabled={loading}
                            />
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <TextField
                                select
                                label="Status"
                                variant="outlined"
                                fullWidth
                                size="small"
                                InputLabelProps={{ shrink: true, style: { fontSize: 14, fontWeight: 600 } }}
                                inputProps={{ style: { fontSize: 14 } }}
                                value={item.status}
                                onChange={(e) => handleChange(index, "status", e.target.value)}
                                disabled={loading}
                            >
                                <MenuItem value=""><em>Select</em></MenuItem>
                                {mockStatuses.map((s) => (
                                    <MenuItem key={s} value={s}>{s}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <TextField
                                select
                                label="Severity"
                                variant="outlined"
                                fullWidth
                                size="small"
                                InputLabelProps={{ shrink: true, style: { fontSize: 14, fontWeight: 600 } }}
                                inputProps={{ style: { fontSize: 14 } }}
                                value={item.severity}
                                onChange={(e) => handleChange(index, "severity", e.target.value)}
                                disabled={loading}
                            >
                                <MenuItem value=""><em>Select</em></MenuItem>
                                {mockSeverities.map((s) => (
                                    <MenuItem key={s} value={s}>{s}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={1} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <IconButton
                                color="error"
                                onClick={() => removeDiagnosis(index)}
                                disabled={loading}
                            >
                                <Delete />
                            </IconButton>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Notes"
                                multiline
                                rows={2}
                                fullWidth
                                value={item.notes}
                                onChange={(e) => handleChange(index, "notes", e.target.value)}
                                placeholder="Add any specific notes..."
                                disabled={loading}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Checkup Date & Time"
                                type="datetime-local"
                                fullWidth
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                value={item.checkupDate || ""}
                                onChange={(e) => handleChange(index, "checkupDate", e.target.value)}
                                disabled={loading}
                            />
                        </Grid>
                    </Grid>
                ))}

                <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between", mt: 3 }}>
                    <Button
                        variant="contained"
                        startIcon={<AddCircle />}
                        onClick={addDiagnosis}
                        disabled={loading}
                    >
                        Add Another Diagnosis
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading || diagnoses.length === 0}
                    >
                        {loading ? 'Saving...' : 'Save All Diagnoses'}
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default DiagnosesTab;