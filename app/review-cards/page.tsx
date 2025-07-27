"use client";
import Image from "next/image";
import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const TOTAL_CARDS = 5;

type WordData = {
  id: string;
  word: string;
  translation: string;
  anglosax: string;
  picture: string;
  timestamp: string;
  language: string;
};

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

function ReviewCardsContent() {
  const [cardIdx, setCardIdx] = useState(0); // 0-based
  const [flipped, setFlipped] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [cardData, setCardData] = useState<WordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<("correct" | "wrong" | null)[]>(Array(TOTAL_CARDS).fill(null));
  const [startTime, setStartTime] = useState<number | null>(null);
  const [borderColor, setBorderColor] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipeThreshold = 50;

  // Start timer on mount
  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  // Fetch the latest 5 words from the selected language and dates
  useEffect(() => {
    async function fetchLatestWords() {
      try {
        console.log('🃏 Starting to fetch words for review cards...');

        // Get language from URL parameters, default to 'ko' if not specified
        const language = searchParams.get('language') || 'ko';
        console.log('🃏 Using language from URL:', language);
        
        // Calculate today and yesterday in PDT timezone
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
        
        const dates = [today, yesterday];
        
        console.log('🃏 PDT Today:', today);
        console.log('🃏 PDT Yesterday:', yesterday);
        console.log('🃏 Fetching dates:', dates);
        console.log('🃏 Fetching language:', language);

        let allWords: WordData[] = [];

        // Fetch from the selected language and both dates
        for (const date of dates) {
          try {
            const url = `https://gobbler-working-bluebird.ngrok-free.app/words/by-language?language=${language}&date=${date}`;
            console.log('🃏 Fetching from:', url);

            const headers: Record<string, string> = {
              "ngrok-skip-browser-warning": "true",
            };

            // Add API token if available (Next.js will inject this at build time)
            if (process.env.NEXT_PUBLIC_API_TOKEN) {
              headers["Authorization"] = `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`;
            }

            const res = await fetch(url, {
              headers,
              mode: 'cors',
            });

            console.log('🃏 Response status for', language, date, ':', res.status);

            if (res.ok) {
              const data = await res.json();
              console.log('🃏 Fetched', data.length, 'words for', language, date);
              allWords = allWords.concat(data);
            } else {
              console.error('🃏 Fetch error for', language, date, ':', res.status);
            }
          } catch (e) {
            console.error('🃏 Network or fetch error for', language, date, ':', e);
          }
        }

        console.log('🃏 Total words fetched:', allWords.length);

        // Sort by timestamp (latest first) and take the latest 5
        const sortedWords = allWords
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, TOTAL_CARDS);

        console.log('🃏 Selected', sortedWords.length, 'words for review cards');
        console.log('🃏 Selected words:', sortedWords.map(w => ({ word: w.word, language: w.language, timestamp: w.timestamp })));

        setCardData(sortedWords);
        setLoading(false);
      } catch (err) {
        console.error('🃏 Error fetching words:', err);
        setLoading(false);
      }
    }

    fetchLatestWords();
  }, [searchParams]);

  // Get current card
  const card = cardData[cardIdx];

  // Progress bar width (0 to 100%)
  const progress = cardData.length > 0 ? ((cardIdx + 1) / TOTAL_CARDS) * 100 : 0;

  // Show loading state
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          width: '100%',
          fontSize: 24,
          fontWeight: 700,
          textAlign: 'center',
        }}>Creating review cards...</div>
      </div>
    );
  }

  // Show error state if no cards
  if (cardData.length === 0) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>No review cards available for the selected dates</div>
      </div>
    );
  }

  // Swipe handlers
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(false);
    setSwipeX(0);
    setBorderColor(null);
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - (touchStartY.current ?? 0);
    if (Math.abs(dx) > Math.abs(dy)) {
      setSwipeX(dx);
      setIsSwiping(true);
      if (dx < -swipeThreshold) setBorderColor("#FF4D4F"); // red for wrong
      else if (dx > swipeThreshold) setBorderColor("#4CAF50"); // green for correct
      else setBorderColor(null);
    }
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const nextGrading = [...grading];
    if (Math.abs(dx) > swipeThreshold) {
      if (dx < 0) {
        // Mark as wrong, red border, do not go to previous card
        nextGrading[cardIdx] = "wrong";
        setGrading(nextGrading);
        setBorderColor("#FF4D4F");
        setTimeout(() => {
          setBorderColor(null);
          if (cardIdx < TOTAL_CARDS - 1) {
            setCardIdx(cardIdx + 1);
            setFlipped(false);
          } else if (cardIdx === TOTAL_CARDS - 1) {
            // End: calculate time and correct count
            const endTime = Date.now();
            const elapsed = Math.floor((endTime - (startTime ?? endTime)) / 1000);
            const mm = Math.floor(elapsed / 60);
            const ss = elapsed % 60;
            const timeStr = `${mm}:${ss.toString().padStart(2, '0')}`;
            const correct = nextGrading.filter(x => x === "correct").length;
            // Collect graded results
            const graded = cardData.map((c, i) => ({
              word: c.word,
              translation: c.translation,
              result: nextGrading[i],
            }));
            router.push(`/result?time=${encodeURIComponent(timeStr)}&correct=${correct}&graded=${encodeURIComponent(JSON.stringify(graded))}`);
          }
        }, 200); // show border color briefly
      } else if (dx > 0) {
        // Mark as correct, green border
        nextGrading[cardIdx] = "correct";
        setGrading(nextGrading);
        setBorderColor("#4CAF50");
        setTimeout(() => {
          setBorderColor(null);
          if (cardIdx < TOTAL_CARDS - 1) {
            setCardIdx(cardIdx + 1);
            setFlipped(false);
          } else if (cardIdx === TOTAL_CARDS - 1) {
            // End: calculate time and correct count
            const endTime = Date.now();
            const elapsed = Math.floor((endTime - (startTime ?? endTime)) / 1000);
            const mm = Math.floor(elapsed / 60);
            const ss = elapsed % 60;
            const timeStr = `${mm}:${ss.toString().padStart(2, '0')}`;
            const correct = nextGrading.filter(x => x === "correct").length;
            // Collect graded results
            const graded = cardData.map((c, i) => ({
              word: c.word,
              translation: c.translation,
              result: nextGrading[i],
            }));
            router.push(`/result?time=${encodeURIComponent(timeStr)}&correct=${correct}&graded=${encodeURIComponent(JSON.stringify(graded))}`);
          }
        }, 200);
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
              border: borderColor ? `4px solid ${borderColor}` : "none",
              transition: isSwiping
                ? "none"
                : "transform 0.7s cubic-bezier(.4,1,.4,1), border 0.2s cubic-bezier(.4,1,.4,1)",
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
              <Image
                src={`data:image/png;base64,${card.picture}`}
                alt={card.word}
                width={150}
                height={150}
                style={{ objectFit: "contain", marginTop: 32, marginBottom: 24 }}
              />
              <span style={{ fontSize: 28, fontWeight: 700, color: "#000", marginBottom: 32 }}>{card.word}</span>
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
              <Image
                src={`data:image/png;base64,${card.picture}`}
                alt={card.word}
                width={150}
                height={150}
                style={{ objectFit: "contain", marginTop: 32, marginBottom: 18 }}
              />
              <span style={{ fontSize: 28, fontWeight: 700, color: "#000", marginBottom: 6 }}>{card.translation}</span>
              <span style={{ fontSize: 20, fontWeight: 400, color: "#666", marginBottom: 24, letterSpacing: 0.2 }}>{card.anglosax}</span>
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
                  console.log('🎵 TTS button clicked in review cards');
                  console.log('🎵 Card data:', card);
                  console.log('🎵 Translation text:', card.translation);

                  if (isPlaying) {
                    console.log('🎵 Already playing, ignoring click');
                    return;
                  }

                  setIsPlaying(true);
                  console.log('🎵 Set playing state to true');

                  try {
                    console.log('🎵 Making TTS API request...');
                    const requestBody = { text: card.translation };
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
                    setIsPlaying(false);
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
      </div>
    </div>
  );
}

export default function ReviewCards() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewCardsContent />
    </Suspense>
  );
} 