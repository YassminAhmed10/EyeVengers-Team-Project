import React, { useState } from 'react';
import { useMedicalRecord } from '../hooks/useMedicalRecord';
import {
    Box, Typography, TextField, Chip, Button, Stack, Divider,
    Alert, Paper
} from "@mui/material";

const defaultInvestigations = [
    "CBC",
    "Blood Sugar",
    "CT Scan",
    "MRI",
    "X-Ray",
    "OCT",
    "Visual Field Test",
    "Fluorescein Angiography",
    "Ultrasound B-Scan",
    "Electroretinography (ERG)",
    "Electrooculography (EOG)",
    "Corneal Topography",
    "Specular Microscopy",
    "Tear Film Analysis",
    "Genetic Testing",
];

const Investigations = ({ patientId, existingData = [] }) => {
    const [selectedInvestigations, setSelectedInvestigations] = useState(() => {
        if (existingData.length > 0 && existingData[0].selectedInvestigations) {
            try {
                return JSON.parse(existingData[0].selectedInvestigations) || [];
            } catch {
                return [];
            }
        }
        return [];
    });

    const [customInvestigation, setCustomInvestigation] = useState("");
    const [notes, setNotes] = useState(existingData.length > 0 ? existingData[0].notes || "" : "");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const { saveInvestigation } = useMedicalRecord(patientId);

    const handleSelect = (test) => {
        const updated = selectedInvestigations.includes(test)
            ? selectedInvestigations.filter((item) => item !== test)
            : [...selectedInvestigations, test];
        setSelectedInvestigations(updated);
    };

    const handleAddCustom = () => {
        if (customInvestigation.trim() !== "") {
            const updated = [...selectedInvestigations, customInvestigation.trim()];
            setSelectedInvestigations(updated);
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

            const result = await saveInvestigation({
                selectedInvestigations: JSON.stringify(selectedInvestigations),
                customInvestigation: customInvestigation,
                notes: notes,
                isArchived: false
            });

            setMessage({
                type: 'success',
                text: 'Investigations saved successfully!'
            });

            // Reload after 1.5 seconds
            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (error) {
            console.error('Error saving investigations:', error);
            setMessage({
                type: 'error',
                text: error.message || 'Failed to save investigations'
            });
        } finally {
            setLoading(false);
        }
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
                        Previous Investigations ({existingData.length})
                    </Typography>
                    {existingData.map((item, index) => (
                        <Box key={item.id || index} sx={{ mb: 2, p: 1, borderBottom: '1px solid #ddd' }}>
                            <Typography variant="body2" color="text.secondary">
                                {new Date(item.createdAt).toLocaleDateString()}
                            </Typography>
                            {item.selectedInvestigations && (
                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2">
                                        <strong>Investigations:</strong>
                                    </Typography>
                                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                                        {(() => {
                                            try {
                                                const investigations = JSON.parse(item.selectedInvestigations);
                                                return investigations.map((inv, idx) => (
                                                    <Chip key={idx} label={inv} size="small" />
                                                ));
                                            } catch {
                                                return null;
                                            }
                                        })()}
                                    </Stack>
                                </Box>
                            )}
                            {item.notes && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    <strong>Notes:</strong> {item.notes}
                                </Typography>
                            )}
                        </Box>
                    ))}
                </Paper>
            )}

            <form onSubmit={handleSubmit}>
                <Box sx={{ p: 3, backgroundColor: "#f9fafb", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <Typography variant="h5" gutterBottom>
                        Investigations
                    </Typography>

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
                            />
                        ))}
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <TextField
                            label="Add Custom Investigation"
                            variant="outlined"
                            size="small"
                            value={customInvestigation}
                            onChange={(e) => setCustomInvestigation(e.target.value)}
                            sx={{ flexGrow: 1 }}
                            disabled={loading}
                        />
                        <Button
                            variant="contained"
                            onClick={handleAddCustom}
                            disabled={loading || !customInvestigation.trim()}
                        >
                            Add
                        </Button>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" gutterBottom>
                        Selected Investigations:
                    </Typography>
                    {selectedInvestigations.length > 0 ? (
                        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
                            {selectedInvestigations.map((item, index) => (
                                <Chip
                                    key={index}
                                    label={item}
                                    color="success"
                                    onDelete={() => handleRemoveInvestigation(item)}
                                    disabled={loading}
                                />
                            ))}
                        </Stack>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No investigations selected yet.
                        </Typography>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" gutterBottom>
                        Notes
                    </Typography>
                    <TextField
                        multiline
                        rows={3}
                        placeholder="Add any special notes or comments..."
                        fullWidth
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={loading}
                    />

                    <Box sx={{ textAlign: "right", mt: 3 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
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