import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "YouTube Transcript API",
    version: "1.0.0",
    endpoints: {
      "GET /api/transcript/{video_id_or_url}":
        "Get transcript for a YouTube video (JSON format)",
      "GET /api/transcript/{video_id_or_url}/text":
        "Get transcript as plain text",
      "GET /api/transcript/{video_id_or_url}/summary":
        "Get AI-generated summary of transcript",
      "GET /api/transcript/{video_id_or_url}/languages":
        "Get available languages for a video",
    },
  });
}
