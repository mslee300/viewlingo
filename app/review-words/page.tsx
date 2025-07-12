"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

type Language = { emoji: string; name: string };

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

const wordData = [
  {
    date: "Jul 13 2025",
    words: ["Apple", "Apple"],
  },
  {
    date: "Jul 12 2025",
    words: ["Apple", "Apple", "Apple", "Apple"],
  },
];

export default function ReviewWords() {
  const [selectedLang, setSelectedLang] = useState<Language>(languages[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function handleLangSelect(lang: Language) {
    if (lang.name === "Mandarin" || lang.name === "Korean") {
      setSelectedLang(lang);
      setDropdownOpen(false);
    } else {
      setDropdownOpen(false);
      setModalOpen(true);
    }
  }

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        padding: "0 0 40px 0",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ height: 32 }} />
        <div style={{ textAlign: "center", fontWeight: 600, fontSize: 18, marginBottom: 18 }}>
          Your words
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#fff",
                border: "none",
                borderRadius: 9999,
                boxShadow: "0 2px 12px 0 rgba(0,0,0,0.08)",
                fontSize: 16,
                fontWeight: 500,
                padding: "5px 16px 5px 16px",
                cursor: "pointer",
                minWidth: 120,
              }}
              onClick={() => setDropdownOpen((v) => !v)}
            >
              <span style={{ fontSize: 20 }}>{selectedLang.emoji}</span>
              <span style={{ fontWeight: 500 }}>{selectedLang.name}</span>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ marginLeft: 6 }}><path d="M6 8l4 4 4-4" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "110%",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  borderRadius: 16,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                  zIndex: 10,
                  padding: 4,
                }}
              >
                {languages.map((lang) => (
                  <button
                    key={lang.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      background: "none",
                      border: "none",
                      borderRadius: 12,
                      fontSize: 16,
                      fontWeight: 500,
                      padding: "10px 16px",
                      cursor: "pointer",
                      color: lang.name === selectedLang.name ? "#2193b0" : "#222",
                    }}
                    onClick={() => handleLangSelect(lang)}
                  >
                    <span style={{ fontSize: 20 }}>{lang.emoji}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {wordData.map((section) => (
          <div key={section.date} style={{ marginBottom: 50 }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 32 }}>{section.date}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {section.words.map((word, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#fff",
                    borderRadius: 20,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                    padding: "12px 18px 12px 18px",
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#222" }}>{word}</span>
                  <Image src="/apple-photo.png" alt="Apple" width={60} height={60} style={{ objectFit: "contain" }} />
                </div>
              ))}
            </div>
          </div>
        ))}
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