import { useApi } from '../hooks/useApi';
import { eventApi } from '../api/event.api';
import CountdownTimer from './CountdownTimer';

export default function HeroSection({ event, honorees }) {
  const names = (honorees || []).map((h) => h.full_name).join(' & ');
  const mainTitle = honorees?.[0]?.title;

  const { data: headerImages } = useApi(
    () => eventApi.getAssets(event.event_id, 'header'),
    [event.event_id]
  );
  const headerImage = headerImages?.[0]; // solo se usa la más reciente/única

  return (
    <section className="hero">
      <p className="hero__eyebrow">{event.event_type_name}</p>

      <h1 className="hero__title">{names || event.name}</h1>

      {mainTitle && <p className="hero__subtitle">"{mainTitle}"</p>}
      <p className="hero__date">
        {new Date(event.event_datetime.replace(' ', 'T')).toLocaleDateString('es-MX', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        })}
      </p>

      {headerImage && (
        <img
          src={headerImage.file_url}
          alt={headerImage.caption || event.name}
          style={{
            width: '100%', maxHeight: 400, objectFit: 'cover', maxWidth: 370,
            borderRadius: 'var(--radius-lg)', marginTop: 24, margin: '0 auto'
          }}
        />
      )}

      <CountdownTimer targetDate={event.event_datetime.replace(' ', 'T')} />

      {(event.hashtag || event.dress_code) && (
        <div className="chip-row" style={{ marginTop: 32 }}>
          {event.dress_code && <span className="chip">👗 {event.dress_code}</span>}
          {event.hashtag && <span className="chip">{event.hashtag}</span>}
        </div>
      )}
    </section>
  );
}