import { useState, useEffect, useCallback, useRef } from 'react';
import { GeminiLiveConnection } from '../services/geminiLive';

export function useGeminiLive(token, mode) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const connectionRef = useRef(null);
  
  // Handlers
  const onTranscript = useRef(null);

  const connect = useCallback(async (handlers) => {
    if (!token) return;
    
    setIsConnecting(true);
    setError(null);
    
    onTranscript.current = handlers?.onTranscript;

    const sysInstruction = `You are a communication coach in a live practice session (Mode: ${mode}). Listen to the user speaking. Do NOT interrupt unless they explicitly ask for help or get completely stuck. Your primary job is to listen and observe. When you do respond, be brief and direct. After the user finishes speaking, you may ask a follow-up question or provide a brief observation. Keep your responses SHORT during live sessions — the deep analysis comes after.`;

    const conn = new GeminiLiveConnection(token, {
      model: 'models/gemini-2.0-flash-exp', // using exp as it supports live API
      systemInstruction: sysInstruction,
      onSetupComplete: () => {
        setIsConnected(true);
        setIsConnecting(false);
      },
      onTranscript: (entry) => {
        if (onTranscript.current) onTranscript.current(entry);
      },
      onError: (err) => {
        setError(err);
        setIsConnecting(false);
      },
      onClose: () => {
        setIsConnected(false);
      }
    });

    connectionRef.current = conn;
    try {
      await conn.connect();
    } catch (e) {
      console.error(e);
    }
  }, [token, mode]);

  const disconnect = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.disconnect();
      connectionRef.current = null;
    }
  }, []);

  const sendAudio = useCallback((pcmData) => {
    if (connectionRef.current && isConnected) {
      connectionRef.current.sendAudio(pcmData);
    }
  }, [isConnected]);

  const sendImage = useCallback((base64Jpeg) => {
    if (connectionRef.current && isConnected) {
      connectionRef.current.sendImage(base64Jpeg);
    }
  }, [isConnected]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    sendAudio,
    sendImage
  };
}
