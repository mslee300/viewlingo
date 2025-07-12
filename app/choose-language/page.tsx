"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

const languages = [
  { emoji: "🇨🇳", name: "Mandarin" },
  { emoji: "🇰🇷", name: "Korean" },
  { emoji: "🇪🇸", name: "Spanish" },
  { emoji: "🇫🇷", name: "French" },
  { emoji: "🇩🇪", name: "German" },
  { emoji: "🇯🇵", name: "Japanese" },
  { emoji: "🇮🇹", name: "Italian" },
  { emoji: "🇵🇹", name: "Portuguese" },
];

export default function ChooseLanguage() {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  function handleClick(name: string) {
    if (name === "Mandarin" || name === "Korean") {
      router.push("/fetching-words");
    } else {
      setModalOpen(true);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        padding: "60px 0 0 0",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420, padding: "0 24px", margin: "0 auto" }}>
        <button
          style={{
            background: "none",
            border: "none",
            padding: 0,
            marginBottom: 60,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
          onClick={() => window.history.back()}
          aria-label="Go back"
        >
          <Image src="/back-arrow.svg" alt="Back" width={28} height={28} />
        </button>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 600,
            marginBottom: 50,
            lineHeight: 1.2,
          }}
        >
          Which language<br />you want to learn?
        </h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {languages.map((lang) => (
            <button
              key={lang.name}
              style={{
                width: "100%",
                background: "#FAFAFA",
                border: "none",
                borderRadius: 9999,
                padding: "18px 20px",
                fontSize: 18,
                fontWeight: 500,
                color: "#444",
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 0,
                cursor: "pointer",
                boxShadow: "none",
              }}
              onClick={() => handleClick(lang.name)}
            >
              <span style={{ fontSize: 22, marginRight: 10 }}>{lang.emoji}</span>
              {lang.name}
            </button>
          ))}
        </div>
        <div style={{ height: 60 }} />
      </div>
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "32px 40px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
              fontSize: 18,
              fontWeight: 500,
              color: "#222",
              textAlign: "center",
            }}
            onClick={e => e.stopPropagation()}
          >
            Coming soon..<br />Please choose Mandarin or Korean
            <div style={{ marginTop: 24 }}>
              <button
                style={{
                  background: "#111",
                  color: "#fff",
                  border: "none",
                  borderRadius: 9999,
                  padding: "10px 28px",
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                onClick={() => setModalOpen(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 