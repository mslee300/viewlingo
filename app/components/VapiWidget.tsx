import React, { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

interface VapiWidgetProps {
  publicKey: string;
  assistantId: string;
  config?: Record<string, unknown>;
}

const VapiWidget: React.FC<VapiWidgetProps> = ({ 
  publicKey, 
  assistantId, 
  config = {} 
}) => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<Array<{role: string, text: string}>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const vapiInstance = new Vapi(publicKey);
    setVapi(vapiInstance);
    // Event listeners
    vapiInstance.on('call-start', () => {
      setIsConnected(true);
      setError(null);
    });
    vapiInstance.on('call-end', () => {
      setIsConnected(false);
      setIsSpeaking(false);
    });
    vapiInstance.on('speech-start', () => {
      setIsSpeaking(true);
    });
    vapiInstance.on('speech-end', () => {
      setIsSpeaking(false);
    });
    vapiInstance.on('message', (message) => {
      if (message.type === 'transcript') {
        setTranscript(prev => [...prev, {
          role: message.role,
          text: message.transcript
        }]);
      }
    });
    vapiInstance.on('error', (error) => {
      setError(error?.message || 'An error occurred with the voice assistant.');
      console.error('Vapi error:', error);
    });
    return () => {
      vapiInstance?.stop();
    };
  }, [publicKey]);

  const startCall = () => {
    if (vapi) {
      setError(null);
      vapi.start(assistantId);
    }
  };
  const endCall = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  // FAB button style for mobile
  const fabButtonStyle: React.CSSProperties = {
    background: '#12A594',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: 64,
    height: 64,
    minWidth: 64,
    minHeight: 64,
    boxShadow: '0 4px 16px rgba(18, 165, 148, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    cursor: 'pointer',
    outline: 'none',
    position: 'fixed',
    bottom: 'max(env(safe-area-inset-bottom, 20px), 20px)',
    right: 'max(env(safe-area-inset-right, 20px), 20px)',
    zIndex: 1001,
    transition: 'box-shadow 0.2s',
    touchAction: 'manipulation',
  };

  // Card style for mobile
  const cardStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 100,
    right: 0,
    left: 0,
    margin: '0 auto',
    width: '95vw',
    maxWidth: 420,
    background: '#fff',
    borderRadius: 18,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    border: '1px solid #e1e5e9',
    zIndex: 1002,
    padding: '20px 12px 12px 12px',
    fontFamily: 'Arial, sans-serif',
    pointerEvents: 'auto',
    minWidth: 0,
    minHeight: 120,
    maxHeight: '60vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  // Desktop button style
  const desktopButtonStyle: React.CSSProperties = {
    background: '#12A594',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    padding: '18px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(18, 165, 148, 0.3)',
    transition: 'all 0.3s ease',
    width: '100%',
    minHeight: 56,
    outline: 'none',
    touchAction: 'manipulation',
    maxWidth: 320,
    margin: '0 auto',
    display: 'block',
  };

  // Responsive: use FAB on mobile, desktop button otherwise
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

  return (
    <>
      {/* FAB button for mobile, desktop button for desktop */}
      {!isConnected && (
        <button
          onClick={startCall}
          style={isMobile ? fabButtonStyle : desktopButtonStyle}
          aria-label="Talk to Assistant"
        >
          <span role="img" aria-label="microphone">🎤</span>
        </button>
      )}
      {/* Card for active call (mobile and desktop) */}
      {isConnected && (
        <div style={isMobile ? cardStyle : {
          ...cardStyle,
          position: 'fixed',
          bottom: 40,
          right: 40,
          left: 'auto',
          width: 360,
          maxWidth: '90vw',
        }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              gap: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: isSpeaking ? '#ff4444' : '#12A594',
                  animation: isSpeaking ? 'pulse 1s infinite' : 'none',
                  flexShrink: 0,
                }}
              ></div>
              <span style={{ fontWeight: 'bold', color: '#333', fontSize: 16 }}>
                {isSpeaking ? 'Assistant Speaking...' : 'Listening...'}
              </span>
            </div>
            <button
              onClick={endCall}
              style={{
                background: '#ff4444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '16px',
                cursor: 'pointer',
                minHeight: 44,
                fontWeight: 500,
                outline: 'none',
                touchAction: 'manipulation',
              }}
              aria-label="End Call"
            >
              End Call
            </button>
          </div>
          <div
            style={{
              maxHeight: '30vh',
              overflowY: 'auto',
              marginBottom: '8px',
              padding: '8px',
              background: '#f8f9fa',
              borderRadius: '8px',
              fontSize: 16,
              minHeight: 48,
            }}
          >
            {transcript.length === 0 ? (
              <p style={{ color: '#666', fontSize: '15px', margin: 0 }}>
                Conversation will appear here...
              </p>
            ) : (
              transcript.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: '8px',
                    textAlign: msg.role === 'user' ? 'right' : 'left',
                    wordBreak: 'break-word',
                  }}
                >
                  <span style={{
                    background: msg.role === 'user' ? '#12A594' : '#333',
                    color: '#fff',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    display: 'inline-block',
                    fontSize: '15px',
                    maxWidth: '90%',
                    wordBreak: 'break-word',
                  }}>
                    {msg.text}
                  </span>
                </div>
              ))
            )}
            {error && (
              <div style={{ color: '#ff4444', fontSize: 15, marginTop: 8, textAlign: 'center' }}>{error}</div>
            )}
          </div>
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        @media (max-width: 600px) {
          /* Hide desktop button on mobile */
          .desktop-vapi-btn { display: none !important; }
        }
        @media (min-width: 601px) {
          /* Hide FAB on desktop */
          .fab-vapi-btn { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default VapiWidget; 