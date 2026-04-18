import React, { useState } from "react";
import { Box, TextField, Grid, Typography, Paper, Collapse, IconButton, Divider } from "@mui/material";
import { Person, Phone, Email, Home, EventNote, Badge, LocalHospital, Emergency, ExpandMore, ExpandLess, Wc, Shield, ContactEmergency } from "@mui/icons-material";

const fieldSx = {
    fontFamily: "'Segoe UI', sans-serif",
    fontSize: '16px',
    borderRadius: 2,
};
const labelSx = { sx: { fontFamily: "'Segoe UI', sans-serif", fontWeight: 600, fontSize: '12px' } };

const SectionLabel = ({ icon, label }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, mt: 0.5 }}>
        {icon}
        <Typography sx={{ fontWeight: 700, fontSize: '13px', color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: 1 }}>
            {label}
        </Typography>
        <Divider sx={{ flex: 1, borderColor: '#cae8ff' }} />
    </Box>
);

const PatientInfo = ({ patient, readOnly }) => {
    const [open, setOpen] = useState(true);

    const formatGender = (gender) => {
        if (typeof gender === 'number') return gender === 0 ? "Male" : gender === 1 ? "Female" : "Other";
        return gender || "Not specified";
    };

    return (
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
            <Box
                onClick={() => setOpen(!open)}
                sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    bgcolor: '#f5f9ff',
                    borderBottom: open ? '1px solid #e0e0e0' : 'none',
                    '&:hover': { bgcolor: '#e8f0fe' }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person sx={{ color: '#1e3a5f' }} />
                    <Typography variant="h6" sx={{ color: '#1e3a5f', fontWeight: 600, fontFamily: "'Segoe UI', sans-serif" }}>
                        Patient Information
                    </Typography>
                </Box>
                <IconButton size="small">
                    {open ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
            </Box>

            <Collapse in={open}>
                <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>

                        {/* Column 1 — Basic Info */}
                        <Grid size={{ xs: 12, md: 3 }}>
                            <SectionLabel icon={<Person sx={{ fontSize: 16, color: '#1e3a5f' }} />} label="Basic Info" />
                            <Grid container spacing={1}>
                                <Grid size={{ xs: 6 }}>
                                    <TextField fullWidth label="Patient ID" size="small"
                                        value={patient?.patientID || patient?.patientId || ""}
                                        InputProps={{ readOnly, startAdornment: <Badge sx={{ mr: 1, color: '#1e3a5f', fontSize: 16 }} />, sx: { ...fieldSx, fontWeight: 700, color: '#1e3a5f', fontFamily: 'monospace' } }}
                                        InputLabelProps={labelSx}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField fullWidth label="Full Name" size="small"
                                        value={patient?.name || ""}
                                        InputProps={{ readOnly, startAdornment: <Person sx={{ mr: 1, color: '#1e3a5f', fontSize: 16 }} />, sx: { ...fieldSx, fontWeight: 600 } }}
                                        InputLabelProps={labelSx}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField fullWidth label="Age" size="small"
                                        value={patient?.age || ""}
                                        InputProps={{ readOnly, startAdornment: <EventNote sx={{ mr: 1, color: '#1e3a5f', fontSize: 16 }} />, sx: fieldSx }}
                                        InputLabelProps={labelSx}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField fullWidth label="Gender" size="small"
                                        value={formatGender(patient?.gender)}
                                        InputProps={{ readOnly, startAdornment: <Wc sx={{ mr: 1, color: '#1e3a5f', fontSize: 16 }} />, sx: fieldSx }}
                                        InputLabelProps={labelSx}
                                    />
                                </Grid>
                                {patient?.birthDate && (
                                    <Grid size={{ xs: 6 }}>
                                        <TextField fullWidth label="Date of Birth" type="date" size="small"
                                            value={patient.birthDate.split('T')[0]}
                                            InputLabelProps={{ shrink: true, ...labelSx }}
                                            InputProps={{ readOnly, startAdornment: <EventNote sx={{ mr: 1, color: '#1e3a5f', fontSize: 16 }} />, sx: fieldSx }}
                                        />
                                    </Grid>
                                )}
                                {patient?.nationalId && (
                                    <Grid size={{ xs: 6 }}>
                                        <TextField fullWidth label="National ID" size="small"
                                            value={patient.nationalId}
                                            InputProps={{ readOnly, startAdornment: <Badge sx={{ mr: 1, color: '#1e3a5f', fontSize: 16 }} />, sx: fieldSx }}
                                            InputLabelProps={labelSx}
                                        />
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>

                        {/* Column 2 — Contact */}
                        <Grid size={{ xs: 12, md: 3 }}>
                            <SectionLabel icon={<Phone sx={{ fontSize: 16, color: '#1e3a5f' }} />} label="Contact" />
                            <Grid container spacing={1}>
                                <Grid size={{ xs: 6 }}>
                                    <TextField fullWidth label="Phone Number" size="small"
                                        value={patient?.contactNumber || ""}
                                        InputProps={{ readOnly, startAdornment: <Phone sx={{ mr: 1, color: '#1e3a5f', fontSize: 16 }} />, sx: fieldSx }}
                                        InputLabelProps={labelSx}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField fullWidth label="Email" size="small"
                                        value={patient?.email || ""}
                                        InputProps={{ readOnly, startAdornment: <Email sx={{ mr: 1, color: '#1e3a5f', fontSize: 16 }} />, sx: fieldSx }}
                                        InputLabelProps={labelSx}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField fullWidth label="Address" multiline rows={2}
                                        value={patient?.address || ""}
                                        InputProps={{ readOnly, startAdornment: <Home sx={{ mr: 1, alignSelf: 'flex-start', mt: 1, color: '#1e3a5f', fontSize: 16 }} />, sx: fieldSx }}
                                        InputLabelProps={labelSx}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Column 3 — Insurance */}
                        <Grid size={{ xs: 12, md: 3 }}>
                            <SectionLabel icon={<Shield sx={{ fontSize: 16, color: '#1e3a5f' }} />} label="Insurance" />
                            <Grid container spacing={1}>
                                <Grid size={{ xs: 12 }}>
                                    <TextField fullWidth label="Insurance Company" size="small"
                                        value={patient?.insuranceCompany || ""}
                                        InputProps={{ readOnly, startAdornment: <LocalHospital sx={{ mr: 1, color: '#2e7d32', fontSize: 16 }} />, sx: { ...fieldSx, color: patient?.insuranceCompany ? '#2e7d32' : 'inherit' } }}
                                        InputLabelProps={labelSx}
                                    />
                                </Grid>
                                {patient?.insuranceId && (
                                    <Grid size={{ xs: 6 }}>
                                        <TextField fullWidth label="Insurance ID" size="small"
                                            value={patient.insuranceId}
                                            InputProps={{ readOnly, startAdornment: <Badge sx={{ mr: 1, color: '#1e3a5f', fontSize: 16 }} />, sx: fieldSx }}
                                            InputLabelProps={labelSx}
                                        />
                                    </Grid>
                                )}
                                {patient?.policyNumber && (
                                    <Grid size={{ xs: 6 }}>
                                        <TextField fullWidth label="Policy Number" size="small"
                                            value={patient.policyNumber}
                                            InputProps={{ readOnly, startAdornment: <Badge sx={{ mr: 1, color: '#1e3a5f', fontSize: 16 }} />, sx: fieldSx }}
                                            InputLabelProps={labelSx}
                                        />
                                    </Grid>
                                )}
                                {patient?.coverage && (
                                    <Grid size={{ xs: 12 }}>
                                        <TextField fullWidth label="Coverage" size="small"
                                            value={`${patient.coverage}%`}
                                            InputProps={{ readOnly, startAdornment: <LocalHospital sx={{ mr: 1, color: '#1976d2', fontSize: 16 }} />, sx: { ...fieldSx, color: '#1976d2' } }}
                                            InputLabelProps={labelSx}
                                        />
                                    </Grid>
                                )}
                            </Grid>

                        </Grid>

                        {/* Column 4 — Emergency Contact */}
                        {(patient?.emergencyContactName || patient?.emergencyContactPhone) && (
                            <Grid size={{ xs: 12, md: 3 }}>
                                <SectionLabel icon={<ContactEmergency sx={{ fontSize: 16, color: '#d32f2f' }} />} label="Emergency Contact" />
                                <Grid container spacing={1}>
                                    {patient?.emergencyContactName && (
                                        <Grid size={{ xs: 12 }}>
                                            <TextField fullWidth label="Emergency Contact Name" size="small"
                                                value={patient.emergencyContactName}
                                                InputProps={{ readOnly, startAdornment: <Emergency sx={{ mr: 1, color: '#d32f2f', fontSize: 16 }} />, sx: fieldSx }}
                                                InputLabelProps={labelSx}
                                            />
                                        </Grid>
                                    )}
                                    {patient?.emergencyContactPhone && (
                                        <Grid size={{ xs: 12 }}>
                                            <TextField fullWidth label="Emergency Phone" size="small"
                                                value={patient.emergencyContactPhone}
                                                InputProps={{ readOnly, startAdornment: <Phone sx={{ mr: 1, color: '#d32f2f', fontSize: 16 }} />, sx: { ...fieldSx, color: '#d32f2f' } }}
                                                InputLabelProps={labelSx}
                                            />
                                        </Grid>
                                    )}
                                </Grid>
                            </Grid>
                        )}

                    </Grid>
                </Box>
            </Collapse>
        </Paper>
    );
};

export default PatientInfo;
