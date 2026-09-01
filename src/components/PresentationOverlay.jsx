import { useEffect, useState } from 'react';
import SpotifyPlayer from './SpotifyPlayer';

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PresentationOverlay({ photos, spotifyUrl, onSaveSpotifyUrl, onClose, intervalMs = 5000 }) {
  const [queue, setQueue] = useState(() => shuffle(photos));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setQueue(shuffle(photos));
    setIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos.length]);

  useEffect(() => {
    if (queue.length < 2) return undefined;
    const timer = setInterval(() => {
      setIndex((i) => {
        const next = i + 1;
        if (next >= queue.length) {
          setQueue(shuffle(photos)); // ya se mostraron todas: re-baraja y sigue sin cortar
          return 0;
        }
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [queue.length, intervalMs, photos]);

  const current = queue[index];

  return (
    <div className="present-overlay">
      <button className="camera-overlay__close present-overlay__close" onClick={onClose} aria-label="Cerrar presentación">✕</button>

      {current ? (
        <>
          <img src={current.file_url} alt={current.caption || ''} className="present-overlay__image" />
          {current.caption && <p className="present-overlay__caption">{current.caption}</p>}
        </>
      ) : (
        <p className="text-muted" style={{ color: '#fff' }}>Todavía no hay fotos para presentar.</p>
      )}

      <div className="present-overlay__footer">
        <SpotifyPlayer initialUrl={spotifyUrl} onSave={onSaveSpotifyUrl} />
      </div>
    </div>
  );
}