// Convierte un link normal de Spotify (canción, álbum o playlist) en la URL
// de embed oficial que se puede insertar en un iframe sin necesitar su API
// ni que el invitado inicie sesión.
export function toSpotifyEmbedUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('spotify.com')) return null;
    const match = parsed.pathname.match(/\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    const [, type, id] = match;
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`;
  } catch {
    return null;
  }
}