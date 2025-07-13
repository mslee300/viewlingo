"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

// Helper to format date as 'Jul 13 2025'
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ReviewWords() {
  console.log("Component mounted");
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [wordData, setWordData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    console.log("useEffect running");
    try {
      async function fetchWords() {
        console.log("fetchWords called");
        const dates = ['2025-07-12', '2025-07-13']; // Use known dates with data for debugging
        let allWords: unknown[] = [];
        for (const date of dates) {
          try {
            const url = `https://1f62a5b52290.ngrok-free.app/words/full?date=${date}`;
            console.log('About to fetch:', url);
            const res = await fetch(url, {
              headers: {
                'Accept': 'application/json',
              },
            });
            console.log('Fetch completed for:', url);
            const text = await res.text();
            console.log('Raw response for', date, text.slice(0, 200)); // log first 200 chars
            if (res.ok) {
              let data;
              try {
                data = JSON.parse(text);
              } catch (e) {
                console.error('JSON parse error:', e, text.slice(0, 200));
                continue;
              }
              console.log('Fetched for', date, data); // Debug log
              allWords = allWords.concat(data);
            } else {
              console.error('Fetch error', res.status, text.slice(0, 200));
            }
          } catch (e) {
            console.error('Network or fetch error', e);
          }
        }
        // Group by date (format: 'Jul 13 2025')
        const grouped: Record<string, unknown[]> = {};
        (allWords as unknown[]).forEach((word) => {
          const dateKey = formatDate((word as Record<string, unknown>).timestamp as string);
          if (!grouped[dateKey]) grouped[dateKey] = [];
          grouped[dateKey].push(word);
        });
        const sorted = Object.entries(grouped)
          .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
          .map(([date, words]) => ({ date, words }));
        setWordData(sorted);
        setLoading(false);
      }
      fetchWords().catch(e => console.error('fetchWords promise rejected', e));
    } catch (err) {
      console.error('Unexpected error in useEffect:', err);
    }
  }, []);

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
        {loading ? (
          <div style={{ textAlign: "center", margin: 40 }}>Loading...</div>
        ) : wordData.length === 0 ? (
          <div style={{ textAlign: "center", margin: 40 }}>No words found for the last two days.</div>
        ) : (
          (wordData as { date: string; words: unknown[] }[]).map((section) => (
            <div key={section.date} style={{ marginBottom: 50 }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 32 }}>{section.date}</div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "clamp(10px, 4vw, 20px)",
                }}
              >
                {section.words.map((word, idx: number) => {
                  const w = word as Record<string, unknown>;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#fff",
                        borderRadius: 20,
                        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                        padding: 0,
                        aspectRatio: "1 / 1",
                        minWidth: 0,
                        width: "100%",
                        maxWidth: "100%",
                        cursor: "pointer",
                      }}
                      onClick={() => router.push("/review-cards")}
                    >
                      {w.picture ? (
                        <Image
                          src={`data:image/png;base64,${w.picture as string}`}
                          alt={w.word as string}
                          width={90}
                          height={90}
                          style={{ objectFit: "contain", marginTop: 18, marginBottom: 10 }}
                        />
                      ) : (
                        <div style={{ width: 90, height: 90, marginTop: 18, marginBottom: 10, background: '#eee', borderRadius: 12 }} />
                      )}
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#222", marginBottom: 18 }}>{w.word as string}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
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