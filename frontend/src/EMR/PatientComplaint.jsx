import React, { useState, useRef, useEffect } from 'react';
import { useMedicalRecord } from '../hooks/useMedicalRecord';
import {
    Box,
    TextField,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Tooltip,
    Chip
} from "@mui/material";

import {
    MdMic,
    MdStop,
    MdLanguage,
    MdTranslate,
    MdAssignment,
    MdFiberManualRecord
} from "react-icons/md";

const PatientComplaint = ({ data, setData, patientId }) => {    
    const [recording, setRecording] = useState(false);
    const [language, setLanguage] = useState("en-US");
    const { saveData, loading, error } = useMedicalRecord(patientId);
    const [browserSupport, setBrowserSupport] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [currentText, setCurrentText] = useState(data.complaint || "");
    const recognitionRef = useRef(null);
    const finalTextRef = useRef(data.complaint || "");

    // Sync with parent
    useEffect(() => {
        finalTextRef.current = data.complaint || "";
        setCurrentText(data.complaint || "");
    }, [data.complaint]);

    // Browser support check
    useEffect(() => {
        const supported =
            "webkitSpeechRecognition" in window ||
            "SpeechRecognition" in window;
        setBrowserSupport(supported);
    }, []);

    const startRecording = () => {
        if (!browserSupport) return;

        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        const recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onstart = () => {
            setIsListening(true);
            setRecording(true);
        };

        recognition.onresult = (event) => {
            let interimTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    const separator =
                        finalTextRef.current &&
                            !finalTextRef.current.endsWith(" ")
                            ? " "
                            : "";

                    finalTextRef.current += separator + transcript;

                    setData(prev => ({
                        ...prev,
                        complaint: finalTextRef.current
                    }));
                } else {
                    interimTranscript += transcript;
                }
            }

            setCurrentText(
                finalTextRef.current +
                (interimTranscript ? " " + interimTranscript : "")
            );
        };

        recognition.onerror = () => stopRecording();

        recognition.onend = () => {
            setIsListening(false);
            setRecording(false);
            setCurrentText(finalTextRef.current);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopRecording = () => {
        recognitionRef.current?.stop();
        setRecording(false);
        setIsListening(false);

        setCurrentText(finalTextRef.current);
        setData({
            ...data,
            complaint: finalTextRef.current
        });
    };

    const handleChange = (e) => {
        const value = e.target.value;
        finalTextRef.current = value;
        setCurrentText(value);
        setData({ ...data, complaint: value });
    };

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
        if (recording) stopRecording();
    };

    const isArabic = language.startsWith("ar");

    


    return (
        <Box sx={{ p: 3 }}>
            <Typography
                variant="h6"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                    fontWeight: 600
                }}
            >
                <MdAssignment size={22} />
                Patient Complaint
            </Typography>

            {!browserSupport && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Browser does not support speech recognition
                </Alert>
            )}

            {/* Controls */}
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    mb: 2,
                    p: 2,
                    borderRadius: 1.5,
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e0e0e0"
                }}
            >
                <FormControl sx={{ minWidth: 190 }}>
                    <InputLabel>
                        <MdLanguage style={{ marginRight: 77 }} />
                        Language
                    </InputLabel>
                    <Select
                        value={language}
                        label="Language"
                        onChange={handleLanguageChange}
                        disabled={recording}
                    >
                        <MenuItem value="en-US">English</MenuItem>
                        <MenuItem value="ar-EG">العربية (EG)</MenuItem>
                        <MenuItem value="ar-SA">العربية (SA)</MenuItem>
                    </Select>
                </FormControl>

                <Chip
                    icon={<MdTranslate />}
                    label={language}
                    variant="outlined"
                    size="small"
                />

                <Tooltip title={recording ? "Stop Recording" : "Start Voice Input"}>
                    <Button
                        variant="contained"
                        onClick={recording ? stopRecording : startRecording}
                        sx={{
                            ml: "auto",
                            minWidth: "70px",
                            height: "70px",
                            borderRadius: "50%",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: recording ? "#f44336" : "#4caf50",
                            "&:hover": {
                                backgroundColor: recording ? "#d32f2f" : "#388e3c",
                                transform: "scale(1.05)",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
                            },
                            transition: "all 0.3s ease",
                            boxShadow: recording
                                ? "0 0 0 8px rgba(244, 67, 54, 0.3)"
                                : "0 0 0 8px rgba(76, 175, 80, 0.3)",
                            animation: recording ? "pulse 1.5s infinite" : "none"
                        }}
                    >
                        {recording ? (
                            <MdStop size={32} style={{ color: "white" }} />
                        ) : (
                            <MdMic size={32} style={{ color: "white" }} />
                        )}
                    </Button>
                </Tooltip>
            </Box>

            {/* Text Field */}
            <TextField
                multiline
                rows={8}
                fullWidth
                value={currentText}
                onChange={handleChange}
                label={isArabic ? "شكوى المريض" : "Patient Complaint"}
                placeholder={
                    isArabic
                        ? "اكتب شكوى المريض أو استخدم التسجيل الصوتي..."
                        : "Type patient complaint or use voice input..."
                }
                sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        direction: isArabic ? "rtl" : "ltr",
                        backgroundColor: isListening ? "#eef7ff" : "#fafafa"
                    },
                    "& textarea": {
                        textAlign: isArabic ? "right" : "left",
                        fontFamily: isArabic
                            ? "'Cairo', 'Segoe UI', Arial"
                            : "inherit",
                        lineHeight: 1.6
                    }
                }}
            />

            {/* Footer */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 1
                }}
            >
                <Typography variant="caption" color="text.secondary">
                    Characters: {currentText.length}
                </Typography>

                {recording && (
                    <Typography
                        variant="caption"
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            color: "error.main",
                            fontWeight: 600
                        }}
                    >
                        <MdFiberManualRecord size={10} />
                        Recording
                    </Typography>
                )}
            </Box>

            <style jsx="true">{`
                @keyframes pulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
                    }
                    70% {
                        box-shadow: 0 0 0 15px rgba(244, 67, 54, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
                    }
                }
            `}</style>
        </Box>
    );
};

export default PatientComplaint;
