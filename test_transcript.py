#!/usr/bin/env python3
"""
Test script to fetch YouTube transcript directly using youtube-transcript-api
"""

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled, 
    NoTranscriptFound, 
    VideoUnavailable
)
from xml.etree.ElementTree import ParseError as XMLParseError
import traceback

# Test with a video that definitely has transcripts
video_id = "9EqrUK7ghho"  # Rick Astley - Never Gonna Give You Up (has transcripts)
# video_id = "fzdvutKN7so"  # This one has empty transcript data

print(f"Testing transcript fetch for video: {video_id}")
print("=" * 60)

# Method 1: List available transcripts first
print("\n1. Checking available transcripts...")
try:
    transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
    
    print("Available transcripts:")
    for transcript in transcript_list:
        print(f"  - {transcript.language_code} ({transcript.language}) - "
              f"Generated: {transcript.is_generated}, "
              f"Translatable: {transcript.is_translatable}")
    
    # Try to get English transcript
    print("\n2. Attempting to fetch English transcript...")
    try:
        transcript = transcript_list.find_transcript(['en'])
        print(f"   Found English transcript: {type(transcript)}")
        
        print("\n3. Fetching transcript data...")
        try:
            transcript_data = transcript.fetch()
            print(f"   Success! Got {len(transcript_data)} transcript entries")
            print(f"   First few entries:")
            for i, entry in enumerate(transcript_data[:3]):
                print(f"     {i+1}. {entry}")
            if len(transcript_data) > 3:
                print(f"     ... and {len(transcript_data) - 3} more entries")
        except XMLParseError as parse_err:
            print(f"   ERROR: XMLParseError during fetch: {str(parse_err)}")
            print(f"   This means the transcript exists but the data is empty/corrupted")
            traceback.print_exc()
        except Exception as fetch_err:
            print(f"   ERROR during fetch: {type(fetch_err).__name__}: {str(fetch_err)}")
            traceback.print_exc()
            
    except (NoTranscriptFound, TranscriptsDisabled) as e:
        print(f"   English transcript not available: {type(e).__name__}: {str(e)}")
        
        # Try any available transcript
        print("\n4. Trying to get any available transcript...")
        try:
            transcript = transcript_list.find_transcript([])
            print(f"   Found transcript: {transcript.language_code} ({transcript.language})")
            transcript_data = transcript.fetch()
            print(f"   Success! Got {len(transcript_data)} transcript entries")
        except Exception as any_err:
            print(f"   ERROR: {type(any_err).__name__}: {str(any_err)}")
            traceback.print_exc()
            
except VideoUnavailable:
    print(f"ERROR: Video is unavailable (private, deleted, or doesn't exist)")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {str(e)}")
    traceback.print_exc()

# Method 2: Direct get_transcript call
print("\n" + "=" * 60)
print("5. Trying direct get_transcript() call...")
try:
    transcript_data = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
    print(f"   Success! Got {len(transcript_data)} transcript entries")
    print(f"   First few entries:")
    for i, entry in enumerate(transcript_data[:3]):
        print(f"     {i+1}. {entry}")
except NoTranscriptFound:
    print("   ERROR: No transcript found")
except TranscriptsDisabled:
    print("   ERROR: Transcripts are disabled")
except XMLParseError as parse_err:
    print(f"   ERROR: XMLParseError - {str(parse_err)}")
    print("   This means the transcript exists but data is empty/corrupted")
    traceback.print_exc()
except Exception as e:
    print(f"   ERROR: {type(e).__name__}: {str(e)}")
    traceback.print_exc()

print("\n" + "=" * 60)
print("Test completed!")

