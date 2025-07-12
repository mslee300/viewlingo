"use client";

export default function FetchingWords() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        width: "100%",
        height: "100%",
        borderRadius: 0,
      }}
    >
      <h1 style={{ fontSize: 30, fontWeight: 500, textAlign: "center" }}>
        <span
          style={{
            background:
              "linear-gradient(90deg, #6dd5ed, #2193b0, #6a82fb, #b2fefa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontWeight: 500,
          }}
        >
          Fetching words..
        </span>
      </h1>
    </div>
  );
} 