import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, IconButton, Grid, Button } from "@mui/material";
import { Delete } from "@mui/icons-material";

const mockOldFiles = [

  {
    id: 2,
    name: "CBC_Report.pdf",
    url: "https://via.placeholder.com/150?text=CBC+Report",
    type: "file",
  },
  {
    id: 3,
    name: "OCT_June2024.jpg",
    url: "https://via.placeholder.com/150?text=OCT+June2024",
    type: "image",
  },
];

const PastImageTests = () => {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFiles(mockOldFiles);
  }, []);

  const handleFileUpload = (e) => {
    const uploaded = Array.from(e.target.files).map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("image/") ? "image" : "file",
    }));
    setFiles((prev) => [...prev, ...uploaded]);
    e.target.value = "";
  };

  const handleRemoveFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Past Images & Lab Tests
      </Typography>

      <Button
        variant="contained"
        sx={{ mb: 3 }}
        onClick={() => fileInputRef.current?.click()}
      >
        Upload New File
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        style={{ display: "none" }}
      />

      <Grid container spacing={2}>
        {files.map((file) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
            <Box
              sx={{
                border: "1px solid #ccc",
                borderRadius: 2,
                p: 1,
                textAlign: "center",
                position: "relative",
                backgroundColor: "#fafafa",
              }}
            >
              {file.type === "image" ? (
                <img
                  src={file.url}
                  alt={file.name}
                  style={{ width: "100%", borderRadius: 4 }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#e0e0e0",
                    borderRadius: 2,
                  }}
                >
                  <Typography>{file.name}</Typography>
                </Box>
              )}

              <Typography
                sx={{
                  mt: 1,
                  fontSize: "0.85rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {file.name}
              </Typography>

              <IconButton
                size="small"
                color="error"
                sx={{ position: "absolute", top: 4, right: 4 }}
                onClick={() => handleRemoveFile(file.id)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PastImageTests;