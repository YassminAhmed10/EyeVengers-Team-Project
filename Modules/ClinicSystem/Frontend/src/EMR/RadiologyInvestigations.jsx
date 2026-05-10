import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Science, Download, Description } from '@mui/icons-material';
import radiologyService from '../services/radiologyService';

const RadiologyInvestigations = ({ patientId, readOnly = false }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [investigations, setInvestigations] = useState([]);

  useEffect(() => {
    const fetchRadiologyData = async () => {
      try {
        setLoading(true);
        setError("");
        
        if (!patientId) {
          setError("No patient ID provided");
          setInvestigations([]);
          return;
        }

        console.log("[FETCH] Fetching radiology investigations for patient:", patientId);
        const data = await radiologyService.getPatientInvestigations(patientId);
        
        if (data && data.length > 0) {
          const formatted = radiologyService.formatInvestigations(data);
          console.log("[SUCCESS] Radiology investigations loaded:", formatted);
          setInvestigations(formatted);
        } else {
          console.log("ℹ️ No radiology investigations found for this patient");
          setInvestigations([]);
        }
      } catch (err) {
        console.error("[ERROR] Error fetching radiology investigations:", err);
        setError(`Failed to load radiology data: ${err.message}`);
        setInvestigations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRadiologyData();
  }, [patientId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!investigations || investigations.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: 2 }}>
        <Science sx={{ fontSize: 48, color: '#bdbdbd', mb: 1 }} />
        <Typography color="textSecondary">
          No radiology investigations found for this patient.
        </Typography>
      </Paper>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ mb: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 2, border: '1px solid #90caf9' }}>
        <Typography variant="body2" sx={{ color: '#1565c0' }}>
          <strong>Radiology Center Data:</strong> These investigations were processed by the Radiology Center.
        </Typography>
      </Paper>

      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead sx={{ backgroundColor: '#1e3a5f' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Investigation Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Findings</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {investigations.map((inv, idx) => (
              <TableRow key={inv.id || idx} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Science sx={{ color: '#6a1b9a', fontSize: 18 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {inv.type}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {inv.description}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(inv.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(inv.date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={inv.status}
                    size="small"
                    color={getStatusColor(inv.status)}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {inv.findings || 'No findings recorded'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {inv.reportUrl ? (
                    <a
                      href={inv.reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      <Chip
                        icon={<Download />}
                        label="View Report"
                        size="small"
                        variant="outlined"
                        color="primary"
                        clickable
                      />
                    </a>
                  ) : (
                    <Typography variant="caption" color="textSecondary">
                      —
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
        Powered by Radiology Center | Last updated: {new Date().toLocaleString()}
      </Typography>
    </Box>
  );
};

export default RadiologyInvestigations;
