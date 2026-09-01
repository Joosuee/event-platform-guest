import { useState } from 'react';
import { toSpotifyEmbedUrl } from '../utils/spotifyEmbed';

export default function SpotifyPlayer({ initialUrl, onSave }) {
  const [url, setUrl] = useState(initialUrl || '');
  const [savedUrl, setSavedUrl] = useState(initialUrl || '');

  const embedUrl = toSpotifyEmbedUrl(savedUrl);

  function handleUse(e) {
    e.preventDefault();
    setSavedUrl(url);
    onSave?.(url);
  }

  return (
    <div className="spotify-player">
      {!embedUrl ? (
        <form onSubmit={handleUse} className="spotify-player__form">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Pega un link de Spotify (canción, álbum o playlist)"
          />
          <button className="btn btn--outline btn--sm" type="submit">Usar</button>
        </form>
      ) : (
        <>
          <iframe
            title="Spotify"
            src={embedUrl}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; encrypted-media; clipboard-write; fullscreen; picture-in-picture"
            loading="lazy"
          />
          <button className="btn btn--ghost btn--sm" onClick={() => setSavedUrl('')} style={{ marginTop: 6 }}>
            Cambiar canción
          </button>
        </>
      )}
    </div>
  );
}