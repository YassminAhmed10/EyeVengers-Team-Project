import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FaCloudUploadAlt,
  FaFile,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaTrash,
  FaImage,
  FaFilePdf,
  FaTimes
} from 'react-icons/fa';
import axios from 'axios';

const RADIOLOGY_API = 'http://localhost:5301/api';
const MAX_FILE_SIZE = 104857600; // 100MB

export default function FileUploadPanel({ appointmentId, investigationId, onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const dragZoneRef = useRef(null);

  const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/dicom'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.dcm'];

  // Validate file
  const validateFile = (file) => {
    // Check size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File too large: ${file.name} (max 100MB)` };
    }

    // Check type
    if (!allowedMimeTypes.includes(file.type) && !allowedExtensions.includes(getExtension(file.name))) {
      return { valid: false, error: `Invalid file type: ${file.name}` };
    }

    return { valid: true, error: null };
  };

  const getExtension = (filename) => {
    return ('.' + filename.split('.').pop()).toLowerCase();
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <FaImage size={24} />;
    } else if (file.type === 'application/pdf') {
      return <FaFilePdf size={24} />;
    } else {
      return <FaFile size={24} />;
    }
  };

  const handleFileSelect = (selectedFiles) => {
    setUploadError('');
    const newFiles = [];

    Array.from(selectedFiles).forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        newFiles.push({
          file,
          id: Math.random().toString(36),
          status: 'pending'
        });
      } else {
        setUploadError(validation.error || 'Invalid file');
      }
    });

    setFiles([...files, ...newFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragZoneRef.current) {
      dragZoneRef.current.style.background = '#E0F2FE';
      dragZoneRef.current.style.borderColor = '#0EA5E9';
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (dragZoneRef.current) {
      dragZoneRef.current.style.background = '#F8FAFC';
      dragZoneRef.current.style.borderColor = '#CBD5E1';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragZoneRef.current) {
      dragZoneRef.current.style.background = '#F8FAFC';
      dragZoneRef.current.style.borderColor = '#CBD5E1';
    }
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (fileId) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadError('No files selected');
      return;
    }

    setUploading(true);
    setUploadSuccess(false);
    setUploadError('');

    const formData = new FormData();
    files.forEach(fileWrapper => {
      formData.append('files', fileWrapper.file);
    });

    try {
      const response = await axios.post(
        `${RADIOLOGY_API}/appointments/${appointmentId}/investigations/${investigationId}/upload-files`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress({ overall: progress });
          }
        }
      );

      if (response.data.success) {
        setUploadSuccess(true);
        setFiles([]);
        setUploadProgress({});
        
        if (onUploadComplete) {
          onUploadComplete(response.data.data);
        }

        // Clear success message after 3 seconds
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        setUploadError(response.data.message || 'Upload failed');
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Error uploading files');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}
    >
      <h2 style={{
        fontSize: '18px',
        fontWeight: 700,
        color: '#1e3a5f',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <FaCloudUploadAlt size={20} />
        Upload Investigation Files
      </h2>

      {/* Status Messages */}
      {uploadError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#FEE2E2',
            border: '1px solid #FECACA',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px'
          }}
        >
          <FaExclamationCircle size={14} />
          {uploadError}
        </motion.div>
      )}

      {uploadSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            background: '#DCFCE7',
            border: '1px solid #BBDE33',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px'
          }}
        >
          <FaCheckCircle size={14} />
          Files uploaded successfully!
        </motion.div>
      )}

      {/* Drag & Drop Zone */}
      <div
        ref={dragZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed #CBD5E1',
          borderRadius: '12px',
          padding: '40px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: '#F8FAFC',
          transition: 'all 0.3s ease',
          marginBottom: '20px'
        }}
      >
        <FaCloudUploadAlt size={40} color="#64748B" style={{ marginBottom: '12px' }} />
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e3a5f', margin: '0 0 8px 0' }}>
          Drag files here or click to select
        </h3>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0' }}>
          Supported formats: JPG, PNG, PDF, DICOM (Max 100MB each)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedExtensions.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a5f', marginBottom: '12px' }}>
            Selected Files ({files.length})
          </h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            {files.map((fileWrapper) => (
              <motion.div
                key={fileWrapper.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ color: '#64748b' }}>
                  {getFileIcon(fileWrapper.file)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1e293b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {fileWrapper.file.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {(fileWrapper.file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>

                {uploadProgress[fileWrapper.id] && (
                  <div style={{
                    width: '60px',
                    height: '4px',
                    background: '#e2e8f0',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${uploadProgress[fileWrapper.id]}%`,
                      background: '#10B981',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                )}

                <button
                  onClick={() => removeFile(fileWrapper.id)}
                  disabled={uploading}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#DC2626',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    padding: '4px',
                    opacity: uploading ? 0.5 : 1
                  }}
                >
                  <FaTimes />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && uploadProgress.overall && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e3a5f' }}>Uploading...</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
              {uploadProgress.overall}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: '#e2e8f0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress.overall}%` }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #1e3a5f, #2d5a8c)',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setFiles([])}
          disabled={files.length === 0 || uploading}
          style={{
            padding: '12px 24px',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            background: 'white',
            color: '#1e3a5f',
            cursor: (files.length === 0 || uploading) ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '13px',
            opacity: (files.length === 0 || uploading) ? 0.5 : 1
          }}
        >
          Clear All
        </button>
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            background: (files.length === 0 || uploading) ? '#CBD5E1' : '#1e3a5f',
            color: 'white',
            cursor: (files.length === 0 || uploading) ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {uploading && <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} />}
          {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}
