"use client";

import { createTheme } from "@mui/material/styles";

// A modern, liquid glass aesthetic theme
const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#0ea5e9", // Electric cyan/blue
            light: "#38bdf8",
            dark: "#0284c7",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#8b5cf6", // Vibrant violet
            light: "#a78bfa",
            dark: "#7c3aed",
            contrastText: "#ffffff",
        },
        background: {
            default: "#f8fafc", // Very light icy blue tint
            paper: "rgba(255, 255, 255, 0.7)", // Translucent paper for glass effect
        },
        text: {
            primary: "#0f172a", // Slate 900
            secondary: "#64748b", // Slate 500
        },
        divider: "rgba(226, 232, 240, 0.5)", // Semi-transparent divider
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontFamily: '"Outfit", "Inter", sans-serif',
            fontWeight: 800,
            letterSpacing: "-0.02em",
        },
        h2: {
            fontFamily: '"Outfit", "Inter", sans-serif',
            fontWeight: 700,
            letterSpacing: "-0.01em",
        },
        h3: {
            fontFamily: '"Outfit", "Inter", sans-serif',
            fontWeight: 700,
            letterSpacing: "-0.01em",
        },
        h4: {
            fontFamily: '"Outfit", "Inter", sans-serif',
            fontWeight: 600,
        },
        h5: {
            fontFamily: '"Outfit", "Inter", sans-serif',
            fontWeight: 600,
        },
        h6: {
            fontFamily: '"Outfit", "Inter", sans-serif',
            fontWeight: 600,
        },
        button: {
            textTransform: "none",
            fontWeight: 600,
            letterSpacing: "0.01em",
        },
    },
    shape: {
        borderRadius: 20, // More pronounced rounded corners
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 30, // Pill-shaped buttons
                    padding: "10px 24px",
                    boxShadow: "0 4px 14px 0 rgba(14, 165, 233, 0.2)",
                    backdropFilter: "blur(4px)", // Slight blur on buttons if they ever become semi-transparent
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: "0 6px 20px rgba(14, 165, 233, 0.3)",
                    },
                },
                sizeLarge: {
                    padding: "14px 32px",
                    fontSize: "1.1rem",
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 24,
                    background: "rgba(255, 255, 255, 0.65)", // Frosted glass background
                    backdropFilter: "blur(16px)", // Aggressive blur
                    WebkitBackdropFilter: "blur(16px)", // Safari support
                    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.05)", // Soft, layered shadow
                    border: "1px solid rgba(255, 255, 255, 0.4)", // Frosted border
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 40px 0 rgba(31, 38, 135, 0.1)",
                        background: "rgba(255, 255, 255, 0.75)",
                        border: "1px solid rgba(255, 255, 255, 0.6)",
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    background: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                },
                rounded: {
                    borderRadius: 24,
                },
                elevation0: {
                    boxShadow: "none",
                },
                elevation1: {
                    boxShadow: "0 4px 20px 0 rgba(31, 38, 135, 0.05)",
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: "rgba(255, 255, 255, 0.6) !important", // Force translucent background
                    backdropFilter: "blur(20px) !important",
                    WebkitBackdropFilter: "blur(20px) !important",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.5) !important",
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.03) !important",
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 16,
                        background: "rgba(255, 255, 255, 0.5)",
                        backdropFilter: "blur(4px)",
                        transition: "all 0.2s",
                        "&:hover": {
                            background: "rgba(255, 255, 255, 0.8)",
                        },
                        "&.Mui-focused": {
                            background: "rgba(255, 255, 255, 0.9)",
                            boxShadow: "0 0 0 2px rgba(14, 165, 233, 0.2)",
                        },
                    },
                },
            },
        },
    },
});

export default theme;
