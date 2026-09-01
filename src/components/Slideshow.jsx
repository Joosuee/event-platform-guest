import { useEffect, useState } from 'react';

export default function Slideshow({ images, intervalMs = 6000, emptyMessage }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [images?.length]);

  useEffect(() => {
    if (!images || images.length < 2) return undefined;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [images, intervalMs]);

  if (!images || images.length === 0) {
    return (
      <div className="slideshow slideshow--empty">
        <p className="text-muted">{emptyMessage || 'Todavía no hay fotos aquí.'}</p>
      </div>
    );
  }

  return (
    <div className="slideshow">
      {images.map((img, i) => (
        <img
          key={img.key}
          src={img.url}
          alt={img.caption || ''}
          className={`slideshow__image${i === index ? ' slideshow__image--active' : ''}`}
        />
      ))}
      {images[index]?.caption && (
        <p className="slideshow__caption">{images[index].caption}</p>
      )}
      <div className="slideshow__dots">
        {images.map((img, i) => (
          <span key={img.key} className={`slideshow__dot${i === index ? ' slideshow__dot--active' : ''}`} />
        ))}
      </div>
    </div>
  );
}
