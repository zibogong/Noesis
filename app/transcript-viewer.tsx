"use client";

import { useState, FormEvent } from "react";

export default function TranscriptViewer() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setSummary("");

    try {
      const encoded = encodeURIComponent(url.trim());
      const res = await fetch(`/api/transcript/${encoded}/summary`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Failed to generate summary");
        return;
      }

      setSummary(data.summary);
      setWordCount(data.word_count);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
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
          }}
        >
          {loading ? "Summarizing..." : "Summarize"}
        </button>
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
