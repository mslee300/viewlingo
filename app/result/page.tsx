"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

function ResultContent() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [thinking, setThinking] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const time = searchParams.get("time") || "0:00";
  const correct = parseInt(searchParams.get("correct") || "0", 10);
  const total = 5;
  const score = Math.round((correct / total) * 100);
  const gradedParam = searchParams.get("graded");
  let graded: { word: string; translation: string; result: string | null }[] = [];
  if (gradedParam) {
    try {
      graded = JSON.parse(gradedParam);
    } catch {}
  }

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

  // Helper to generate graded summary for system prompt
  function gradedSummaryString(graded: { word: string; translation: string; result: string | null }[]) {
    if (!graded || graded.length === 0) return '';
    return graded.map((g, i) =>
      `${i + 1}. ${g.word} (${g.translation}) - ${g.result === 'correct' ? 'Correct' : g.result === 'wrong' ? 'Wrong' : 'Not graded'}`
    ).join('\n');
  }

  // On mount, get AI recap as first message
  useEffect(() => {
    async function fetchRecap() {
      setThinking(true);
      setMessages([{ role: "ai", text: "Thinking..." }]);
      const SYSTEM_PROMPT_TEMPLATE = `You are an expert Mandarin Chinese language coach with years of experience teaching Chinese to English speakers. You have a warm, encouraging, and patient teaching style that adapts to each student's learning pace and needs.\n\nCONTEXT: The user has just completed a Chinese word review session using flashcards and saw \"Great job! Do you have any questions?\" They practiced 5 specific Chinese characters/words and graded themselves on each one. They are now asking you a question about Chinese language learning.\n\nYOUR ROLE:\n- Provide clear, accurate explanations about Mandarin Chinese grammar, vocabulary, pronunciation, and culture\n- Use simple English explanations while incorporating Chinese characters (simplified), pinyin, and tone marks\n- Give practical examples and context for better understanding\n- Encourage continued learning and celebrate progress\n- Adapt your teaching style to the user's apparent level (beginner, intermediate, advanced)\n- Reference the specific characters they just studied when relevant to their question\n\nTEACHING APPROACH:\n- Break down complex concepts into digestible parts\n- Use memory techniques and mnemonics when helpful\n- Provide cultural context to make learning more meaningful\n- Offer multiple example sentences to illustrate usage\n- Suggest practice exercises or next steps when appropriate\n- Connect explanations to the words they just reviewed when applicable\n\nFORMATTING:\n- Use Chinese characters followed by pinyin with tone marks: 你好 (nǐ hǎo)\n- Include tone numbers when helpful: ni3 hao3\n- Bold key vocabulary or grammar points\n- Use bullet points for lists or steps\n\nTONE: Supportive, knowledgeable, and enthusiastic about helping the user improve their Mandarin skills.\n\nThe user's question relates to their Chinese language learning journey. Below are the 5 characters/words they just practiced with their self-graded performance:\n\n[CHARACTERS_AND_GRADES_WILL_BE_INSERTED_HERE]\n\nPlease respond helpfully and encouragingly, referencing their recent practice session when relevant to their question.`;
      const gradedStr = gradedSummaryString(graded);
      const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('[CHARACTERS_AND_GRADES_WILL_BE_INSERTED_HERE]', gradedStr);
      const recapPrompt = "Please give the user a friendly, VERY concise recap of what they got right and wrong in their review session above. End your message by asking if they have any additional questions.";
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", text: recapPrompt }], systemPrompt }),
      });
      const data = await res.json();
      setMessages([{ role: "ai", text: data.output || "Great job! Do you have any questions?" }]);
      setThinking(false);
    }
    fetchRecap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle user input submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(msgs => [...msgs, { role: "user", text: input }]);
    setThinking(true);
    setMessages(msgs => msgs.concat({ role: "ai", text: "Thinking..." }));
    try {
      // Prepare the full conversation history, including the new user message (but not the 'Thinking...' placeholder)
      const conversation = [
        ...messages,
        { role: "user", text: input }
      ];
      // Prepare the system prompt with graded summary
      const SYSTEM_PROMPT_TEMPLATE = `You are an expert Mandarin Chinese language coach with years of experience teaching Chinese to English speakers. You have a warm, encouraging, and patient teaching style that adapts to each student's learning pace and needs.\n\nCONTEXT: The user has just completed a Chinese word review session using flashcards and saw \"Great job! Do you have any questions?\" They practiced 5 specific Chinese characters/words and graded themselves on each one. They are now asking you a question about Chinese language learning.\n\nYOUR ROLE:\n- Provide clear, accurate explanations about Mandarin Chinese grammar, vocabulary, pronunciation, and culture\n- Use simple English explanations while incorporating Chinese characters (simplified), pinyin, and tone marks\n- Give practical examples and context for better understanding\n- Encourage continued learning and celebrate progress\n- Adapt your teaching style to the user's apparent level (beginner, intermediate, advanced)\n- Reference the specific characters they just studied when relevant to their question\n\nTEACHING APPROACH:\n- Break down complex concepts into digestible parts\n- Use memory techniques and mnemonics when helpful\n- Provide cultural context to make learning more meaningful\n- Offer multiple example sentences to illustrate usage\n- Suggest practice exercises or next steps when appropriate\n- Connect explanations to the words they just reviewed when applicable\n\nFORMATTING:\n- Use Chinese characters followed by pinyin with tone marks: 你好 (nǐ hǎo)\n- Include tone numbers when helpful: ni3 hao3\n- Bold key vocabulary or grammar points\n- Use bullet points for lists or steps\n\nTONE: Supportive, knowledgeable, and enthusiastic about helping the user improve their Mandarin skills.\n\nThe user's question relates to their Chinese language learning journey. Below are the 5 characters/words they just practiced with their self-graded performance:\n\n[CHARACTERS_AND_GRADES_WILL_BE_INSERTED_HERE]\n\nPlease respond helpfully and encouragingly, referencing their recent practice session when relevant to their question.`;
      const gradedStr = gradedSummaryString(graded);
      const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('[CHARACTERS_AND_GRADES_WILL_BE_INSERTED_HERE]', gradedStr);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation, systemPrompt }),
      });
      const data = await res.json();
      setMessages(msgs => [
        ...msgs.slice(0, -1),
        { role: "ai", text: data.output || "Sorry, I didn't get that." }
      ]);
    } catch {
      setMessages(msgs => [
        ...msgs.slice(0, -1),
        { role: "ai", text: "Sorry, something went wrong." }
      ]);
    } finally {
      setThinking(false);
      setInput("");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        alignItems: "center",
      }}
    >
      {/* Sticky header with gradient fade at the bottom */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "none", // allow inner content to be interactive
      }}>
        <div style={{
          background: "#fff",
          width: "100%",
          maxWidth: 430,
          margin: "0 auto",
          padding: "32px 24px 12px 24px",
          boxSizing: "border-box",
          borderRadius: 0,
          pointerEvents: "auto", // allow interaction
        }}>
          {/* Top Row: Back + Heading */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", marginBottom: 24 }}>
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
            <span style={{ fontSize: 18, fontWeight: 600 }}>Result</span>
          </div>
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
              marginBottom: 24,
              gap: 12,
              position: "relative",
              zIndex: 2,
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
        </div>
        {/* Gradient fade at the bottom of the sticky header */}
        <div style={{
          width: "100%",
          maxWidth: 430,
          height: 32,
          margin: "0 auto",
          marginTop: -8,
          pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 80%, rgba(255,255,255,0) 100%)"
        }} />
      </div>

      {/* Scrollable chat area */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        width: "100%",
        maxWidth: 430,
        padding: "0 24px",
        boxSizing: "border-box",
        margin: "0 auto",
        paddingBottom: "100px", // Space for fixed input
      }}>
        {/* Render all messages */}
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            {msg.role === 'ai' && (
              <div>
                <div style={{ fontSize: 14, color: "#9D9D9D", fontWeight: 500, marginBottom: 8 }}>
                  AI language coach
                </div>
                <div style={{
                  color: msg.text === 'Thinking...' ? '#9D9D9D' : '#111',
                  fontSize: 16,
                  fontWeight: 400,
                  whiteSpace: 'pre-line',
                  lineHeight: 1.4,
                }}>
                  {msg.text}
                </div>
              </div>
            )}
            {msg.role === 'user' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <div style={{
                  background: '#F4F4F4',
                  color: '#111',
                  fontSize: 16,
                  fontWeight: 500,
                  borderRadius: 12,
                  padding: '6px 18px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  whiteSpace: 'pre-line',
                  maxWidth: 260,
                }}>
                  {msg.text}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fixed chat input at bottom, centered and max-width */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}>
        <div style={{
          width: "100%",
          maxWidth: 430,
          background: "#fff",
          padding: "16px 24px 24px 24px",
          boxSizing: "border-box",
          borderRadius: 0,
          pointerEvents: "auto",
        }}>
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
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
                outline: "none",
                fontWeight: 400,
                boxSizing: "border-box",
              }}
              disabled={thinking}
            />
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Result() {
  return (
    <Suspense>
      <ResultContent />
    </Suspense>
  );
}