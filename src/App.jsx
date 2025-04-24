import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import BugReportIcon from "@mui/icons-material/BugReport";
import HomeIcon from "@mui/icons-material/Home";
import ChatBot from "./components/ChatBot";
import ErrorLog from "./components/ErrorLog";
import VideoBackground from "./components/VideoBackground";
import "./App.css";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4A90E2",
    },
    secondary: {
      main: "#FF6B6B",
    },
    background: {
      default: "transparent",
      paper: "rgba(38, 38, 64, 0.9)",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(26, 26, 46, 0.8)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(10px)",
          "&.MuiAppBar-root": {
            backdropFilter: "blur(10px)",
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <VideoBackground />
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<ChatBot />} />
            <Route path="/error-log" element={<ErrorLog />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
