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
} from "@mui/material";
import BugReportIcon from "@mui/icons-material/BugReport";
import HomeIcon from "@mui/icons-material/Home";
import ChatBot from "./components/ChatBot";
import ErrorLog from "./components/ErrorLog";
import "./App.css";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FF6B6B", // Anime-inspired pink-red
      light: "#FF8E8E",
      dark: "#FF4848",
    },
    secondary: {
      main: "#4A90E2", // Bright blue often used in anime
      light: "#6AA9E9",
      dark: "#2A77D9",
    },
    background: {
      default: "#1A1A2E", // Dark blue background
      paper: "#262640",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#B8B8B8",
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', sans-serif",
    h4: {
      fontWeight: 600,
      background: "linear-gradient(45deg, #FF6B6B 30%, #4A90E2 90%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          background: "linear-gradient(45deg, #FF6B6B 30%, #4A90E2 90%)",
          color: "white",
          "&:hover": {
            background: "linear-gradient(45deg, #FF4848 30%, #2A77D9 90%)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            color: "white",
            "& fieldset": {
              borderColor: "#4A90E2",
            },
            "&:hover fieldset": {
              borderColor: "#FF6B6B",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#FF6B6B",
            },
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static" sx={{ bgcolor: "#1A1A2E" }}>
            <Toolbar>
              <IconButton component={Link} to="/" sx={{ color: "#fff", mr: 2 }}>
                <HomeIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Anime Recommendation ChatBot
              </Typography>
              <IconButton
                component={Link}
                to="/error-log"
                sx={{ color: "#FF6B6B" }}
              >
                <BugReportIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

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
