import React from "react";
import { Box } from "@mui/material";

const VideoBackground = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        overflow: "hidden",
        pointerEvents: "none", // This prevents the video from being interactive
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(26, 26, 46, 0.85)", // Dark overlay to maintain readability
          zIndex: 1,
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "100vw",
          height: "100vh",
          transform: "translate(-50%, -50%) scale(1.5)", // Scale up to cover the screen
          pointerEvents: "none",
        }}
      >
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/xgY5_f6x9MQ?autoplay=1&mute=1&controls=0&loop=1&playlist=xgY5_f6x9MQ&showinfo=0&rel=0&enablejsapi=1&version=3&playerapiid=ytplayer"
          title="Anime Background"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
          }}
        />
      </Box>
    </Box>
  );
};

export default VideoBackground;
