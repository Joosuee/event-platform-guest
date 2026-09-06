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
      <h2 className="section-title">Lluvia de sobres</h2>
      <p className="section-lead">Tu presencia es el mejor regalo.</p>

      {error && <div className="banner-error">{error}</div>}

      <div className="">
        {(gifts || []).map((g) => (
          <div className="list-row" key={g.gift_id}>
            <div>
              <img src={g.external_url} alt="sobre" style={{ borderRadius: '1200px' }} />
            </div>

          </div>
        ))}
      </div>

      {(gifts || []).some((g) => g.external_url) && (
        <p className="text-sm text-muted" style={{ marginTop: 12 }}>
          
        </p>
      )}
    </section>
  );
}
