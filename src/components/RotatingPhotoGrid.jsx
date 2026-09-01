import { useEffect, useState } from 'react';

export default function RotatingPhotoGrid({ photos, pageSize = 10, intervalMs = 8000 }) {
  const [page, setPage] = useState(0);
  const totalPages = photos && photos.length > 0 ? Math.ceil(photos.length / pageSize) : 0;

  useEffect(() => { setPage(0); }, [photos?.length]);

  useEffect(() => {
    if (totalPages < 2) return undefined;
    const timer = setInterval(() => setPage((p) => (p + 1) % totalPages), intervalMs);
    return () => clearInterval(timer);
  }, [totalPages, intervalMs]);

  if (!photos || photos.length === 0) return null;

  const visible = photos.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div>
      <div className="gallery-grid">
        {visible.map((p) => (
          <img key={p.media_id} src={p.file_url} alt={p.caption || ''} loading="lazy" />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="slideshow__dots" style={{ position: 'static', marginTop: 12 }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <span key={i} className={`slideshow__dot${i === page ? ' slideshow__dot--active' : ''}`} />
          ))}
        </div>
      )}
    </div>
  );
}