import React from "react";
import { Box, TextField, Grid, Typography, Chip, Stack } from "@mui/material";

const PatientInfo = ({ patient, readOnly }) => {
    // Format gender display
    const formatGender = (gender) => {
        if (typeof gender === 'number') {
            return gender === 0 ? "Male" : gender === 1 ? "Female" : "Other";
        }
        return gender || "Not specified";
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    return (
        <Box
            className="patient-info-section"
            sx={{
                p: 3,
                border: "2px solid #cae8ff",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #f8faff 0%, #ffffff 100%)",
                mb: 3,
            }}
        >
            <Typography
                variant="h6"
                gutterBottom
                sx={{
                    fontWeight: 700,
                    color: "#1e3a5f",
                    mb: 3,
                    display: "flex",
                    alignItems: "center"
                }}
            >
                <span
                    className="material-symbols-outlined"
                    style={{
                        fontSize: "1.5rem",
                        marginRight: "12px",
                        color: "#29b6f6"
                    }}
                >
                    person
                </span>
                Patient Information
            </Typography>

            <Grid container spacing={2}>
                {/* Basic Info Row */}
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Patient ID"
                        variant="outlined"
                        value={patient?.patientID || patient?.patientId || ""}
                        InputProps={{
                            readOnly,
                            sx: {
                                fontWeight: 600,
                                color: "#1e3a5f",
                                fontFamily: "monospace"
                            }
                        }}
                        sx={{
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Patient Name"
                        variant="outlined"
                        value={patient?.name || ""}
                        InputProps={{
                            readOnly,
                            sx: { fontWeight: 500 }
                        }}
                        sx={{
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Age"
                        variant="outlined"
                        value={patient?.age || ""}
                        InputProps={{
                            readOnly,
                            sx: { fontWeight: 500 }
                        }}
                        sx={{
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Gender"
                        variant="outlined"
                        value={formatGender(patient?.gender)}
                        InputProps={{
                            readOnly,
                            sx: { fontWeight: 500 }
                        }}
                        sx={{
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Visit Date"
                        type="date"
                        variant="outlined"
                        value={patient?.visitDate ? patient.visitDate.split('T')[0] : ""}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                            readOnly,
                            sx: { fontWeight: 500 }
                        }}
                        sx={{
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                        }}
                    />
                </Grid>

                {/* Contact & Insurance Row */}
                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Contact Number"
                        variant="outlined"
                        value={patient?.contactNumber || ""}
                        InputProps={{
                            readOnly,
                            sx: { fontWeight: 500 }
                        }}
                        sx={{
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Email"
                        variant="outlined"
                        value={patient?.email || ""}
                        InputProps={{
                            readOnly,
                            sx: { fontWeight: 500 }
                        }}
                        sx={{
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Insurance Company"
                        variant="outlined"
                        value={patient?.insuranceCompany || ""}
                        InputProps={{
                            readOnly,
                            sx: {
                                fontWeight: 500,
                                color: patient?.insuranceCompany ? "#2e7d32" : "inherit"
                            }
                        }}
                        sx={{
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                        }}
                    />
                </Grid>

                {/* Insurance Details Row */}
                {patient?.insuranceId && (
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Insurance ID"
                            variant="outlined"
                            value={patient.insuranceId}
                            InputProps={{
                                readOnly,
                                sx: { fontWeight: 500 }
                            }}
                            sx={{
                                '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                                '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                            }}
                        />
                    </Grid>
                )}

                {patient?.policyNumber && (
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Policy Number"
                            variant="outlined"
                            value={patient.policyNumber}
                            InputProps={{
                                readOnly,
                                sx: { fontWeight: 500 }
                            }}
                            sx={{
                                '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                                '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                            }}
                        />
                    </Grid>
                )}

                {patient?.coverage && (
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Coverage"
                            variant="outlined"
                            value={`${patient.coverage}%`}
                            InputProps={{
                                readOnly,
                                sx: {
                                    fontWeight: 500,
                                    color: "#1976d2"
                                }
                            }}
                            sx={{
                                '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                                '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                            }}
                        />
                    </Grid>
                )}

                {/* Address Row */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Address"
                        variant="outlined"
                        multiline
                        rows={2}
                        value={patient?.address || ""}
                        InputProps={{
                            readOnly,
                            sx: { fontWeight: 500 }
                        }}
                        sx={{
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                        }}
                    />
                </Grid>

                {/* Additional Info */}
                {patient?.birthDate && (
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Date of Birth"
                            type="date"
                            variant="outlined"
                            value={patient.birthDate.split('T')[0]}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                                readOnly,
                                sx: { fontWeight: 500 }
                            }}
                            sx={{
                                '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                                '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                            }}
                        />
                    </Grid>
                )}

                {patient?.nationalId && (
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="National ID"
                            variant="outlined"
                            value={patient.nationalId}
                            InputProps={{
                                readOnly,
                                sx: { fontWeight: 500 }
                            }}
                            sx={{
                                '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                                '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                            }}
                        />
                    </Grid>
                )}

                {/* Emergency Contacts */}
                {patient?.emergencyContactName && (
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Emergency Contact"
                            variant="outlined"
                            value={patient.emergencyContactName}
                            InputProps={{
                                readOnly,
                                sx: { fontWeight: 500 }
                            }}
                            sx={{
                                '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                                '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                            }}
                        />
                    </Grid>
                )}

                {patient?.emergencyContactPhone && (
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Emergency Phone"
                            variant="outlined"
                            value={patient.emergencyContactPhone}
                            InputProps={{
                                readOnly,
                                sx: {
                                    fontWeight: 500,
                                    color: "#d32f2f"
                                }
                            }}
                            sx={{
                                '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                                '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                            }}
                        />
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default PatientInfo;