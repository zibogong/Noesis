import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { waitUntil } from "@vercel/functions";
import {
  createOrUpdateSummary,
  getUserSummaries,
  checkRateLimit,
  updateSummaryStatus,
} from "@/lib/db";
import { extractVideoId, fetchTranscript, transcriptToText } from "@/lib/youtube";
import { generateSummary } from "@/lib/openai";

export async function POST(request: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { url, language = "en", length = 300 } = body;

  if (!url) {
    return NextResponse.json({ detail: "URL is required" }, { status: 400 });
  }

  const videoId = extractVideoId(url);

  const rateLimited = await checkRateLimit(email);
  if (rateLimited) {
    return NextResponse.json(
      { detail: "Rate limit reached: 5 videos per day" },
      { status: 429 }
    );
  }

  const record = await createOrUpdateSummary(email, videoId, language, length);

  const processInBackground = async () => {
    try {
      await updateSummaryStatus(record.id, { status: "processing" });
      const transcript = await fetchTranscript(videoId, language);
      const text = transcriptToText(transcript);
      const summary = await generateSummary(text, length);
      const wordCount = summary.split(/\s+/).length;
      await updateSummaryStatus(record.id, {
        status: "completed",
        summary,
        word_count: wordCount,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "detail" in err
            ? String((err as { detail: unknown }).detail)
            : "Unknown error";
      await updateSummaryStatus(record.id, {
        status: "failed",
        error_message: message,
      });
    }
  };

  try {
    waitUntil(processInBackground());
  } catch {
    // Local dev fallback: waitUntil may not be available
    processInBackground();
  }

  return NextResponse.json(record);
}

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const summaries = await getUserSummaries(email);
  return NextResponse.json(summaries);
}
