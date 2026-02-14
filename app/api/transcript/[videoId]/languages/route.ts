import { NextRequest, NextResponse } from "next/server";
import { extractVideoId, listAvailableLanguages } from "@/lib/youtube";
import { errorResponse } from "@/lib/errors";
import type { LanguagesResponse } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId: rawId } = await params;
    const videoId = extractVideoId(decodeURIComponent(rawId));

    const languages = await listAvailableLanguages(videoId);

    const body: LanguagesResponse = {
      video_id: videoId,
      available_languages: languages,
      success: true,
    };

    return NextResponse.json(body);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("unavailable")) {
      return errorResponse(message, 404);
    }

    return errorResponse(
      `An error occurred while fetching available languages: ${message}`,
      500
    );
  }
}
