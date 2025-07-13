"use client";
import Image from "next/image";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const TOTAL_CARDS = 5;

const cardData = [
  {
    image: "/apple-photo.png",
    answer: {
      word: "苹果",
      pronunciation: "Píngguǒ",
      audio: "/audio/apple-zh.mp3", // Placeholder, not implemented
    },
  },
  // ...repeat for demo, or add more cards
];

export default function ReviewCards() {
  const [cardIdx, setCardIdx] = useState(0); // 0-based
  const [flipped, setFlipped] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const router = useRouter();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipeThreshold = 50;

  // For demonstration, always show apple
  const card = cardData[0];

  // Progress bar width (0 to 100%)
  const progress = ((cardIdx + 1) / TOTAL_CARDS) * 100;

  // Swipe handlers
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(false);
    setSwipeX(0);
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - (touchStartY.current ?? 0);
    if (Math.abs(dx) > Math.abs(dy)) {
      setSwipeX(dx);
      setIsSwiping(true);
    }
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > swipeThreshold) {
      if (dx < 0 && cardIdx < TOTAL_CARDS - 1) {
        setCardIdx(cardIdx + 1);
        setFlipped(false);
      } else if (dx > 0 && cardIdx > 0) {
        setCardIdx(cardIdx - 1);
        setFlipped(false);
      }
    }
    setSwipeX(0);
    setIsSwiping(false);
    touchStartX.current = null;
    touchStartY.current = null;
  }

  // Flip handler (only if not swiping)
  function handleCardClick() {
    if (!isSwiping) setFlipped((f) => !f);
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
        <div style={{ fontSize: 26, fontWeight: 600, marginBottom: 20 }}>What do you see?</div>
        {/* Card with flip and swipe effect */}
        <div
          style={{
            perspective: 1600,
            width: "100%",
            aspectRatio: "1/1.32",
            margin: "0 auto",
            maxWidth: "100%",
            touchAction: "pan-y",
            userSelect: "none",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: 24,
              boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
              background: "#fff",
              transition: isSwiping
                ? "none"
                : "transform 0.7s cubic-bezier(.4,1,.4,1)",
              transformStyle: "preserve-3d",
              transform:
                `translateX(${swipeX}px) scale(${isSwiping ? 0.97 : 1}) rotateY(${flipped ? 180 : 0}deg) rotateZ(${isSwiping ? swipeX * 0.05 : 0}deg)` +
                (isSwiping ? ` rotateY(${swipeX * 0.15}deg)` : ""),
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleCardClick}
          >
            {/* Front */}
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backfaceVisibility: "hidden",
                borderRadius: 24,
                background: "#fff",
                boxShadow: flipped ? "0 0 0 transparent" : "0 4px 24px rgba(0,0,0,0.10)",
                opacity: flipped ? 0.7 : 1,
                filter: flipped ? "blur(0.5px) grayscale(0.2)" : "none",
                transition: "opacity 0.3s, filter 0.3s",
              }}
            >
              <Image src={card.image} alt={card.answer.word} width={150} height={150} style={{ objectFit: "contain", marginTop: 32, marginBottom: 24 }} />
              <span style={{ fontSize: 28, fontWeight: 700, color: "#111", marginBottom: 32 }}>{card.answer.word}</span>
            </div>
            {/* Back (Answer) */}
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backfaceVisibility: "hidden",
                borderRadius: 24,
                background: "#fff",
                transform: "rotateY(180deg)",
                boxShadow: !flipped ? "0 0 0 transparent" : "0 8px 32px rgba(0,0,0,0.12)",
                opacity: flipped ? 1 : 0.7,
                filter: flipped ? "none" : "blur(0.5px) grayscale(0.2)",
                transition: "opacity 0.3s, filter 0.3s",
              }}
            >
              <Image src={card.image} alt={card.answer.word} width={150} height={150} style={{ objectFit: "contain", marginTop: 32, marginBottom: 18 }} />
              <span style={{ fontSize: 28, fontWeight: 700, color: "#111", marginBottom: 6 }}>{card.answer.word}</span>
              <span style={{ fontSize: 20, fontWeight: 400, color: "#9D9D9D", marginBottom: 24, letterSpacing: 0.2 }}>{card.answer.pronunciation}</span>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#000",
                  color: "#fff",
                  border: "none",
                  borderRadius: 9999,
                  padding: "7px 18px 7px 14px",
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: "pointer",
                  marginBottom: 0,
                }}
                // onClick={() => {}}
              >
                <Image src="/speaker.svg" alt="Play" width={12} height={12} style={{ marginRight: 6 }} />
                <span style={{ fontWeight: 500, fontSize: 16 }}>Play</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 