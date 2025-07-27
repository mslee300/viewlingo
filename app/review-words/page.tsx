"use client";
import Image from "next/image";
import { useState, useRef, useEffect, useLayoutEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";



// Restore Language type and languages array
type Language = { emoji: string; name: string; code: string };
const languages: Language[] = [
  { emoji: "🇨🇳", name: "Mandarin", code: "zh" },
  { emoji: "🇰🇷", name: "Korean", code: "ko" },
  { emoji: "🇪🇸", name: "Spanish", code: "es" },
  { emoji: "🇫🇷", name: "French", code: "fr" },
  { emoji: "🇩🇪", name: "German", code: "de" },
  { emoji: "🇯🇵", name: "Japanese", code: "ja" },
  { emoji: "🇮🇹", name: "Italian", code: "it" },
  { emoji: "🇵🇹", name: "Portuguese", code: "pt" },
];

// Helper to play audio from a Blob
async function playAudioFromBlob(blob: Blob) {
  console.log('🔊 playAudioFromBlob called with blob:', blob);
  console.log('🔊 Blob size:', blob.size, 'bytes');
  console.log('🔊 Blob type:', blob.type);
  
  try {
    const url = URL.createObjectURL(blob);
    console.log('🔊 Created object URL:', url);
    
    const audio = new Audio(url);
    console.log('🔊 Audio element created:', audio);
    
    // Add event listeners for debugging
    audio.addEventListener('loadstart', () => console.log('🔊 Audio loadstart event'));
    audio.addEventListener('loadedmetadata', () => console.log('🔊 Audio loadedmetadata event'));
    audio.addEventListener('canplay', () => console.log('🔊 Audio canplay event'));
    audio.addEventListener('canplaythrough', () => console.log('🔊 Audio canplaythrough event'));
    audio.addEventListener('play', () => console.log('🔊 Audio play event'));
    audio.addEventListener('playing', () => console.log('🔊 Audio playing event'));
    audio.addEventListener('error', (e) => console.error('🔊 Audio error event:', e));
    audio.addEventListener('abort', () => console.log('🔊 Audio abort event'));
    
    console.log('🔊 Attempting to play audio...');
    await audio.play();
    console.log('🔊 Audio play() resolved successfully');
    
    // Clean up URL after a delay to ensure audio has loaded
    setTimeout(() => {
      URL.revokeObjectURL(url);
      console.log('🔊 Object URL revoked');
    }, 1000);
  } catch (error) {
    console.error('🔊 Error in playAudioFromBlob:', error);
    throw error;
  }
}

function ReviewWordsContent() {
  console.log("Component mounted");
  const searchParams = useSearchParams();
  const urlLang = searchParams.get('lang');
  const router = useRouter();
  
  // Set initial language based on URL parameter or default to Mandarin
  const initialLanguage = urlLang ? languages.find(lang => lang.code === urlLang) || languages[0] : languages[0];
  
  const [selectedLang, setSelectedLang] = useState<Language>(initialLanguage);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [wordData, setWordData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState<Record<string, boolean[]>>({});
  const [newCardIds, setNewCardIds] = useState<Set<string>>(new Set());
  const [playingIdx, setPlayingIdx] = useState<{date: string, idx: number} | null>(null);

  useEffect(() => {
    console.log("useEffect running");
    try {
      async function fetchWords() {
        console.log("fetchWords called");
        
        // Calculate today and yesterday in PDT (UTC-7)
        const now = new Date();
        const pdtOffset = -7 * 60; // PDT is UTC-7, offset in minutes
        const nowPDT = new Date(now.getTime() + (pdtOffset - now.getTimezoneOffset()) * 60 * 1000);
        
        const todayPDT = new Date(nowPDT);
        todayPDT.setHours(0, 0, 0, 0);
        
        const yesterdayPDT = new Date(todayPDT);
        yesterdayPDT.setDate(yesterdayPDT.getDate() - 1);
        
        // Format dates for API (YYYY-MM-DD)
        const todayStr = todayPDT.toISOString().split('T')[0];
        const yesterdayStr = yesterdayPDT.toISOString().split('T')[0];
        const dates = [todayStr, yesterdayStr];
        
        console.log('PDT Today:', todayStr);
        console.log('PDT Yesterday:', yesterdayStr);
        console.log('Selected language:', selectedLang.code);
        
        let allWords: unknown[] = [];
        for (const date of dates) {
          try {
            const url = `https://gobbler-working-bluebird.ngrok-free.app/words/by-language?language=${selectedLang.code}&date=${date}`;
            console.log('About to fetch:', url);
            const res = await fetch(url, {
              headers: {
                "ngrok-skip-browser-warning": "true",
              },
              mode: 'cors',
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
        
        // Group by date using PDT timezone
        const grouped: Record<string, unknown[]> = {};
        (allWords as unknown[]).forEach((word) => {
          const utcTimestamp = (word as Record<string, unknown>).timestamp as string;
          const wordTime = new Date(utcTimestamp);
          
          // Convert to PDT
          const wordTimePDT = new Date(wordTime.getTime() + (pdtOffset - wordTime.getTimezoneOffset()) * 60 * 1000);
          const wordDateStr = wordTimePDT.toISOString().split('T')[0];
          
          let dateKey: string;
          if (wordDateStr === todayStr) {
            dateKey = "Today";
          } else if (wordDateStr === yesterdayStr) {
            dateKey = "Yesterday";
          } else {
            // For any other dates, use the actual date
            dateKey = wordDateStr;
          }
          
          if (!grouped[dateKey]) grouped[dateKey] = [];
          grouped[dateKey].push(word);
        });
        
        const sorted = Object.entries(grouped)
          .sort((a, b) => {
            // "Today" should come before "Yesterday", then other dates chronologically
            if (a[0] === "Today" && b[0] !== "Today") return -1;
            if (a[0] !== "Today" && b[0] === "Today") return 1;
            if (a[0] === "Yesterday" && b[0] !== "Yesterday" && b[0] !== "Today") return -1;
            if (a[0] !== "Yesterday" && a[0] !== "Today" && b[0] === "Yesterday") return 1;
            return b[0].localeCompare(a[0]); // For other dates, sort chronologically (newest first)
          })
          .map(([date, words]) => ({ 
            date, 
            words: (words as unknown[]).sort((a, b) => {
              const aTime = new Date((a as Record<string, unknown>).timestamp as string).getTime();
              const bTime = new Date((b as Record<string, unknown>).timestamp as string).getTime();
              return bTime - aTime; // Latest first
            })
          }));
        setWordData(sorted);
        // Initialize flipped state for each section
        const newFlipped: Record<string, boolean[]> = {};
        sorted.forEach(section => {
          newFlipped[section.date] = Array(section.words.length).fill(false);
        });
        setFlipped(newFlipped);
        // Mark all cards as not new on initial load
        const allIds = new Set<string>();
        sorted.forEach(section => section.words.forEach((w) => allIds.add((w as Record<string, unknown>).id as string)));
        setNewCardIds(new Set());
        setLoading(false);
      }
      fetchWords().catch(e => console.error('fetchWords promise rejected', e));
    } catch (err) {
      console.error('Unexpected error in useEffect:', err);
    }
  }, [selectedLang]);

  // Remove highlight after 1s
  useLayoutEffect(() => {
    if (newCardIds.size === 0) return;
    const timeout = setTimeout(() => setNewCardIds(new Set()), 1000);
    return () => clearTimeout(timeout);
  }, [newCardIds]);

  // Dropdown close logic (display only)
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
        {/* Language dropdown display only */}
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
                    onClick={() => {
                      if (lang.name === "Mandarin" || lang.name === "Korean") {
                        setSelectedLang(lang);
                        setDropdownOpen(false);
                      } else {
                        setModalOpen(true);
                        setDropdownOpen(false);
                      }
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{lang.emoji}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            width: '100%',
            fontSize: 24,
            fontWeight: 700,
            textAlign: 'center',
          }}>Getting {selectedLang.name} words...</div>
        ) : wordData.length === 0 ? (
          <div style={{ textAlign: "center", margin: 40 }}>No {selectedLang.name} words found for the selected dates.</div>
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
                  const cardId = w.id as string;
                  const isNew = newCardIds.has(cardId);
                  // Card flip state for this card
                  const isFlipped = flipped[section.date]?.[idx] || false;
                  const isPlaying = !!(playingIdx && playingIdx.date === section.date && playingIdx.idx === idx);
                  return (
                    <div
                      key={idx}
                      style={{
                        perspective: 1200,
                        width: "100%",
                        aspectRatio: "1 / 1",
                        minWidth: 0,
                        maxWidth: "100%",
                        cursor: "pointer",
                        transition: 'background 1s',
                        background: isNew ? '#ffe066' : undefined,
                      }}
                      onClick={() => {
                        setFlipped(f => ({
                          ...f,
                          [section.date]: f[section.date]?.map((v, i) => i === idx ? !v : v)
                        }));
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                          borderRadius: 20,
                          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                          background: "#fff",
                          transition: "transform 0.7s cubic-bezier(.4,1,.4,1)",
                          transformStyle: "preserve-3d",
                          transform: isFlipped ? "rotateY(180deg)" : "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
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
                            borderRadius: 20,
                            background: "#fff",
                            zIndex: 2,
                          }}
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
                          <span
                            style={{
                              fontSize: (typeof w.word === 'string' && w.word.length > 12) ? 16 : 24,
                              fontWeight: 700,
                              color: "#222",
                              marginBottom: 18
                            }}
                          >
                            {w.word as string}
                          </span>
                        </div>
                        {/* Back */}
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
                            borderRadius: 20,
                            background: "#fff",
                            transform: "rotateY(180deg)",
                            zIndex: 1,
                          }}
                        >
                          <span
                            style={{
                              fontSize: (typeof w.translation === 'string' && w.translation.length > 6) ? 16 : 24,
                              fontWeight: 700,
                              color: "#222",
                              marginBottom: 8
                            }}
                          >
                            {w.translation as string}
                          </span>
                          <span
                            style={{
                              fontSize: (typeof w.anglosax === 'string' && w.anglosax.length > 12) ? 14 : 20,
                              fontWeight: 400,
                              color: "#9D9D9D",
                              marginBottom: 18
                            }}
                          >
                            {w.anglosax as string}
                          </span>
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
                              opacity: isPlaying ? 0.6 : 1,
                            }}
                            onClick={async e => {
                              e.stopPropagation();
                              console.log('🎵 TTS button clicked');
                              console.log('🎵 Word data:', w);
                              console.log('🎵 Translation text:', w.translation);
                              
                              if (isPlaying) {
                                console.log('🎵 Already playing, ignoring click');
                                return;
                              }
                              
                              setPlayingIdx({ date: section.date, idx });
                              console.log('🎵 Set playing state for:', section.date, 'index:', idx);
                              
                              try {
                                console.log('🎵 Making TTS API request...');
                                const requestBody = { text: w.translation };
                                console.log('🎵 Request body:', requestBody);
                                
                                const res = await fetch('/api/tts', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(requestBody),
                                });
                                
                                console.log('🎵 TTS API response status:', res.status);
                                console.log('🎵 TTS API response headers:', Object.fromEntries(res.headers.entries()));
                                
                                if (!res.ok) {
                                  const errorText = await res.text();
                                  console.error('🎵 TTS API error response:', errorText);
                                  throw new Error(`TTS failed with status ${res.status}: ${errorText}`);
                                }
                                
                                console.log('🎵 TTS API request successful, getting blob...');
                                const blob = await res.blob();
                                console.log('🎵 Received blob from TTS API:', blob);
                                console.log('🎵 Blob size:', blob.size, 'bytes');
                                console.log('🎵 Blob type:', blob.type);
                                
                                console.log('🎵 Calling playAudioFromBlob...');
                                await playAudioFromBlob(blob);
                                console.log('🎵 Audio playback completed successfully');
                              } catch (error) {
                                console.error('🎵 Error in TTS button click handler:', error);
                                console.error('🎵 Error details:', {
                                  name: error instanceof Error ? error.name : 'Unknown',
                                  message: error instanceof Error ? error.message : String(error),
                                  stack: error instanceof Error ? error.stack : 'No stack trace'
                                });
                                const errorMessage = error instanceof Error ? error.message : String(error);
                                alert(`Failed to play audio: ${errorMessage}`);
                              } finally {
                                console.log('🎵 Clearing playing state');
                                setPlayingIdx(null);
                              }
                            }}
                            disabled={isPlaying}
                          >
                            <Image src="/speaker.svg" alt="Play" width={12} height={12} style={{ marginRight: 6 }} />
                            <span style={{ fontWeight: 500, fontSize: 16 }}>{isPlaying ? 'Playing...' : 'Play'}</span>
                          </button>
                        </div>
                      </div>
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
              maxWidth: 300,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ marginBottom: 24, fontSize: 20, fontWeight: 600 }}>
              Choose Language
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {languages.filter(lang => lang.name === "Mandarin" || lang.name === "Korean").map((lang) => (
                <button
                  key={lang.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    background: "none",
                    border: "2px solid #eee",
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: 500,
                    padding: "12px 16px",
                    cursor: "pointer",
                    color: "#222",
                    transition: "all 0.2s",
                  }}
                  onClick={() => {
                    setSelectedLang(lang);
                    setModalOpen(false);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#2193b0";
                    e.currentTarget.style.background = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#eee";
                    e.currentTarget.style.background = "none";
                  }}
                >
                  <span style={{ fontSize: 24 }}>{lang.emoji}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
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
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Fixed bottom button bar */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 24,
          display: "flex",
          justifyContent: "center",
          zIndex: 100,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            display: "flex",
            gap: 20,
            padding: "0 24px",
            pointerEvents: "auto",
          }}
        >
          <button
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "#fff",
              color: "#222",
              border: "none",
              borderRadius: 24,
              boxShadow: "0 2px 12px 0 rgba(0,0,0,0.10)",
              fontSize: 18,
              fontWeight: 500,
              padding: "14px 0",
              cursor: "pointer",
            }}
            onClick={() => router.push('/vapi-call')}
          >
            <span style={{ fontSize: 20 }}>📞</span>
            <span>Call</span>
          </button>
          <button
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: 24,
              boxShadow: "0 2px 12px 0 rgba(0,0,0,0.10)",
              fontSize: 18,
              fontWeight: 500,
              padding: "14px 0",
              cursor: "pointer",
            }}
            onClick={() => { window.location.href = `/review-cards?language=${selectedLang.code}`; }}
          >
            <span style={{ fontSize: 20 }}>📝</span>
            <span>Review</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewWords() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewWordsContent />
    </Suspense>
  );
} 