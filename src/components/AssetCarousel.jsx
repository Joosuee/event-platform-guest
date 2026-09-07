import { useEffect, useState } from 'react';
import { eventApi } from '../api/event.api';
import { useSwipe } from '../hooks/useSwipe';

// ⚠️ Pon aquí los asset_id exactos que quieres mostrar (los ves en la
// respuesta de GET /events/:eventId/assets, o en la pestaña "Contenido del
// evento" del panel — cada tarjeta corresponde a un asset_id).
const FEATURED_ASSET_IDS = [43, 44, 45, 47];

export default function AssetCarousel({ eventId, intervalMs = 5000 }) {
  const [photos, setPhotos] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    eventApi.getAssets(eventId) // sin asset_type: trae de todos los tipos, filtramos abajo
      .then((assets) => {
        const ordered = FEATURED_ASSET_IDS
          .map((id) => assets.find((a) => a.asset_id === id))
          .filter(Boolean);
        setPhotos(ordered);
      })
      .catch(() => setPhotos([]));
  }, [eventId]);

  useEffect(() => {
    if (photos.length < 2) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % photos.length), intervalMs);
    return () => clearInterval(timer);
  }, [photos.length, intervalMs]);

  function goNext() {
    setIndex((i) => (i + 1) % photos.length);
  }
  function goPrev() {
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  }
  const swipeHandlers = useSwipe({ onSwipeLeft: goNext, onSwipeRight: goPrev });

  if (photos.length === 0) return null;

  return (
    <div className="asset-carousel">
      <div className="asset-carousel__viewport" {...swipeHandlers}>
        {photos.map((photo, i) => (
          <img
            key={photo.asset_id}
            src={photo.file_url}
            alt={photo.caption || ''}
            className={`asset-carousel__image${i === index ? ' asset-carousel__image--active' : ''}`}
            draggable={false}
          />
        ))}
      </div>
      {photos[index]?.caption && (
        <p className="asset-carousel__caption">{photos[index].caption}</p>
      )}
      {photos.length > 1 && (
        <div className="asset-carousel__dots">
          {photos.map((photo, i) => (
            <span
              key={photo.asset_id}
              className={`asset-carousel__dot${i === index ? ' asset-carousel__dot--active' : ''}`}
              aria-hidden="true"
            />
          ))}
        </div>
      )}
    </div>
  );
}