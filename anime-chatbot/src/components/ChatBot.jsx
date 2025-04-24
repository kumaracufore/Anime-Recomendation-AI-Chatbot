import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  List,
  ListItem,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Fade,
  Stack,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { HfInference } from "@huggingface/inference";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./ChatBot.css";

const QUICK_SUGGESTIONS = [
  { text: "Popular action anime", icon: "🎬" },
  { text: "Best romance movies", icon: "💕" },
  { text: "Highly rated series", icon: "⭐" },
  { text: "Comedy shows", icon: "😄" },
];

const REACTIONS = [
  { icon: <ThumbUpIcon />, tooltip: "Great suggestion!" },
  { icon: <FavoriteIcon />, tooltip: "Love it!" },
  { icon: <BookmarkIcon />, tooltip: "Save for later" },
  { icon: <EmojiEmotionsIcon />, tooltip: "Interesting!" },
];

const GENRE_KEYWORDS = {
  action: ["action", "fighting", "battle", "combat", "martial arts"],
  adventure: ["adventure", "journey", "quest", "exploration"],
  comedy: ["comedy", "funny", "humor", "hilarious", "comedic"],
  drama: ["drama", "emotional", "serious", "dramatic"],
  fantasy: ["fantasy", "magic", "magical", "supernatural"],
  romance: ["romance", "romantic", "love", "relationship"],
  scifi: ["sci-fi", "science fiction", "future", "space", "technology"],
  slice_of_life: ["slice of life", "daily life", "realistic", "everyday"],
  sports: ["sports", "athletic", "competition", "game"],
  thriller: ["thriller", "suspense", "mystery", "psychological"],
};

const TYPE_KEYWORDS = {
  movie: ["movie", "film", "theatrical"],
  tv: ["tv", "series", "show", "episode", "episodes"],
  ova: ["ova", "special", "oav"],
};

const RATING_KEYWORDS = [
  "best",
  "top",
  "highest rated",
  "highly rated",
  "good",
  "great",
  "amazing",
];

const POPULARITY_KEYWORDS = [
  "popular",
  "trending",
  "famous",
  "well known",
  "most watched",
];

const HUGGING_FACE_MODEL = "microsoft/bitnet-b1.58-2B-4T";
const API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY;
const TENOR_API_KEY = import.meta.env.VITE_TENOR_API_KEY;

// Add error handling for missing API keys
if (!API_KEY) {
  console.error(
    "Missing Hugging Face API key. Please set VITE_HUGGING_FACE_API_KEY in your environment variables."
  );
}

if (!TENOR_API_KEY) {
  console.warn("Missing Tenor API key. GIF functionality will be limited.");
}

const SYSTEM_PROMPT = `You are an anime recommendation chatbot. Your task is to provide friendly, engaging responses about anime recommendations. Keep responses concise and natural. Include a brief explanation of why each anime might appeal to the user based on their query.`;

