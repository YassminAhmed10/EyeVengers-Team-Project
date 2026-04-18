// PastImageTests.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Alert, CircularProgress, IconButton, Tooltip, Paper } from "@mui/material";
import { Delete, UploadFile, InsertDriveFile, Image, PictureAsPdf, Download } from "@mui/icons-material";
import { saveFile, getPatientFiles, deleteFile } from '../services/emrService';

const BASE_URL = 'http://localhost:5201';

const getFileIcon = (fileType) => {
  if (!fileType) return <InsertDriveFile sx={{ color: '#607d8b' }} />;
  if (fileType.startsWith('image/')) return <Image sx={{ color: '#1976d2' }} />;
  if (fileType === 'application/pdf') return <PictureAsPdf sx={{ color: '#e53935' }} />;
  return <InsertDriveFile sx={{ color: '#607d8b' }} />;
};

const PastImageTests = ({ medicalRecordId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!medicalRecordId) return;
    setLoading(true);
    getPatientFiles(medicalRecordId)
      .then(data => setFiles(data || []))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  }, [medicalRecordId]);

  const handleFileSelect = async (e) => {
    if (!medicalRecordId) {
      setMessage({ type: 'error', text: 'Please create a medical record first.' });
      return;
    }
    const selected = Array.from(e.target.files);
    if (!selected.length) return;
    e.target.value = '';

    setUploading(true);
    setMessage({ type: '', text: '' });
    let successCount = 0;
    let failCount = 0;

    for (const file of selected) {
      try {
        await saveFile(medicalRecordId, file);
        successCount++;
      } catch {
        failCount++;
      }
    }

    const updated = await getPatientFiles(medicalRecordId);
    setFiles(updated || []);
    setUploading(false);

    if (failCount === 0) {
      setMessage({ type: 'success', text: `${successCount} file(s) uploaded successfully.` });
    } else {
      setMessage({ type: 'warning', text: `${successCount} uploaded, ${failCount} failed.` });
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await deleteFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      setMessage({ type: 'success', text: 'File deleted.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete file.' });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <Box sx={{ mt: 2 }}>
      {message.text && (
        <Alert severity={message.type || 'info'} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {!medicalRecordId && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Create a medical record first to upload files.
        </Alert>
      )}

      <Button
        variant="contained"
        startIcon={<UploadFile />}
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || !medicalRecordId}
        sx={{ mb: 3, backgroundColor: '#1e3a5f', '&:hover': { backgroundColor: '#16324d' }, borderRadius: 3, textTransform: 'none' }}
      >
        {uploading ? 'Uploading...' : 'Upload File'}
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        style={{ display: 'none' }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : files.length === 0 ? (
        <Paper elevation={1} sx={{
          border: '2px dashed #cfd8dc',
          borderRadius: 3,
          py: 6,
          textAlign: 'center',
          color: '#90a4ae'
        }}>
          <InsertDriveFile sx={{ fontSize: 48, mb: 1, color: '#b0bec5' }} />
          <Typography>No files uploaded yet.</Typography>
        </Paper>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 2,
        }}>
          {files.map((file) => {
            const isImage = file.fileType?.startsWith('image/');
            const fileUrl = `${BASE_URL}${file.fileUrl}`;
            return (
              <Paper
                key={file.id}
                elevation={1}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 3,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 4 },
                }}
              >
                {/* Preview square */}
                <Box
                  component={isImage ? 'a' : 'div'}
                  href={isImage ? fileUrl : undefined}
                  target={isImage ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  sx={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    bgcolor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isImage ? 'zoom-in' : 'default',
                    overflow: 'hidden',
                  }}
                >
                  {isImage ? (
                    <Box
                      component="img"
                      src={fileUrl}
                      alt={file.fileName}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', color: '#90a4ae' }}>
                      {getFileIcon(file.fileType)}
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        {file.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Info + actions */}
                <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography
                    sx={{ fontWeight: 500, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    title={file.fileName}
                  >
                    {file.fileName}
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: '#90a4ae' }}>
                    {formatDate(file.createdAt)}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mt: 0.5 }}>
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        component="a"
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={file.fileName}
                      >
                        <Download fontSize="small" sx={{ color: '#1976d2' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(file.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default PastImageTests;