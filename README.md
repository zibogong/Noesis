# YouTube Podcast Transcript API

A FastAPI backend service that retrieves transcripts from YouTube podcast videos using the `youtube-transcript-api` library.

## Features

- 🎥 Fetch transcripts from YouTube videos by video ID or URL
- 🌍 Support for multiple languages
- 🔄 Translation support
- 📋 List available transcript languages for a video
- 🚀 Fast and efficient FastAPI implementation
- 📝 Automatic API documentation (Swagger UI)

## Installation

1. Clone or navigate to this directory:
```bash
cd podcast
```

2. Create a virtual environment (recommended):
   
   **Why use a virtual environment?**
   - Isolates project dependencies from your system Python
   - Prevents conflicts between different projects
   - Makes it easier to manage package versions
   - Keeps your system Python clean
   
   **Create and activate virtual environment:**
   
   On macOS/Linux:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
   
   On Windows:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
   
   You'll know it's activated when you see `(venv)` at the start of your terminal prompt.

3. Install dependencies:
```bash
pip install -r requirements.txt
```

**Note:** When you're done working, you can deactivate the virtual environment by running `deactivate`.

## Running the Service

### What is Uvicorn?

**Uvicorn** is an ASGI (Asynchronous Server Gateway Interface) web server that runs your FastAPI application. Think of it as the "engine" that:
- Listens for incoming HTTP requests
- Routes them to your FastAPI application
- Handles the async/await operations that FastAPI uses
- Serves your API on a specific host and port
- Provides auto-reload functionality during development (when using `--reload`)

**Why do we need it?**
- FastAPI is a framework, not a server
- Uvicorn is the production-ready server that actually runs your code
- It's optimized for async Python applications and provides excellent performance

### Development Mode

**Option 1: Using the main.py script**
```bash
python main.py
```

**Option 2: Using uvicorn directly (recommended for development)**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Command breakdown:**
- `main:app` - Points to the `app` object in `main.py`
- `--reload` - Automatically restarts the server when code changes (development only)
- `--host 0.0.0.0` - Makes the server accessible from any network interface
- `--port 8000` - Runs on port 8000

**Option 3: Production mode (no auto-reload)**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive API Docs (Swagger)**: http://localhost:8000/docs
- **Alternative API Docs (ReDoc)**: http://localhost:8000/redoc

## API Endpoints

### 1. Get Transcript

**GET** `/transcript/{video_id_or_url}`

Get the transcript for a YouTube video.

**Parameters:**
- `video_id_or_url` (path): YouTube video ID or full URL
- `languages` (query, optional): Comma-separated list of language codes (e.g., `en,es,fr`)
- `translate_to` (query, optional): Language code to translate the transcript to

**Example Requests:**

```bash
# Using video ID
curl http://localhost:8000/transcript/dQw4w9WgXcQ

# Using full URL
curl http://localhost:8000/transcript/https://www.youtube.com/watch?v=dQw4w9WgXcQ

# Specify language
curl http://localhost:8000/transcript/dQw4w9WgXcQ?languages=en

# Translate to English
curl http://localhost:8000/transcript/dQw4w9WgXcQ?translate_to=en
```

**Response:**
```json
{
  "video_id": "dQw4w9WgXcQ",
  "transcript": [
    {
      "text": "Never gonna give you up",
      "start": 0.0,
      "duration": 3.5
    },
    ...
  ],
  "success": true,
  "message": "Transcript retrieved successfully"
}
```

### 2. Get Available Languages

**GET** `/transcript/{video_id_or_url}/languages`

Get a list of available transcript languages for a video.

**Example Request:**
```bash
curl http://localhost:8000/transcript/dQw4w9WgXcQ/languages
```

**Response:**
```json
{
  "video_id": "dQw4w9WgXcQ",
  "available_languages": [
    {
      "language_code": "en",
      "language": "English",
      "is_generated": false,
      "is_translatable": true
    },
    ...
  ],
  "success": true
}
```

### 3. Health Check

**GET** `/health`

Check if the service is running.

**Example Request:**
```bash
curl http://localhost:8000/health
```

## Usage Examples

### Python Example

```python
import requests

# Get transcript
response = requests.get("http://localhost:8000/transcript/dQw4w9WgXcQ")
data = response.json()
print(data["transcript"])

# Get available languages
response = requests.get("http://localhost:8000/transcript/dQw4w9WgXcQ/languages")
languages = response.json()
print(languages["available_languages"])
```

### JavaScript/TypeScript Example

```javascript
// Get transcript
const response = await fetch('http://localhost:8000/transcript/dQw4w9WgXcQ');
const data = await response.json();
console.log(data.transcript);
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `404`: Video not found, transcripts disabled, or no transcript available
- `500`: Internal server error

Error responses include a descriptive message:

```json
{
  "detail": "No transcript found for video: dQw4w9WgXcQ. The video may not have transcripts available."
}
```

## Notes

- Not all YouTube videos have transcripts available
- Some videos may have transcripts disabled by the creator
- Generated transcripts (auto-captions) may be less accurate than manually created ones
- The service extracts video IDs from various YouTube URL formats automatically

## License

This project is open source and available for use.

