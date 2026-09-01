import { useEffect, useRef, useState } from 'react';

// Cámara en vivo con visor recortado a cuadrado: lo que el usuario ve en
// pantalla es exactamente lo que se va a capturar (mismo recorte que se
// usa después para generar la foto final).
export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('starting'); // starting | live | error | captured
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewBlob, setPreviewBlob] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus('live');
      } catch (err) {
        setError('No pudimos acceder a tu cámara. Revisa los permisos del navegador.');
        setStatus('error');
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function handleShutter() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    // Recorta exactamente el mismo cuadrado central que se ve en pantalla
    // (el <video> usa object-fit: cover dentro de un contenedor cuadrado).
    const side = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - side) / 2;
    const sy = (video.videoHeight - side) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = side;
    canvas.height = side;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, sx, sy, side, side, 0, 0, side, side);

    canvas.toBlob((blob) => {
      setPreviewBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      setStatus('captured');
      stopStream();
    }, 'image/jpeg', 0.92);
  }

  function handleRetake() {
    setPreviewUrl(null);
    setPreviewBlob(null);
    setStatus('starting');
    // Reinicia la cámara
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setStatus('live');
      })
      .catch(() => {
        setError('No pudimos reabrir tu cámara.');
        setStatus('error');
      });
  }

  function handleConfirm() {
    if (previewBlob) onCapture(previewBlob);
  }

  function handleClose() {
    stopStream();
    onClose();
  }

  return (
    <div className="camera-overlay">
      <div className="camera-overlay__header">
        <span>Instantánea</span>
        <button className="camera-overlay__close" onClick={handleClose} aria-label="Cerrar cámara">✕</button>
      </div>

      <div className="camera-frame">
        {status === 'error' && <p className="camera-frame__error">{error}</p>}

        {status !== 'captured' && (
          <video ref={videoRef} playsInline muted className="camera-frame__video" />
        )}

        {status === 'captured' && previewUrl && (
          <img src={previewUrl} alt="Vista previa de la instantánea" className="camera-frame__video" />
        )}
      </div>

      <div className="camera-overlay__controls">
        {status === 'live' && (
          <button className="camera-shutter" onClick={handleShutter} aria-label="Tomar foto" />
        )}
        {status === 'captured' && (
          <div className="btn-row">
            <button className="btn btn--outline" onClick={handleRetake}>Repetir</button>
            <button className="btn btn--primary" onClick={handleConfirm}>Usar esta foto</button>
          </div>
        )}
        {status === 'error' && (
          <button className="btn btn--outline" onClick={handleClose}>Cerrar</button>
        )}
      </div>
    </div>
  );
}
