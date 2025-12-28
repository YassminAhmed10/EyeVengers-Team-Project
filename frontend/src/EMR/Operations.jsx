import React, { useState } from 'react';
import { useMedicalRecord } from '../hooks/useMedicalRecord';
import {
    Box, Typography, TextField, MenuItem, Tabs, Tab, Grid,
    Alert, Paper, Button
} from "@mui/material";

const Operations = ({ patientId, existingData = [] }) => {
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
            name: "",
            date: "",
            eye: "",
            surgeon: "",
            diagnosis: "",
            preMedications: "",
            specialInstructions: "",
            postMedications: "",
            followUp: "",
            complications: "",
            status: "",
            anesthesia: "",
            duration: "",
        };
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const { saveOperation } = useMedicalRecord(patientId);

    const handleChangeField = (field, value) => {
        setOperation(prev => ({ ...prev, [field]: value }));
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setMessage({ type: '', text: '' });

            const result = await saveOperation({
                name: operation.name,
                date: operation.date,
                eye: operation.eye,
                surgeon: operation.surgeon,
                diagnosis: operation.diagnosis,
                preMedications: operation.preMedications,
                specialInstructions: operation.specialInstructions,
                postMedications: operation.postMedications,
                followUp: operation.followUp,
                complications: operation.complications,
                status: operation.status,
                anesthesia: operation.anesthesia,
                duration: operation.duration,
                isArchived: false
            });

            setMessage({
                type: 'success',
                text: 'Operation saved successfully!'
            });

            // Reload after 1.5 seconds
            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (error) {
            console.error('Error saving operation:', error);
            setMessage({
                type: 'error',
                text: error.message || 'Failed to save operation'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setOperation({
            name: "",
            date: "",
            eye: "",
            surgeon: "",
            diagnosis: "",
            preMedications: "",
            specialInstructions: "",
            postMedications: "",
            followUp: "",
            complications: "",
            status: "",
            anesthesia: "",
            duration: "",
        });
    };

    return (
        <Box>
            {message.text && (
                <Alert severity={message.type} sx={{ mb: 2 }}>
                    {message.text}
                </Alert>
            )}

            {existingData.length > 0 && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                    <Typography variant="h6" gutterBottom>
                        Previous Operations ({existingData.length})
                    </Typography>
                    {existingData.map((item, index) => (
                        <Box key={item.id || index} sx={{ mb: 2, p: 1, borderBottom: '1px solid #ddd' }}>
                            <Typography variant="body2" color="text.secondary">
                                {new Date(item.createdAt).toLocaleDateString()}
                            </Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={12}>
                                    <Typography variant="body1">
                                        <strong>{item.name}</strong>
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">
                                        <strong>Date:</strong> {new Date(item.date).toLocaleDateString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">
                                        <strong>Eye:</strong> {item.eye}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">
                                        <strong>Status:</strong> {item.status}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">
                                        <strong>Surgeon:</strong> {item.surgeon}
                                    </Typography>
                                </Grid>
                                {item.diagnosis && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2">
                                            <strong>Diagnosis:</strong> {item.diagnosis}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    ))}
                </Paper>
            )}

            <form onSubmit={handleSubmit}>
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                        🏥 Operation Details
                    </Typography>

                    <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ mb: 2 }}>
                        <Tab label="Basic Info" />
                        <Tab label="Pre-Op" />
                        <Tab label="Post-Op" />
                        <Tab label="Status & Surgery Info" />
                    </Tabs>

                    {activeTab === 0 && (
                        <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        label="Operation Name"
                                        fullWidth
                                        sx={{ mb: 1 }}
                                        value={operation.name}
                                        onChange={(e) => handleChangeField("name", e.target.value)}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        label="Date"
                                        type="date"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ mb: 1 }}
                                        value={operation.date}
                                        onChange={(e) => handleChangeField("date", e.target.value)}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        select
                                        label="Eye / Side"
                                        fullWidth
                                        value={operation.eye}
                                        onChange={(e) => handleChangeField("eye", e.target.value)}
                                        disabled={loading}
                                    >
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
                        <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
                            <TextField
                                label="Diagnosis / Reason"
                                fullWidth
                                sx={{ mb: 1 }}
                                value={operation.diagnosis}
                                onChange={(e) => handleChangeField("diagnosis", e.target.value)}
                                disabled={loading}
                            />
                            <TextField
                                label="Pre-Op Medications"
                                fullWidth
                                sx={{ mb: 1 }}
                                value={operation.preMedications}
                                onChange={(e) => handleChangeField("preMedications", e.target.value)}
                                disabled={loading}
                            />
                            <TextField
                                label="Special Instructions"
                                fullWidth
                                value={operation.specialInstructions}
                                onChange={(e) => handleChangeField("specialInstructions", e.target.value)}
                                disabled={loading}
                            />
                        </Box>
                    )}

                    {activeTab === 2 && (
                        <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
                            <TextField
                                label="Post-Op Medications"
                                fullWidth
                                sx={{ mb: 1 }}
                                value={operation.postMedications}
                                onChange={(e) => handleChangeField("postMedications", e.target.value)}
                                disabled={loading}
                            />
                            <TextField
                                label="Follow-up Schedule"
                                fullWidth
                                sx={{ mb: 1 }}
                                value={operation.followUp}
                                onChange={(e) => handleChangeField("followUp", e.target.value)}
                                disabled={loading}
                            />
                            <TextField
                                label="Complications"
                                fullWidth
                                value={operation.complications}
                                onChange={(e) => handleChangeField("complications", e.target.value)}
                                disabled={loading}
                            />
                        </Box>
                    )}

                    {activeTab === 3 && (
                        <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
                            <TextField
                                select
                                label="Status"
                                fullWidth
                                sx={{ mb: 1 }}
                                value={operation.status}
                                onChange={(e) => handleChangeField("status", e.target.value)}
                                disabled={loading}
                            >
                                <MenuItem value=""><em>Select</em></MenuItem>
                                <MenuItem value="Planned">Planned</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                                <MenuItem value="Cancelled">Cancelled</MenuItem>
                            </TextField>
                            <TextField
                                select
                                label="Anesthesia Type"
                                fullWidth
                                sx={{ mb: 1 }}
                                value={operation.anesthesia}
                                onChange={(e) => handleChangeField("anesthesia", e.target.value)}
                                disabled={loading}
                            >
                                <MenuItem value=""><em>Select</em></MenuItem>
                                <MenuItem value="Local">Local</MenuItem>
                                <MenuItem value="General">General</MenuItem>
                                <MenuItem value="Sedation">Sedation</MenuItem>
                            </TextField>
                            <TextField
                                label="Duration"
                                fullWidth
                                placeholder="e.g., 1 hour"
                                value={operation.duration}
                                onChange={(e) => handleChangeField("duration", e.target.value)}
                                disabled={loading}
                            />
                        </Box>
                    )}

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={handleClear}
                            disabled={loading}
                        >
                            Clear Form
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Operation'}
                        </Button>
                    </Box>
                </Box>
            </form>
        </Box>
    );
};

export default Operations;