import React from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

const ErrorLog = () => {
  const errorLogs = JSON.parse(
    localStorage.getItem("chatbotErrorLogs") || "[]"
  );

  return (
    <Box
      className="content-container"
      sx={{
        maxWidth: "810px",
        margin: "auto",
        mt: 4,
        p: 2,
        width: "100%",
      }}
    >
      <Paper elevation={5} sx={{ p: 3, borderRadius: "20px" }}>
        <Typography variant="h4" gutterBottom sx={{ color: "#FF6B6B" }}>
          Error Log
        </Typography>
        <List>
          {errorLogs.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No errors logged"
                secondary="The chatbot is running smoothly!"
              />
            </ListItem>
          ) : (
            errorLogs.map((log, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={`Error at ${new Date(
                      log.timestamp
                    ).toLocaleString()}`}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {log.error}
                        </Typography>
                        {log.context && (
                          <Typography
                            component="p"
                            variant="body2"
                            color="text.secondary"
                          >
                            Context: {JSON.stringify(log.context)}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < errorLogs.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default ErrorLog;
