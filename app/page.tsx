"use client";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function Home() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#000",
        position: "relative",
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <Image
          src="/logo-splash.svg"
          alt="ViewLingo logo"
          width={200}
          height={200}
          priority
          style={{ marginBottom: 10 }}
        />
        <p
          style={{
            color: "#7B7B7B",
            fontSize: 20,
            textAlign: "center",
            fontWeight: 400,
            marginBottom: 0,
          }}
        >
          Duolingo for vision
        </p>
      </div>
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          style={{
            width: "100%",
            background: "#111",
            color: "#fff",
            border: "1px solid #303030",
            borderRadius: 9999,
            padding: "0.9rem 0",
            fontSize: 16,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
            cursor: "pointer",
          }}
          onClick={() => signIn('google')}
        >
          <Image
            src="/google-icon.svg"
            alt="Google icon"
            width={24}
            height={24}
            style={{ marginRight: 8 }}
          />
          Continue with google
        </button>
      </div>
    </div>
  );
}
