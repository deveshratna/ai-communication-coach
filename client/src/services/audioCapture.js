let audioContext;
let mediaStream;
let source;
let workletNode;
let analyser;
let dataArray;

export async function startAudioCapture(onData) {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // 16kHz for Gemini
    audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 16000,
    });

    await audioContext.audioWorklet.addModule(URL.createObjectURL(new Blob([`
      class PCMProcessor extends AudioWorkletProcessor {
        process(inputs, outputs, parameters) {
          const input = inputs[0];
          if (input && input.length > 0) {
            const channelData = input[0];
            const pcm16 = new Int16Array(channelData.length);
            for (let i = 0; i < channelData.length; i++) {
              let s = Math.max(-1, Math.min(1, channelData[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            this.port.postMessage(pcm16);
          }
          return true;
        }
      }
      registerProcessor('pcm-processor', PCMProcessor);
    `], { type: 'application/javascript' })));

    source = audioContext.createMediaStreamSource(mediaStream);
    
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');
    workletNode.port.onmessage = (event) => {
      if (onData) onData(event.data);
    };

    source.connect(workletNode);
    workletNode.connect(audioContext.destination);

    return true;
  } catch (error) {
    console.error("Audio capture failed:", error);
    throw error;
  }
}

export function stopAudioCapture() {
  if (workletNode) workletNode.disconnect();
  if (source) source.disconnect();
  if (analyser) analyser.disconnect();
  
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
  }
  
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
  }

  workletNode = null;
  source = null;
  analyser = null;
  mediaStream = null;
  audioContext = null;
}

export function getAudioLevel() {
  if (!analyser || !dataArray) return 0;
  analyser.getByteFrequencyData(dataArray);
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i];
  }
  return sum / dataArray.length;
}
