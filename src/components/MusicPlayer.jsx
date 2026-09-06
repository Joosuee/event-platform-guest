import { useEffect, useRef, useState } from 'react';

// ⚠️ Reemplaza esto con la URL real de tu canción (un archivo .mp3 que tengas
// derecho a usar). Puedes subirlo a Cloudinary como recurso "video" (así se
// suben los audios) o alojarlo donde quieras, siempre que sea una URL directa.
const SONG_URL = 'https://res.cloudinary.com/dlu7i4umd/video/upload/v1788655799/mi-mundo-gira-contigo_BpEP3JQA_v2g5ls.mp3';

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    // Intenta arrancar sola al cargar (funciona en algunos navegadores de
    // escritorio; en la mayoría de móviles el navegador la bloquea).
    audio.play().then(() => setPlaying(true)).catch(() => setBlocked(true));

    // Si se bloqueó, la arrancamos en cuanto haya el PRIMER toque/click en
    // cualquier parte de la pantalla (incluye el toque que abre el sobre).
    function tryStartOnFirstInteraction() {
      audio.play().then(() => {
        setPlaying(true);
        setBlocked(false);
        removeListeners();
      }).catch(() => {});
    }

    function removeListeners() {
      window.removeEventListener('pointerdown', tryStartOnFirstInteraction);
      window.removeEventListener('keydown', tryStartOnFirstInteraction);
    }

    window.addEventListener('pointerdown', tryStartOnFirstInteraction, { once: true });
    window.addEventListener('keydown', tryStartOnFirstInteraction, { once: true });

    return removeListeners;
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  return (
    <>
      <audio ref={audioRef} src={SONG_URL} loop preload="auto" />
      <button
        className={`music-toggle${playing ? ' music-toggle--playing' : ''}`}
        onClick={toggle}
        aria-label={playing ? 'Silenciar música' : 'Reproducir música'}
        title={blocked && !playing ? 'Toca para reproducir la canción' : undefined}
      >
        {playing ? '♪' : '♪̸'}
      </button>
    </>
  );
}