import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  IconButton,
  Collapse,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DeleteIcon from "@mui/icons-material/Delete";

const ErrorLog = () => {
  const [logs, setLogs] = useState([]);
  const [expandedLogs, setExpandedLogs] = useState({});

  useEffect(() => {
    const storedLogs = JSON.parse(
      localStorage.getItem("chatbotErrorLogs") || "[]"
    );
    setLogs(storedLogs);
  }, []);

  const handleToggleExpand = (index) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleClearLogs = () => {
    localStorage.setItem("chatbotErrorLogs", "[]");
    setLogs([]);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", mt: 4, p: 2 }}>
      <Paper elevation={3} sx={{ p: 3, bgcolor: "#1A1A2E" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" sx={{ color: "#FF6B6B" }}>
            Error Logs
          </Typography>
          <IconButton onClick={handleClearLogs} sx={{ color: "#FF6B6B" }}>
            <DeleteIcon />
          </IconButton>
        </Box>

        {logs.length === 0 ? (
          <Typography sx={{ color: "#4A90E2", textAlign: "center" }}>
            No errors logged yet! 🎉
          </Typography>
        ) : (
          <List>
            {logs.map((log, index) => (
              <React.Fragment key={index}>
                <ListItem
                  sx={{
                    flexDirection: "column",
                    alignItems: "stretch",
                    bgcolor: "#262640",
                    borderRadius: 2,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ color: "#FF6B6B" }}>
                      {formatDate(log.timestamp)}
                    </Typography>
                    <IconButton
                      onClick={() => handleToggleExpand(index)}
                      sx={{ color: "#4A90E2" }}
                    >
                      {expandedLogs[index] ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </IconButton>
                  </Box>

                  <Typography sx={{ color: "#fff", mt: 1 }}>
                    Error: {log.error}
                  </Typography>

                  <Collapse in={expandedLogs[index]}>
                    <Box
                      sx={{ mt: 2, p: 2, bgcolor: "#1A1A2E", borderRadius: 1 }}
                    >
                      <Typography
                        sx={{
                          color: "#4A90E2",
                          fontFamily: "monospace",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        Context: {JSON.stringify(log.context, null, 2)}
                      </Typography>
                      {log.stack && (
                        <Typography
                          sx={{
                            color: "#FF6B6B",
                            fontFamily: "monospace",
                            whiteSpace: "pre-wrap",
                            mt: 2,
                          }}
                        >
                          Stack Trace:
                          {log.stack}
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </ListItem>
                {index < logs.length - 1 && (
                  <Divider sx={{ bgcolor: "#4A90E2" }} />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default ErrorLog;
