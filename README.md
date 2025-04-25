# Anime Recommendation Chatbot

An interactive chatbot that provides personalized anime recommendations based on user preferences.

## Features

- 🎭 Genre-based recommendations
- 📺 Type filtering (TV, Movie, OVA)
- ⭐ Rating-based sorting
- 👥 Popularity metrics
- 💬 Natural language interaction
- 🖼️ Anime GIF previews

## Prerequisites

- Node.js >= 14.0.0
- npm or yarn

## Environment Variables

Create a `.env` file in the root directory with:

```env
VITE_HUGGING_FACE_API_KEY=your_huggingface_api_key
VITE_TENOR_API_KEY=your_tenor_api_key
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/anime-chatbot.git
cd anime-chatbot
```

2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Project Structure

```
anime-chatbot/
├── public/
│   └── data/
│       ├── anime.csv
│       └── anime_data.txt
├── src/
│   ├── components/
│   │   ├── ChatBot.jsx
│   │   └── ChatBot.css
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

## Deployment

This project is configured for deployment on Vercel. The `vercel.json` file includes all necessary settings for proper routing and static file serving.

### Vercel Setup

1. Import your repository to Vercel
2. Set the following in your Vercel project settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add your environment variables in the Vercel project settings

## License

MIT
