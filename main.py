from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
    VideoUnavailable
)
from typing import Optional, List, Dict, Any
import re

app = FastAPI(
    title="YouTube Transcript API",
    description="A simple FastAPI service to fetch transcripts from YouTube videos",
    version="1.0.0"
)


class TranscriptResponse(BaseModel):
    video_id: str
    transcript: List[Dict[str, Any]]
    success: bool
    message: Optional[str] = None


def extract_video_id(url_or_id: str) -> str:
    """Extract YouTube video ID from URL or return the ID if already provided."""
    # If it's already just an ID (11 characters)
    if re.match(r'^[a-zA-Z0-9_-]{11}$', url_or_id):
        return url_or_id

    # Extract from various YouTube URL formats
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})',
        r'youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})',
    ]

    for pattern in patterns:
        match = re.search(pattern, url_or_id)
        if match:
            return match.group(1)

    # If no pattern matches, assume it's an ID
    return url_or_id


def transcript_to_text(transcript_data: List[Dict[str, Any]], separator: str = " ") -> str:
    """
    Convert transcript data (list of dicts with text, start, duration) to plain text.

    :param transcript_data: List of transcript snippets with 'text' key
    :param separator: String to use between transcript snippets (default: space)
    :return: Plain text string of the transcript
    """
    return separator.join([snippet['text'] for snippet in transcript_data])


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "YouTube Transcript API",
        "version": "1.0.0",
        "endpoints": {
            "GET /transcript/{video_id_or_url}": "Get transcript for a YouTube video (JSON format)",
            "GET /transcript/{video_id_or_url}/text": "Get transcript as plain text",
            "GET /transcript/{video_id_or_url}/languages": "Get available languages for a video"
        }
    }


@app.get("/transcript/{video_id_or_url}", response_model=TranscriptResponse)
async def get_transcript(
    video_id_or_url: str,
    languages: Optional[str] = None
):
    """
    Get transcript for a YouTube video.
    
    - **video_id_or_url**: YouTube video ID or full URL
    - **languages**: Comma-separated list of language codes (e.g., 'en,es,fr'). 
                     If not provided, defaults to English.
    
    Returns the transcript with timestamps and text.
    """
    try:
        video_id = extract_video_id(video_id_or_url)

        # Parse languages if provided
        lang_list = None
        if languages:
            lang_list = [lang.strip() for lang in languages.split(',')]
        else:
            # Default to English if no language specified
            lang_list = ['en']

        # Create API instance and fetch transcript
        api = YouTubeTranscriptApi()
        fetched_transcript = api.fetch(video_id, languages=tuple(lang_list))

        return TranscriptResponse(
            video_id=video_id,
            transcript=fetched_transcript.to_raw_data(),
            success=True,
            message="Transcript retrieved successfully"
        )
    
    except TranscriptsDisabled:
        raise HTTPException(
            status_code=404,
            detail=f"Transcripts are disabled for video: {video_id}"
        )
    except NoTranscriptFound:
        raise HTTPException(
            status_code=404,
            detail=f"No transcript found for video: {video_id}. The video may not have transcripts available."
        )
    except VideoUnavailable:
        raise HTTPException(
            status_code=404,
            detail=f"Video is unavailable: {video_id}. The video may be private, deleted, or not exist."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching transcript: {str(e)}"
        )


@app.get("/transcript/{video_id_or_url}/text")
async def get_transcript_text(
    video_id_or_url: str,
    languages: Optional[str] = None,
    separator: Optional[str] = " "
):
    """
    Get transcript for a YouTube video as plain text.

    - **video_id_or_url**: YouTube video ID or full URL
    - **languages**: Comma-separated list of language codes (e.g., 'en,es,fr').
                     If not provided, defaults to English.
    - **separator**: String to use between transcript snippets (default: space).
                     Use newline separator with '\\n' for line-by-line format.

    Returns the transcript as plain text string.
    """
    try:
        video_id = extract_video_id(video_id_or_url)

        # Parse languages if provided
        lang_list = None
        if languages:
            lang_list = [lang.strip() for lang in languages.split(',')]
        else:
            # Default to English if no language specified
            lang_list = ['en']

        # Create API instance and fetch transcript
        api = YouTubeTranscriptApi()
        fetched_transcript = api.fetch(video_id, languages=tuple(lang_list))

        # Convert to plain text
        transcript_data = fetched_transcript.to_raw_data()
        plain_text = transcript_to_text(transcript_data, separator=separator)

        return {
            "video_id": video_id,
            "text": plain_text,
            "success": True,
            "message": "Transcript retrieved successfully"
        }

    except TranscriptsDisabled:
        raise HTTPException(
            status_code=404,
            detail=f"Transcripts are disabled for video: {video_id}"
        )
    except NoTranscriptFound:
        raise HTTPException(
            status_code=404,
            detail=f"No transcript found for video: {video_id}. The video may not have transcripts available."
        )
    except VideoUnavailable:
        raise HTTPException(
            status_code=404,
            detail=f"Video is unavailable: {video_id}. The video may be private, deleted, or not exist."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching transcript: {str(e)}"
        )


@app.get("/transcript/{video_id_or_url}/languages")
async def get_available_languages(video_id_or_url: str):
    """
    Get available transcript languages for a YouTube video.
    
    - **video_id_or_url**: YouTube video ID or full URL
    
    Returns a list of available language codes and their names.
    """
    try:
        video_id = extract_video_id(video_id_or_url)

        # Create API instance and list transcripts
        api = YouTubeTranscriptApi()
        transcript_list = api.list(video_id)

        available_languages = []
        for transcript in transcript_list:
            available_languages.append({
                "language_code": transcript.language_code,
                "language": transcript.language,
                "is_generated": transcript.is_generated,
                "is_translatable": bool(transcript.translation_languages)
            })

        return {
            "video_id": video_id,
            "available_languages": available_languages,
            "success": True
        }
    
    except VideoUnavailable:
        raise HTTPException(
            status_code=404,
            detail=f"Video is unavailable: {video_id}. The video may be private, deleted, or not exist."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching available languages: {str(e)}"
        )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
