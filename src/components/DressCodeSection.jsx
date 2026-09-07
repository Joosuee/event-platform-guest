import { useApi } from '../hooks/useApi';
import { eventApi } from '../api/event.api';

export default function DressCodeSection({ event }) {
  const { data: looks, loading } = useApi(
    () => eventApi.getAssets(event.event_id, 'dress_code'),
    [event.event_id]
  );

  const hasTitle = Boolean(event.dress_code);
  const hasLooks = !loading && looks && looks.length > 0;

  if (!hasTitle && !hasLooks) return null;

  return (
    <section className="section">
      <p className="section-eyebrow">Cómo ir vestido/a</p>
      <h2 className="section-title">Código de vestimenta</h2>
      {hasTitle && <p className="section-lead">{event.dress_code}</p>}

      {hasLooks && (
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 16 }}>
          {looks.map((look) => (
            <div key={look.asset_id}>
              <img
                src={look.file_url}
                alt={look.caption || 'Referencia de vestimenta'}
                style={{
                  width: '100%',
                  height: 150,
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)'
                }}
              />
              {look.caption && (
                <p className="text-sm text-muted" style={{ marginTop: 6, textAlign: 'center' }}>{look.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="section-eyebrow">(Preferentemete formal)</p>
    </section>
  );
}
