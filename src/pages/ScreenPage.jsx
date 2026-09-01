import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { eventApi } from '../api/event.api';
import { galleryApi } from '../api/interactivity.api';
import Slideshow from '../components/Slideshow';

const SECTIONS = [
  { key: 'mural', label: 'Mural' },
  { key: 'instantaneas', label: 'Instantáneas en vivo' },
];

export default function ScreenPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [section, setSection] = useState('mural');
  const [muralImages, setMuralImages] = useState([]);
  const [instantImages, setInstantImages] = useState([]);

  useEffect(() => {
    eventApi.getBySlug(slug)
      .then(setEvent)
      .catch((err) => setError(err.message));
  }, [slug]);

  // Carga el mural (contenido curado por el organizador) una vez.
  useEffect(() => {
    if (!event) return;
    eventApi.getAssets(event.event_id, 'mural')
      .then((assets) => setMuralImages(assets.map((a) => ({ key: a.asset_id, url: a.file_url, caption: a.caption }))))
      .catch(() => {});
  }, [event]);

  // Sondea las instantáneas aprobadas cada 15s para que las fotos nuevas
  // entren solas a la proyección mientras dura la fiesta.
  useEffect(() => {
    if (!event) return undefined;

    function loadInstant() {
      galleryApi.listApproved(event.event_id, 'instantanea')
        .then((photos) => setInstantImages(
          photos.map((p) => ({ key: p.media_id, url: p.file_url, caption: p.uploaded_by_name }))
        ))
        .catch(() => {});
    }

    loadInstant();
    const timer = setInterval(loadInstant, 15000);
    return () => clearInterval(timer);
  }, [event]);

  // Alterna automáticamente entre Mural e Instantáneas cada 45s.
  useEffect(() => {
    const timer = setInterval(() => {
      setSection((s) => (s === 'mural' ? 'instantaneas' : 'mural'));
    }, 45000);
    return () => clearInterval(timer);
  }, []);

  if (error) {
    return (
      <div className="screen-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p>No pudimos encontrar este evento.</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="screen-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p>Cargando…</p>
      </div>
    );
  }

  const images = section === 'mural' ? muralImages : instantImages;
  const emptyMessage = section === 'mural'
    ? 'El organizador todavía no sube fotos al mural.'
    : 'Todavía no hay instantáneas aprobadas.';

  return (
    <div className="screen-page">
      <div className="screen-page__header">
        <div>
          <p className="screen-page__section-label">{event.name}</p>
          <h1 className="screen-page__title">
            {SECTIONS.find((s) => s.key === section)?.label}
          </h1>
        </div>
        <div className="screen-page__tabs">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              className={`screen-page__tab${section === s.key ? ' screen-page__tab--active' : ''}`}
              onClick={() => setSection(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="screen-page__body">
        <Slideshow images={images} emptyMessage={emptyMessage} />
      </div>
    </div>
  );
}
