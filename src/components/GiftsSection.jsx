import { useState } from 'react';
import { giftsApi } from '../api/interactivity.api';
import { useApi } from '../hooks/useApi';

export default function GiftsSection({ eventId, token }) {
  const { data: gifts, loading, reload } = useApi(() => giftsApi.list(eventId), [eventId]);
  const [error, setError] = useState(null);
  const [reservingId, setReservingId] = useState(null);

  if (!loading && (!gifts || gifts.length === 0)) return null;

  async function handleReserve(giftId) {
    setReservingId(giftId);
    setError(null);
    try {
      await giftsApi.reserve(giftId, token);
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setReservingId(null);
    }
  }

  return (
    <section className="section">
      <p className="section-eyebrow">Un detalle</p>
      <h2 className="section-title">Mesa de regalos</h2>
      <p className="section-lead">Tu presencia es el mejor regalo, pero si quieres consentir, aquí unas ideas.</p>

      {error && <div className="banner-error">{error}</div>}

      <div className="card">
        {(gifts || []).map((g) => (
          <div className="list-row" key={g.gift_id}>
            <div>
              <p className="list-row__title">{g.title}</p>
              {g.description && <p className="list-row__subtitle">{g.description}</p>}
              {g.price && <p className="list-row__subtitle">${g.price}</p>}
            </div>
            {g.status === 'available' ? (
              <button
                className="btn btn--outline"
                style={{ padding: '8px 16px', fontSize: 13 }}
                disabled={reservingId === g.gift_id}
                onClick={() => handleReserve(g.gift_id)}
              >
                {reservingId === g.gift_id ? 'Reservando…' : 'Reservar'}
              </button>
            ) : (
              <span className={`gift-status gift-status--${g.status}`}>
                {g.status === 'reserved' ? 'Reservado' : 'Comprado'}
              </span>
            )}
          </div>
        ))}
      </div>

      {(gifts || []).some((g) => g.external_url) && (
        <p className="text-sm text-muted" style={{ marginTop: 12 }}>
          Algunos regalos tienen link directo a tienda dentro de su descripción.
        </p>
      )}
    </section>
  );
}
