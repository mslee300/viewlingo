"use client";
import Image from "next/image";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const TOTAL_CARDS = 5;

export default function ReviewCards() {
  const [cardIdx, setCardIdx] = useState(0); // 0-based
  const router = useRouter();
  const touchStartX = useRef<number | null>(null);

  // For demonstration, always show apple
  const card = { image: "/apple-photo.png", text: "Apple" };

  // Progress bar width (0 to 100%)
  const progress = ((cardIdx + 1) / TOTAL_CARDS) * 100;

  // Swipe handlers
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff < 0 && cardIdx < TOTAL_CARDS - 1) {
        setCardIdx(cardIdx + 1);
      } else if (diff > 0 && cardIdx > 0) {
        setCardIdx(cardIdx - 1);
      }
    }
    touchStartX.current = null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        padding: "0 20px 40px 20px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420, margin: "0 auto", padding: "0" }}>
        {/* Progress Bar */}
        <div style={{ marginTop: 40 }} />
        <div style={{ width: "100%", height: 6, background: "#E5E7EB", borderRadius: 3, margin: "0 0 24px 0" }}>
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#000",
              borderRadius: 3,
              transition: "width 0.3s cubic-bezier(.4,1,.4,1)",
            }}
          />
        </div>
        {/* Top Row: Back + Counter */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", marginBottom: 18 }}>
          <button
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => router.push("/review-words")}
            aria-label="Go back"
          >
            <Image src="/back-arrow.svg" alt="Back" width={28} height={28} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{cardIdx + 1}/{TOTAL_CARDS}</span>
        </div>
        {/* Prompt */}
        <div style={{ fontSize: 26, fontWeight: 600, marginBottom: 28 }}>What do you see?</div>
        {/* Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            padding: 0,
            width: "100%",
            aspectRatio: "1/1.32",
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            touchAction: "pan-y",
            userSelect: "none",
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Image src={card.image} alt={card.text} width={150} height={150} style={{ objectFit: "contain", marginTop: 32, marginBottom: 18 }} />
          <span style={{ fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 32 }}>{card.text}</span>
        </div>
      </div>
    </div>
  );
} 