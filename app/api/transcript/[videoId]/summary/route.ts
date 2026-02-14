import { NextRequest, NextResponse } from "next/server";
import {
  extractVideoId,
  fetchTranscript,
  transcriptToText,
} from "@/lib/youtube";
import { generateSummary } from "@/lib/openai";
import { errorResponse } from "@/lib/errors";
import type { SummaryResponse } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId: rawId } = await params;
  const videoId = extractVideoId(decodeURIComponent(rawId));

  const languages = request.nextUrl.searchParams.get("languages");
  const lengthParam = request.nextUrl.searchParams.get("length");
  const length = lengthParam ? parseInt(lengthParam, 10) : 300;

  if (isNaN(length) || length < 50 || length > 1000) {
    return errorResponse(
      "Summary length must be between 50 and 1000 words.",
      400
    );
  }

  try {
    const lang = languages
      ? languages.split(",").map((l) => l.trim())[0]
      : "en";

    const transcript = await fetchTranscript(videoId, lang);
    const transcriptText = transcriptToText(transcript);
    const summary = await generateSummary(transcriptText, length);
    const wordCount = summary.split(/\s+/).length;

    const body: SummaryResponse = {
      video_id: videoId,
      summary,
      word_count: wordCount,
      requested_length: length,
      success: true,
      message: "Summary generated successfully",
    };

    return NextResponse.json(body);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "status" in err && "detail" in err) {
      const e = err as { status: number; detail: string };
      return errorResponse(e.detail, e.status);
    }

    const message = err instanceof Error ? err.message : String(err);

    if (
      message.includes("disabled") ||
      message.includes("No transcript") ||
      message.includes("unavailable")
    ) {
      return errorResponse(message, 404);
    }

    return errorResponse(`Error generating summary: ${message}`, 500);
  }
}
