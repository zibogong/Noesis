import { NextRequest, NextResponse } from "next/server";
import { extractVideoId, fetchTranscript } from "@/lib/youtube";
import { errorResponse } from "@/lib/errors";
import type { TranscriptResponse } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId: rawId } = await params;
    const videoId = extractVideoId(decodeURIComponent(rawId));

    const languages = request.nextUrl.searchParams.get("languages");
    const lang = languages
      ? languages.split(",").map((l) => l.trim())[0]
      : "en";

    const transcript = await fetchTranscript(videoId, lang);

    const body: TranscriptResponse = {
      video_id: videoId,
      transcript,
      success: true,
      message: "Transcript retrieved successfully",
    };

    return NextResponse.json(body);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (
      message.includes("disabled") ||
      message.includes("No transcript") ||
      message.includes("unavailable")
    ) {
      return errorResponse(message, 404);
    }

    return errorResponse(
      `An error occurred while fetching transcript: ${message}`,
      500
    );
  }
}
