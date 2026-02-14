import OpenAI from "openai";

const OPENAI_MODEL = "gpt-4o-mini";
const MAX_TOKENS_ESTIMATE = 80000;

function estimateTokens(text: string): number {
  return Math.floor(text.length / 4);
}

export async function generateSummary(
  transcriptText: string,
  maxWords: number
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw { status: 500, detail: "OpenAI API key not configured. Please set OPENAI_API_KEY in .env.local file." };
  }

  const estimatedTokens = estimateTokens(transcriptText);
  if (estimatedTokens > MAX_TOKENS_ESTIMATE) {
    throw {
      status: 413,
      detail: `Transcript too long for summarization (${estimatedTokens} tokens estimated). Maximum is ${MAX_TOKENS_ESTIMATE} tokens. Try a shorter video.`,
    };
  }

  const prompt = `
    Summarize the following transcript as a high-impact audio script.

    Requirements:
    1. The summary should be optimized for listening, not reading.
    2. Start with a strong hook that highlights the core problem.
    3. Extract the main mental model(s) and present them clearly.
    4. Convert abstract ideas into concrete, actionable steps.
    5. Include short, memorable phrases or quotes.
    6. End with a practical reflection question for the listener.
    7. Length: in approximately ${maxWords} words

    Transcript:
    ${transcriptText}`;

  const client = new OpenAI({ apiKey });

  try {
    const response = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that creates concise, informative summaries of video transcripts.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: maxWords * 2,
    });

    const summary = response.choices[0]?.message?.content?.trim();
    if (!summary) {
      throw { status: 500, detail: "OpenAI returned an empty response" };
    }
    return summary;
  } catch (err: unknown) {
    if (err && typeof err === "object" && "status" in err && "detail" in err) {
      throw err;
    }
    if (err instanceof OpenAI.APIError) {
      if (err.status === 401) throw { status: 401, detail: "Invalid OpenAI API key" };
      if (err.status === 429) throw { status: 429, detail: "OpenAI API rate limit exceeded" };
      if (err.status && err.status >= 500) throw { status: 503, detail: "OpenAI API service unavailable" };
      throw { status: 500, detail: `OpenAI API error: ${err.message}` };
    }
    throw { status: 500, detail: `Error generating summary: ${String(err)}` };
  }
}