// Add error logging utility
const logError = (error, context) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack,
    context,
  };
  console.error("Error Log:", errorLog);
  // Store in localStorage for the error log page
  const existingLogs = JSON.parse(
    localStorage.getItem("chatbotErrorLogs") || "[]"
  );
  existingLogs.push(errorLog);
  localStorage.setItem("chatbotErrorLogs", JSON.stringify(existingLogs));
};

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [animeData, setAnimeData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [reactions, setReactions] = useState({});
  const chatEndRef = useRef(null);
  const [savedAnime, setSavedAnime] = useState([]);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [hf] = useState(() => new HfInference(API_KEY));
  const [animeGifs, setAnimeGifs] = useState({});

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load both data sources
    Promise.all([
      fetch("/src/data/anime.csv").then((response) => response.text()),
      fetch("/src/data/anime_data.txt").then((response) => response.text()),
    ])
      .then(([csvData, txtData]) => {
        // Parse CSV data with error handling
        const csvLines = csvData.split("\n").slice(1);
        const csvAnimes = csvLines
          .filter((line) => line.trim())
          .map((line) => {
            try {
              const [anime_id, name, genre, type, episodes, rating, members] =
                line.split(",").map((item) => item.trim());

              // Handle genre parsing safely
              const genres = genre
                ? genre
                    .replace(/^"|"$/g, "")
                    .split(",")
                    .map((g) => g.trim())
                : [];

              return {
                id: anime_id || "",
                title: name || "Unknown Title",
                genres: genres.length > 0 ? genres : ["Unspecified"],
                type: type || "Unknown",
                episodes: episodes === "Unknown" ? "Ongoing" : episodes,
                rating: parseFloat(rating) || 0,
                members: parseInt(members) || 0,
                source: "csv",
              };
            } catch (error) {
              console.error("Error parsing CSV line:", error);
              return null;
            }
          })
          .filter(Boolean);

        // Parse TXT data with error handling
        const txtAnimes = txtData
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => {
            try {
              const [title, genres, description] = line
                .split("|")
                .map((item) => item.trim());
              return {
                title: title || "Unknown Title",
                genres: genres
                  ? genres.split(",").map((g) => g.trim())
                  : ["Unspecified"],
                description: description || "",
                source: "txt",
              };
            } catch (error) {
              console.error("Error parsing TXT line:", error);
              return null;
            }
          })
          .filter(Boolean);

        setAnimeData([...csvAnimes, ...txtAnimes]);

        // Add welcome message with typing effect
        setIsTyping(true);
        setTimeout(() => {
          setMessages([
            {
              text:
                "Konnichiwa! 👋 I'm your anime recommendation assistant. I can help you find anime based on:\n\n" +
                "🎭 Genres (e.g., 'action', 'romance')\n" +
                "📺 Type (e.g., 'TV series', 'movie')\n" +
                "⭐ Rating (e.g., 'highly rated')\n" +
                "👥 Popularity (e.g., 'popular')\n\n" +
                "What kind of anime are you looking for?",
              sender: "bot",
            },
          ]);
          setIsTyping(false);
        }, 1000);
      })
      .catch((error) => {
        console.error("Error loading anime data:", error);
        setMessages([
          {
            text: "Gomen nasai! 😔 There was an error loading the anime database. Please try refreshing the page.",
            sender: "bot",
          },
        ]);
      });
  }, []);

  const calculateRelevanceScore = (
    anime,
    searchTerms,
    searchType = "normal"
  ) => {
    let score = 0;
    const terms = searchTerms.toLowerCase().split(" ");

    // Helper function to check if any term matches any keyword
    const matchesKeywords = (keywords) =>
      terms.some((term) =>
        keywords.some(
          (keyword) =>
            keyword.toLowerCase().includes(term) ||
            term.includes(keyword.toLowerCase())
        )
      );

    // Helper function to check if anime matches a genre
    const matchesGenre = (genre) =>
      anime.genres.some(
        (g) =>
          g.toLowerCase().includes(genre.toLowerCase()) ||
          GENRE_KEYWORDS[genre]?.some((k) =>
            g.toLowerCase().includes(k.toLowerCase())
          )
      );

    // Check for genre matches
    Object.keys(GENRE_KEYWORDS).forEach((genre) => {
      if (matchesGenre(genre)) {
        score += 3;
      }
    });

    // Check for specific genre mentions in search terms
    terms.forEach((term) => {
      Object.entries(GENRE_KEYWORDS).forEach(([genre, keywords]) => {
        if (keywords.some((k) => k.toLowerCase().includes(term))) {
          if (matchesGenre(genre)) {
            score += 2;
          }
        }
      });
    });

    // Type matching
    Object.entries(TYPE_KEYWORDS).forEach(([type, keywords]) => {
      if (
        matchesKeywords(keywords) &&
        anime.type &&
        anime.type.toLowerCase().includes(type.toLowerCase())
      ) {
        score += 2;
      }
    });

    // Rating relevance
    const hasRatingKeyword = matchesKeywords(RATING_KEYWORDS);
    if (hasRatingKeyword && anime.rating) {
      if (anime.rating >= 8.5) score += 4;
      else if (anime.rating >= 8.0) score += 3;
      else if (anime.rating >= 7.5) score += 2;
    }

    // Popularity relevance
    const hasPopularityKeyword = matchesKeywords(POPULARITY_KEYWORDS);
    if (hasPopularityKeyword && anime.members) {
      const popularityScore = Math.log10(anime.members) / 2;
      score += popularityScore;
    }

    // If this is a quick action search, boost scores for exact matches
    if (searchType === "quick") {
      if (hasRatingKeyword && anime.rating >= 8.0) score *= 1.5;
      if (hasPopularityKeyword && anime.members >= 100000) score *= 1.5;
    }

    return score;
  };

  const generateModelResponse = async (recommendations, userQuery) => {
    try {
      setIsModelLoading(true);

      // Create a context for the model
      const context = `${SYSTEM_PROMPT}\n\nUser Query: "${userQuery}"\n\nAvailable Recommendations:\n${recommendations
        .map(
          (anime) =>
            `- ${anime.title} (${
              anime.type || "Unknown Type"
            })\n  Genres: ${anime.genres.join(", ")}\n  ${
              anime.rating ? `Rating: ${anime.rating}/10` : ""
            }`
        )
        .join("\n")}`;

      // Generate response using the model
      const response = await hf.textGeneration({
        model: HUGGING_FACE_MODEL,
        inputs:
          context +
          "\n\nProvide a friendly response explaining these recommendations:",
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          top_p: 0.95,
          repetition_penalty: 1.15,
          do_sample: true,
        },
      });

      return response.generated_text.trim();
    } catch (error) {
      console.error("Error generating model response:", error);
      return null;
    } finally {
      setIsModelLoading(false);
    }
  };

  const findAnimeRecommendations = async (userInput) => {
    const searchTerms = userInput.toLowerCase();
    const isQuickSearch = QUICK_SUGGESTIONS.some(
      (suggestion) => suggestion.text.toLowerCase() === searchTerms
    );

    // Score all anime
    const scoredAnime = animeData
      .map((anime) => ({
        ...anime,
        relevanceScore: calculateRelevanceScore(
          anime,
          searchTerms,
          isQuickSearch ? "quick" : "normal"
        ),
      }))
      .filter((anime) => anime.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Get top results
    let recommendations = scoredAnime.slice(0, 5);

    // If no results found, try a more lenient search
    if (recommendations.length === 0) {
      const genreMatches = animeData
        .map((anime) => ({
          ...anime,
          relevanceScore: anime.genres.reduce((score, genre) => {
            const matchesAnyKeyword = terms.some((term) =>
              genre.toLowerCase().includes(term.toLowerCase())
            );
            return score + (matchesAnyKeyword ? 2 : 0);
          }, 0),
        }))
        .filter((anime) => anime.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5);

      if (genreMatches.length > 0) {
        recommendations = genreMatches;
      }
    }

    // For quick suggestions, ensure we have results
    if (isQuickSearch && recommendations.length === 0) {
      const terms = searchTerms.split(" ");
      const fallbackResults = animeData
        .filter((anime) => {
          if (terms.includes("popular")) return anime.members >= 100000;
          if (terms.includes("best") || terms.includes("highly"))
            return anime.rating >= 8.0;
          return true;
        })
        .sort((a, b) => {
          if (terms.includes("popular")) return b.members - a.members;
          if (terms.includes("best") || terms.includes("highly"))
            return b.rating - a.rating;
          return 0;
        })
        .slice(0, 5);

      if (fallbackResults.length > 0) {
        recommendations = fallbackResults;
      }
    }

    // Generate a natural language response using the model
    const modelResponse = await generateModelResponse(
      recommendations,
      userInput
    );

    // Format the recommendations with the model's response
    return {
      recommendations,
      modelResponse,
    };
  };

  const fetchAnimeGif = async (animeTitle) => {
    try {
      const response = await fetch(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(
          animeTitle + " anime"
        )}&key=${TENOR_API_KEY}&limit=1&media_filter=minimal`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].media_formats.gif.url;
      }
      return null;
    } catch (error) {
      console.error("Error fetching GIF:", error);
      return null;
    }
  };

  const formatAnimeRecommendation = async (anime) => {
    // Fetch GIF if we haven't already
    if (!animeGifs[anime.title]) {
      const gifUrl = await fetchAnimeGif(anime.title);
      if (gifUrl) {
        setAnimeGifs((prev) => ({ ...prev, [anime.title]: gifUrl }));
      }
    }

    let result = `### ${anime.title}\n`;

    if (animeGifs[anime.title]) {
      result += `![${anime.title}](${animeGifs[anime.title]})\n\n`;
    }

    if (anime.source === "csv") {
      result += `📺 **Type:** ${anime.type}\n`;
      result += `🎬 **Episodes:** ${anime.episodes}\n`;
      result += `⭐ **Rating:** ${anime.rating.toFixed(2)}/10\n`;
      result += `👥 **Members:** ${anime.members.toLocaleString()}\n`;
    } else {
      result += `📝 ${anime.description}\n`;
    }

    result += `🎭 **Genres:** ${anime.genres.join(", ")}\n`;

    if (anime.relevanceScore) {
      const relevanceEmoji = anime.relevanceScore > 5 ? "🎯" : "📍";
      result += `${relevanceEmoji} **Relevance:** ${anime.relevanceScore.toFixed(
        1
      )}\n`;
    }

    return result;
  };

  const handleReaction = (messageIndex, reactionType) => {
    setReactions((prev) => ({
      ...prev,
      [messageIndex]: reactionType,
    }));

    // If it's a bookmark reaction, save the anime
    if (
      reactionType === "bookmark" &&
      messages[messageIndex].isRecommendation
    ) {
      const button = document.querySelector(
        `[data-reaction="${messageIndex}-bookmark"]`
      );
      if (button) {
        button.classList.add("save-animation");
        setTimeout(() => button.classList.remove("save-animation"), 500);
      }
      setSavedAnime((prev) => [...prev, messages[messageIndex].text]);
    }
  };

  const handleQuickSuggestion = (suggestion) => {
    setInput(suggestion);
    handleSend(suggestion);
  };

  const handleSend = async (overrideInput) => {
    const messageText = overrideInput || input;
    if (!messageText.trim()) return;

    const userMessage = { text: messageText, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const result = await findAnimeRecommendations(messageText);

      setTimeout(async () => {
        if (result.recommendations.length > 0) {
          // Add model's response first
          if (result.modelResponse) {
            setMessages((prev) => [
              ...prev,
              {
                text: result.modelResponse,
                sender: "bot",
              },
            ]);
          }

          // Format all recommendations and wait for them to complete
          const formattedRecommendations = await Promise.all(
            result.recommendations.map(formatAnimeRecommendation)
          );

          // Add formatted recommendations
          setMessages((prev) => [
            ...prev,
            {
              text: formattedRecommendations.join("\n"),
              sender: "bot",
              isRecommendation: true,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              text:
                `Gomen ne~ 😅 I couldn't find any anime matching "${messageText}". Try:\n` +
                "• Using different keywords or genres\n" +
                "• Specifying if you want a TV series or movie\n" +
                "• Describing the type of story you're interested in",
              sender: "bot",
            },
          ]);
        }
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      logError(error, { messageText, action: "handleSend" });
      setMessages((prev) => [
        ...prev,
        {
          text: "Sumimasen! 😓 Something went wrong. Please try again!",
          sender: "bot",
        },
      ]);
      setIsTyping(false);
    }

    setIsLoading(false);
  };

  const renderMessage = (message) => {
    if (message.sender === "bot") {
      return (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({ node, ...props }) => (
              <Box
                component="img"
                sx={{
                  maxWidth: "200px",
                  borderRadius: "10px",
                  margin: "8px 0",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                }}
                {...props}
              />
            ),
            h3: ({ node, ...props }) => (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  background: "linear-gradient(45deg, #FF6B6B, #4A90E2)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  display: "inline-block",
                }}
                {...props}
              />
            ),
          }}
        >
          {message.text}
        </ReactMarkdown>
      );
    }
    return (
      <Typography sx={{ whiteSpace: "pre-wrap" }}>{message.text}</Typography>
    );
  };

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
      <Paper
        elevation={5}
        sx={{
          borderRadius: "20px",
          overflow: "hidden",
          background: "linear-gradient(145deg, #262640 0%, #1A1A2E 100%)",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            p: 2,
            textAlign: "center",
            fontWeight: "bold",
            position: "relative",
          }}
        >
          Anime Recommendation ChatBot
          <Box
            component="span"
            sx={{
              position: "absolute",
              right: "20px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            🎭
          </Box>
        </Typography>

        <Paper
          className="chat-container"
          elevation={0}
          sx={{
            height: 500,
            overflow: "auto",
            p: 2,
            mb: 2,
            backgroundColor: "transparent",
            backgroundImage:
              "linear-gradient(rgba(26, 26, 46, 0.9), rgba(26, 26, 46, 0.9))",
          }}
        >
          <List>
            {messages.map((message, index) => (
              <ListItem
                key={index}
                className="message-appear"
                sx={{
                  justifyContent:
                    message.sender === "user" ? "flex-end" : "flex-start",
                  mb: 1,
                  flexDirection: "column",
                  alignItems:
                    message.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection:
                      message.sender === "user" ? "row-reverse" : "row",
                  }}
                >
                  {message.sender === "bot" && (
                    <Avatar
                      sx={{
                        mr: 1,
                        background:
                          "linear-gradient(45deg, #FF6B6B 30%, #4A90E2 90%)",
                      }}
                    >
                      🤖
                    </Avatar>
                  )}
                  <Paper
                    className="message-hover"
                    sx={{
                      p: 2,
                      maxWidth: message.isRecommendation ? "90%" : "70%",
                      backgroundColor:
                        message.sender === "user" ? "#4A90E2" : "#262640",
                      color: "#fff",
                      borderRadius:
                        message.sender === "user"
                          ? "20px 20px 5px 20px"
                          : "20px 20px 20px 5px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {renderMessage(message)}
                  </Paper>
                  {message.sender === "user" && (
                    <Avatar
                      sx={{
                        ml: 1,
                        background:
                          "linear-gradient(45deg, #4A90E2 30%, #FF6B6B 90%)",
                      }}
                    >
                      👤
                    </Avatar>
                  )}
                </Box>
                {message.sender === "bot" && message.isRecommendation && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      mt: 1,
                      ml: 7,
                    }}
                  >
                    {REACTIONS.map((reaction, i) => (
                      <Tooltip key={i} title={reaction.tooltip}>
                        <IconButton
                          className="reaction-button"
                          size="small"
                          onClick={() =>
                            handleReaction(
                              index,
                              reaction.tooltip.toLowerCase()
                            )
                          }
                          sx={{
                            color:
                              reactions[index] ===
                              reaction.tooltip.toLowerCase()
                                ? "#FF6B6B"
                                : "#fff",
                            opacity:
                              reactions[index] ===
                              reaction.tooltip.toLowerCase()
                                ? 1
                                : 0.7,
                            "&:hover": {
                              color: "#FF6B6B",
                            },
                          }}
                        >
                          {reaction.icon}
                        </IconButton>
                      </Tooltip>
                    ))}
                  </Box>
                )}
              </ListItem>
            ))}
            {isTyping && (
              <ListItem>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: "#262640",
                    borderRadius: "20px 20px 20px 5px",
                  }}
                >
                  <Typography sx={{ color: "#fff" }}>
                    <span className="typing-indicator">typing</span>
                  </Typography>
                </Paper>
              </ListItem>
            )}
            <div ref={chatEndRef} />
          </List>
        </Paper>

        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              mb: 2,
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {QUICK_SUGGESTIONS.map((suggestion, index) => (
              <Chip
                className="suggestion-chip"
                key={index}
                label={suggestion.text}
                icon={
                  <Typography sx={{ fontSize: "1.2rem", mr: 1 }}>
                    {suggestion.icon}
                  </Typography>
                }
                onClick={() => handleQuickSuggestion(suggestion.text)}
                sx={{
                  backgroundColor: "#4A90E2",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#2A77D9",
                  },
                }}
              />
            ))}
          </Stack>

          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Try: 'Show me popular action movies' or 'highly rated romance anime'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "15px",
                },
              }}
            />
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={() => handleSend()}
              disabled={isLoading}
              sx={{
                borderRadius: "15px",
                minWidth: "120px",
              }}
            >
              Send
            </Button>
          </Box>
        </Box>

        {/* Add loading indicator */}
        {isModelLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress size={24} sx={{ color: "#4A90E2" }} />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ChatBot;
