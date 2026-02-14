# YouTube Podcast Transcript API

A Next.js app that retrieves transcripts from YouTube podcast videos, with a simple UI and Google OAuth login. Deployed on Vercel.

## Features

- Fetch transcripts from YouTube videos by video ID or URL
- AI-powered transcript summarization using OpenAI GPT models
- Plain text transcript export
- Support for multiple languages
- List available transcript languages for a video
- Web UI with transcript viewer
- Google OAuth authentication

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` with the following variables:
```
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_random_secret
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret into your `.env`

Generate `NEXTAUTH_SECRET` with:
```bash
openssl rand -base64 32
```

3. Run the dev server:
```bash
npm run dev
```

Visit http://localhost:3000 — you'll be redirected to Google sign-in.

## API Endpoints

### GET /api
API info and available endpoints.

### GET /api/health
Health check endpoint (no auth required).

### GET /api/transcript/{video_id_or_url}
Get the transcript for a YouTube video with timestamps.

**Query params:**
- `languages` — comma-separated language codes (default: `en`)

**Response:**
```json
{
  "video_id": "dQw4w9WgXcQ",
  "transcript": [{ "text": "...", "start": 0.0, "duration": 3.5 }],
  "success": true,
  "message": "Transcript retrieved successfully"
}
```

### GET /api/transcript/{video_id_or_url}/text
Get the transcript as plain text.

**Query params:**
- `languages` — comma-separated language codes (default: `en`)
- `separator` — string between snippets (default: space)

### GET /api/transcript/{video_id_or_url}/languages
Get available transcript languages for a video.

**Response:**
```json
{
  "video_id": "dQw4w9WgXcQ",
  "available_languages": [
    { "language_code": "en", "language": "English", "is_generated": false, "is_translatable": true }
  ],
  "success": true
}
```

### GET /api/transcript/{video_id_or_url}/summary
Get an AI-generated summary of a YouTube video transcript.

**Query params:**
- `languages` — comma-separated language codes (default: `en`)
- `length` — desired summary length in words, 50-1000 (default: `300`)

**Response:**
```json
{
  "video_id": "dQw4w9WgXcQ",
  "summary": "...",
  "word_count": 287,
  "requested_length": 300,
  "success": true,
  "message": "Summary generated successfully"
}
```

**Note:** Requires a valid `OPENAI_API_KEY` in `.env`.

## Authentication

The app uses Google OAuth via NextAuth v5. The UI (`/`) and transcript API (`/api/transcript/*`) require authentication. The health check (`/api/health`) and API info (`/api`) are public.

## Deployment

Deploy to Vercel:
```bash
npx vercel
```

Set the environment variables (`OPENAI_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`) in the Vercel dashboard. Update the Google OAuth redirect URI to your production URL.

**Note:** The `/api/transcript/.../summary` endpoint may exceed Vercel's free tier 10s function timeout. Vercel Pro allows 60s.
