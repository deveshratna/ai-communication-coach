function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export class GeminiLiveConnection {
  constructor(token, config) {
    this.token = token;
    this.config = config; // { model, systemInstruction, onTranscript, onAudioResponse, onError, onClose, onSetupComplete }
    this.ws = null;
    this.isConnected = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${this.token}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        const setupMsg = {
          setup: {
            model: this.config.model || 'models/gemini-2.0-flash-live-001',
            generationConfig: {
              responseModalities: ['TEXT'], // Optional: ['TEXT', 'AUDIO'] if we wanted audio output
            },
            systemInstruction: {
              parts: [{ text: this.config.systemInstruction || 'You are an AI coach. Listen and observe.' }]
            }
          }
        };
        this.ws.send(JSON.stringify(setupMsg));
      };

      this.ws.onmessage = (event) => {
        if (event.data instanceof Blob) {
          this.handleBlob(event.data);
          return;
        }
        
        try {
          if (typeof event.data === 'string') {
            this.handleJson(JSON.parse(event.data));
          } else {
             const reader = new FileReader();
             reader.onload = () => {
                try {
                   this.handleJson(JSON.parse(reader.result));
                } catch(e) {
                   console.error('Failed to parse WS msg', e);
                }
             };
             reader.readAsText(event.data);
          }
        } catch (e) {}
      };

      this.ws.onerror = (e) => {
        console.error("Gemini Live Error:", e);
        if (this.config.onError) this.config.onError(e);
        reject(e);
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        if (this.config.onClose) this.config.onClose();
      };
      
      resolve();
    });
  }
  
  handleBlob(blob) {
    // Handle blob if necessary
  }

  handleJson(msg) {
    if (msg.setupComplete) {
       this.isConnected = true;
       if (this.config.onSetupComplete) this.config.onSetupComplete();
       return;
    }
    
    if (msg.serverContent) {
       if (msg.serverContent.modelTurn) {
          const parts = msg.serverContent.modelTurn.parts;
          if (parts && parts.length > 0) {
             const textPart = parts.find(p => p.text);
             if (textPart && this.config.onTranscript) {
                this.config.onTranscript({ speaker: 'coach', text: textPart.text });
             }
          }
       }
       if (msg.serverContent.interrupted) {
          // Model was interrupted
       }
    }
    
    if (msg.clientContent && msg.clientContent.turns) {
        // Echo of user transcript (sometimes comes via inputTranscript depending on model config)
    }
  }

  sendAudio(pcmData) {
    if (!this.isConnected || !this.ws) return;
    const base64Data = arrayBufferToBase64(pcmData);
    const msg = {
      realtimeInput: {
        mediaChunks: [{
          mimeType: 'audio/pcm;rate=16000',
          data: base64Data
        }]
      }
    };
    this.ws.send(JSON.stringify(msg));
  }

  sendImage(base64Jpeg) {
    if (!this.isConnected || !this.ws) return;
    const msg = {
      realtimeInput: {
        mediaChunks: [{
          mimeType: 'image/jpeg',
          data: base64Jpeg
        }]
      }
    };
    this.ws.send(JSON.stringify(msg));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}
