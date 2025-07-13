"use client";
import { useEffect, useState } from "react";

export default function VapiCallPage() {
  const [widgetReady, setWidgetReady] = useState(false);

  useEffect(() => {
    if (!document.getElementById("vapi-widget-script")) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js";
      script.async = true;
      script.type = "text/javascript";
      script.id = "vapi-widget-script";
      script.onload = () => setWidgetReady(true);
      document.body.appendChild(script);
    } else {
      setWidgetReady(true);
    }
  }, []);

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
        {widgetReady && (
          <vapi-widget
            mode="voice"
            theme="dark"
            base-color="#000000"
            accent-color="#14B8A6"
            button-base-color="#000000"
            button-accent-color="#ffffff"
            radius="large"
            size="full"
            position="bottom-right"
            main-label="TALK WITH AI"
            start-button-text="Start"
            end-button-text="End Call"
            require-consent="true"
            local-storage-key="vapi_widget_consent"
            show-transcript="true"
            public-key="4d5bf18f-1156-474e-86b7-0e50285bbaa1"
            assistant-id="196e5078-aaaa-417e-b240-6c92a5051f5c"
          ></vapi-widget>
        )}
      </div>
    </div>
  );
} 