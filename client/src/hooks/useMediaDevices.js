import { useState, useEffect, useCallback } from 'react';
import { startCamera, stopCamera } from '../services/cameraCapture';
import { startAudioCapture, stopAudioCapture } from '../services/audioCapture';

export function useMediaDevices() {
  const [cameraStream, setCameraStream] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [micError, setMicError] = useState(null);

  const initCamera = useCallback(async (videoElement) => {
    try {
      const stream = await startCamera(videoElement);
      setCameraStream(stream);
      setHasCameraPermission(true);
      setCameraError(null);
    } catch (err) {
      setCameraError(err.message);
      setHasCameraPermission(false);
    }
  }, []);

  const closeCamera = useCallback(() => {
    stopCamera();
    setCameraStream(null);
  }, []);

  const initMic = useCallback(async (onAudioData) => {
    try {
      await startAudioCapture(onAudioData);
      setHasMicPermission(true);
      setMicError(null);
    } catch (err) {
      setMicError(err.message);
      setHasMicPermission(false);
    }
  }, []);

  const closeMic = useCallback(() => {
    stopAudioCapture();
  }, []);

  useEffect(() => {
    return () => {
      closeCamera();
      closeMic();
    };
  }, [closeCamera, closeMic]);

  return {
    cameraStream,
    hasCameraPermission,
    hasMicPermission,
    cameraError,
    micError,
    startCamera: initCamera,
    stopCamera: closeCamera,
    startMic: initMic,
    stopMic: closeMic
  };
}
