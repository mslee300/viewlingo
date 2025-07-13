"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Result() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const searchParams = useSearchParams();
  const time = searchParams.get("time") || "0:00";
  const correct = parseInt(searchParams.get("correct") || "0", 10);
  const total = 5;
  const score = Math.round((correct / total) * 100);

  // Scroll input into view on focus (for mobile)
  useEffect(() => {
    const inputEl = inputRef.current;
    if (!inputEl) return;
    function handleFocus() {
      setTimeout(() => {
        if (inputEl) {
          inputEl.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }, 200);
    }
    inputEl.addEventListener("focus", handleFocus);
    return () => {
      inputEl.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 0 24px 0",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ height: 32 }} />
        <div style={{ textAlign: "center", fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Result</div>
        {/* Score Card */}
        <div
          style={{
            width: "100%",
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 24px 18px 24px",
            marginBottom: 32,
            gap: 12,
          }}
        >
          {/* Time */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <span style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>{time}</span>
            <span style={{ fontSize: 14, color: "#9D9D9D", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
              <span role="img" aria-label="clock">⏰</span> Time
            </span>
          </div>
          {/* Correct */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <span style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>{correct}</span>
            <span style={{ fontSize: 14, color: "#9D9D9D", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
              <span role="img" aria-label="check">✅</span> Correct
            </span>
          </div>
          {/* Score */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <span style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>{score}%</span>
            <span style={{ fontSize: 14, color: "#9D9D9D", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
              <span role="img" aria-label="score">💯</span> Score
            </span>
          </div>
        </div>
        {/* AI Coach */}
        <div style={{ fontSize: 16, color: "#9D9D9D", fontWeight: 500, marginBottom: 12 }}>AI language coach</div>
        {/* Chat area */}
        <div style={{ fontSize: 16, color: "#111", fontWeight: 400, marginBottom: 0, whiteSpace: "pre-line" }}>
          Great job!
          <br />
          Do you have any question?
        </div>
      </div>
      {/* Chat input at bottom */}
      <div style={{ width: "100%", maxWidth: 420, margin: "auto 0 0 0", padding: "0 16px" }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask anything"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{
            width: "100%",
            background: "#F4F4F4",
            border: "none",
            borderRadius: 9999,
            padding: "16px 20px",
            fontSize: 16,
            color: "#222",
            marginTop: 32,
            outline: "none",
            fontWeight: 400,
            boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  );
} 