import { useApi } from '../hooks/useApi';
import { eventApi } from '../api/event.api';

export default function LocationsSection({ locations }) {
  const eventId = locations?.[0]?.event_id;
  const { data: images } = useApi(
    () => (eventId ? eventApi.getAssets(eventId, 'location') : Promise.resolve([])),
    [eventId]
  );

  if (!locations || locations.length === 0) return null;

  function imageFor(locationId) {
    const list = images || [];
    return (
      list.find((img) => img.location_id === locationId) ||
      list.find((img) => !img.location_id)
    );
  }

  return (
    <section className="section">
      <p className="section-eyebrow">Cómo llegar</p>
      <h2 className="section-title">Ubicación{locations.length > 1 ? 'es' : ''}</h2>

      <div className="section-stack">
        {locations.map((loc) => {
          const image = imageFor(loc.location_id);
          return (
            <div className="card location-card" key={loc.location_id}>
              <div style={{ flex: 1 }}>
                {image && (
                  <img
                    src={image.file_url}
                    alt={image.caption || loc.name}
                    style={{
                      width: '100%', height: 180, objectFit: 'cover',
                      borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                      marginBottom: 12,
                    }}
                  />
                )}

                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 22 }}></span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700 }}>{loc.name}</p>
                    {loc.address && <p className="text-sm text-muted">{loc.address}</p>}
                    {loc.location_datetime && (
                      <p className="text-sm text-muted">
                        {new Date(loc.location_datetime.replace(' ', 'T')).toLocaleString('es-MX', {
                          dateStyle: 'medium', timeStyle: 'short',
                        })}
                      </p>
                    )}
                    {loc.notes && <p className="text-sm text-muted">{loc.notes}</p>}
                    {loc.maps_url && (
                      <a
                        className="btn btn--outline"
                        style={{ marginTop: 10, padding: '8px 16px', fontSize: 13, fontStyle: 'normal', textDecoration: 'none'}}
                        href={loc.maps_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver en mapa
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
