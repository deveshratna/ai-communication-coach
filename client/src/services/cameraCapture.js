let stream = null;
let canvas = null;
let ctx = null;

export async function startCamera(videoElement) {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { width: { ideal: 640 }, height: { ideal: 480 } } 
    });
    
    if (videoElement) {
      videoElement.srcObject = stream;
      await videoElement.play();
    }
    return stream;
  } catch (error) {
    console.error("Camera access failed:", error);
    throw error;
  }
}

export function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
}

export function captureFrame(videoElement, quality = 0.8) {
  if (!videoElement || !videoElement.videoWidth) return null;
  
  if (!canvas) {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
  }

  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
  const base64Data = canvas.toDataURL('image/jpeg', quality);
  return base64Data.split(',')[1]; // Return just the base64 part
}
