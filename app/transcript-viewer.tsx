"use client";

import { useState, useRef, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { VideoSummaryRecord } from "@/lib/types";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh", label: "Chinese" },
  { code: "es", label: "Spanish" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "ar", label: "Arabic" },
];

const LENGTHS = [
  { value: 100, label: "Short (~100 words)" },
  { value: 300, label: "Medium (~300 words)" },
  { value: 500, label: "Long (~500 words)" },
  { value: 800, label: "Detailed (~800 words)" },
];

const selectStyle = {
  padding: "0.6rem 0.8rem",
  border: "1px solid #ccc",
  borderRadius: 4,
  fontSize: "0.9rem",
  background: "white",
};

type Status = "idle" | "pending" | "processing" | "completed" | "failed";

export default function TranscriptViewer() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("en");
  const [length, setLength] = useState(300);
  const [summary, setSummary] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(
    (id: string) => {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/summaries/${id}`);
          if (!res.ok) return;
          const data: VideoSummaryRecord = await res.json();

          setStatus(data.status);

          if (data.status === "completed") {
            stopPolling();
            setSummary(data.summary ?? "");
            setWordCount(data.word_count ?? 0);
            router.refresh();
          } else if (data.status === "failed") {
            stopPolling();
            setError(data.error_message ?? "Summary generation failed");
          }
        } catch {
          // ignore transient poll errors
        }
      }, 2000);
    },
    [stopPolling, router]
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    stopPolling();
    setStatus("pending");
    setError("");
    setSummary("");
    setWordCount(0);

    try {
      const res = await fetch("/api/summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), language, length }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setStatus("idle");
        setError("Rate limit reached: 5 videos per day");
        return;
      }

      if (!res.ok) {
        setStatus("idle");
        setError(data.detail || "Failed to create summary request");
        return;
      }

      setStatus(data.status);
      pollStatus(data.id);
    } catch {
      setStatus("idle");
      setError("Network error. Please try again.");
    }
  }

  const loading = status === "pending" || status === "processing";
  const statusLabel =
    status === "pending"
      ? "Pending..."
      : status === "processing"
        ? "Processing..."
        : "Summarize";

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube URL or video ID..."
            style={{
              flex: 1,
              padding: "0.6rem 0.8rem",
              border: "1px solid #ccc",
              borderRadius: 4,
              fontSize: "1rem",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.6rem 1.2rem",
              background: loading ? "#999" : "#0070f3",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem",
              whiteSpace: "nowrap",
            }}
          >
            {statusLabel}
          </button>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem", color: "#555" }}>
            Language
            <select value={language} onChange={(e) => setLanguage(e.target.value)} style={selectStyle}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem", color: "#555" }}>
            Length
            <select value={length} onChange={(e) => setLength(Number(e.target.value))} style={selectStyle}>
              {LENGTHS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </label>
        </div>
      </form>

      {error && (
        <div style={{ padding: "1rem", background: "#fee", border: "1px solid #fcc", borderRadius: 4, color: "#c00", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {summary && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 4,
            background: "white",
            padding: "1.5rem",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
        >
          {summary}
          <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#666" }}>
            {wordCount} words
          </div>
        </div>
      )}
    </div>
  );
}
