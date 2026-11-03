import { useState, useRef, useCallback, useEffect } from 'react';
import { CameraStatus } from '@/types/freshcheck';

export interface CameraHookReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  status: CameraStatus;
  errorMessage: string | null;
  activeDeviceId: string | null;
  availableDevices: MediaDeviceInfo[];
  facingMode: 'environment' | 'user';
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  switchCamera: () => Promise<void>;
  isStreaming: boolean;
}

export function useCamera(): CameraHookReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<CameraStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Enumerate cameras if supported
  const refreshDevices = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      return;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((device) => device.kind === 'videoinput');
      setAvailableDevices(videoInputs);
    } catch (e) {
      console.warn('Failed to enumerate media devices:', e);
    }
  }, []);

  // Stop all media tracks
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus('idle');
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    // 1. Check browser support and secure context
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setStatus('unsupported');
      setErrorMessage(
        'Kamera diblokir browser karena dibuka via HTTP biasa (bukan HTTPS). Browser HP (Chrome & Safari) mematikan izin kamera pada HTTP. Jalankan "npm run tunnel" di terminal PC lalu buka link HTTPS di HP.'
      );
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      setErrorMessage('Browser atau perangkat ini tidak mendukung API kamera.');
      return;
    }

    // Stop any existing tracks first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setStatus('requesting');
    setErrorMessage(null);

    // 2. Prepare constraints (mobile-optimized without rigid horizontal dimensions in portrait)
    const isMobile =
      typeof navigator !== 'undefined' &&
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const primaryConstraints: MediaStreamConstraints = {
      audio: false,
      video: activeDeviceId
        ? { deviceId: { exact: activeDeviceId } }
        : isMobile
        ? {
            facingMode: { ideal: facingMode },
          }
        : {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
    };

    let stream: MediaStream | null = null;

    try {
      // First attempt with preferred constraints
      stream = await navigator.mediaDevices.getUserMedia(primaryConstraints);
    } catch (primaryErr: unknown) {
      const error = primaryErr as Error & { name?: string };
      console.warn('Primary camera constraints failed:', error.name, error.message);

      // If user explicitly denied, do not retry
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setStatus('denied');
        setErrorMessage(
          'Izin kamera tidak diberikan atau diblokir browser. Untuk mengaktifkannya: klik ikon Gembok / Setelan Situs di samping URL browser -> ubah Kamera menjadi "Allow / Izinkan" -> lalu segarkan (refresh) halaman.'
        );
        return;
      }

      // Fallback: try basic video constraint
      try {
        console.log('Attempting basic { video: true } fallback...');
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch (fallbackErr: unknown) {
        const fError = fallbackErr as Error & { name?: string };
        console.error('Basic camera fallback also failed:', fError);

        if (fError.name === 'NotAllowedError' || fError.name === 'PermissionDeniedError') {
          setStatus('denied');
          setErrorMessage(
            'Izin kamera tidak diberikan atau diblokir browser. Untuk mengaktifkannya: klik ikon Gembok / Setelan Situs di samping URL browser -> ubah Kamera menjadi "Allow / Izinkan" -> lalu segarkan (refresh) halaman.'
          );
        } else if (fError.name === 'NotFoundError' || fError.name === 'DevicesNotFoundError') {
          setStatus('error');
          setErrorMessage('Tidak ada perangkat kamera / webcam yang terdeteksi.');
        } else if (fError.name === 'NotReadableError' || fError.name === 'TrackStartError') {
          setStatus('error');
          setErrorMessage('Kamera sedang digunakan oleh aplikasi lain atau tab browser lain.');
        } else {
          setStatus('error');
          setErrorMessage(fError.message || 'Gagal memulai kamera.');
        }
        return;
      }
    }

    // 3. Connect stream to video element
    if (stream) {
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('muted', 'true');

        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('video.play() deferred:', playErr);
        }
      }

      const activeTrack = stream.getVideoTracks()[0];
      if (activeTrack) {
        const settings = activeTrack.getSettings();
        if (settings.deviceId) {
          setActiveDeviceId(settings.deviceId);
        }
      }

      setStatus('active');
      await refreshDevices();
    }
  }, [activeDeviceId, facingMode, refreshDevices]);

  // Switch camera (cycle available devices or flip facing mode)
  const switchCamera = useCallback(async () => {
    if (availableDevices.length > 1) {
      const currentIndex = availableDevices.findIndex((d) => d.deviceId === activeDeviceId);
      const nextIndex = (currentIndex + 1) % availableDevices.length;
      const nextDevice = availableDevices[nextIndex];
      setActiveDeviceId(nextDevice.deviceId);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: nextDevice.deviceId } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.setAttribute('muted', 'true');
          await videoRef.current.play();
        }
        setStatus('active');
      } catch (e) {
        console.error('Failed to switch to device:', e);
      }
    } else {
      const nextMode = facingMode === 'environment' ? 'user' : 'environment';
      setFacingMode(nextMode);
      if (status === 'active') {
        stopCamera();
        setTimeout(() => {
          startCamera();
        }, 100);
      }
    }
  }, [availableDevices, activeDeviceId, facingMode, status, stopCamera, startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    status,
    errorMessage,
    activeDeviceId,
    availableDevices,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera,
    isStreaming: status === 'active',
  };
}
