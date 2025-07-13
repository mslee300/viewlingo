"use client";
import { VapiWidget } from '@vapi-ai/client-sdk-react';

export default function VapiCallPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "0",
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      <button
        onClick={() => window.history.back()}
        style={{
          position: "absolute",
          top: 18,
          left: 18,
          background: "rgba(20,184,166,0.9)",
          color: "#fff",
          border: "none",
          borderRadius: 9999,
          padding: "10px 18px",
          fontSize: 16,
          fontWeight: 600,
          zIndex: 101,
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
        }}
        aria-label="Go back"
      >
        ← Back
      </button>
      <div
        style={{
          flex: 1,
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <VapiWidget
          mode="voice"
          theme="dark"
          baseColor="#000000"
          accentColor="#14B8A6"
          buttonBaseColor="#000000"
          buttonAccentColor="#ffffff"
          radius="large"
          size="full"
          position="bottom-right"
          mainLabel="TALK WITH AI"
          startButtonText="Start"
          endButtonText="End Call"
          requireConsent={true}
          localStorageKey="vapi_widget_consent"
          showTranscript={true}
          publicKey="4d5bf18f-1156-474e-86b7-0e50285bbaa1"
          assistantId="196e5078-aaaa-417e-b240-6c92a5051f5c"
        />
      </div>
    </div>
  );
} 