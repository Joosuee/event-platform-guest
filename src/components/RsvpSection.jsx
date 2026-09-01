import { useEffect, useState } from 'react';
import { invitationApi } from '../api/invitation.api';

export default function RsvpSection({ invitation, onInvitationChange, token }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function respond(accept) {
    setPending(true);
    setError(null);
    try {
      const updated = await invitationApi.respond(token, accept);
      onInvitationChange(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  if (invitation.status === 'rechazada') {
    return (
      <section className="section">
        <p className="section-eyebrow">Confirmación</p>
        <h2 className="section-title">Gracias por avisarnos</h2>
        <p className="section-lead">Lamentamos que no puedas acompañarnos. ¡Te vamos a extrañar!</p>
        <div className="btn-row">
          <button className="btn btn--outline" onClick={() => respond(true)} disabled={pending}>
            En realidad sí puedo asistir
          </button>
        </div>
      </section>
    );
  }

  if (invitation.status !== 'confirmada') {
    return (
      <section className="section">
        <p className="section-eyebrow">Confirmación</p>
        <h2 className="section-title">¿Nos acompañas?</h2>
        <p className="section-lead">
          Tienes {invitation.total_slots} {invitation.total_slots === 1 ? 'lugar' : 'lugares'} reservados. Cuéntanos si podrás asistir.
        </p>
        {error && <div className="banner-error">{error}</div>}
        <div className="btn-row">
          <button className="btn btn--primary" onClick={() => respond(true)} disabled={pending}>
            Sí, ahí estaré
          </button>
          <button className="btn btn--outline" onClick={() => respond(false)} disabled={pending}>
            No podré asistir
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <p className="section-eyebrow">Confirmación</p>
      <h2 className="section-title">¡Nos vemos ahí! 🎉</h2>
      <GuestManager token={token} totalSlots={invitation.total_slots} />
    </section>
  );
}

function GuestManager({ token, totalSlots }) {
  const [guests, setGuests] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const result = await invitationApi.listGuests(token);
      setGuests(result.guests);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function addGuest(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setPending(true);
    setError(null);
    try {
      await invitationApi.addGuest(token, name.trim());
      setName('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  const used = guests?.length || 0;
  const percentage = totalSlots ? Math.min(100, (used / totalSlots) * 100) : 0;

  return (
    <div className="card">
      <p className="text-sm text-muted" style={{ marginBottom: 4 }}>
        {used} de {totalSlots} lugares confirmados
      </p>
      <div className="slots-meter">
        <div className="slots-meter__fill" style={{ width: `${percentage}%` }} />
      </div>

      {error && <div className="banner-error">{error}</div>}

      {!loading && guests && guests.length > 0 && (
        <ul className="guest-list">
          {guests.map((g) => (
            <li key={g.guest_id}>
              <span className='inv_section'>{g.full_name}</span>
              {g.is_child && <span className="text-sm text-muted">niño/a</span>}
            </li>
          ))}
        </ul>
      )}

      {used < totalSlots ? (
        <form onSubmit={addGuest} style={{ display: 'grid', gap: 8, marginTop: 12}}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de quien asistirá"
            style={{ flex: 1, border: '1px solid var(--color-border)', borderRadius: 10, padding: '10px 15px' }}
          />
          <button className="btn btn--primary" type="submit" disabled={pending}>
            Agregar
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted" style={{ marginTop: 12 }}>
          Ya completaste todos tus lugares. ✓
        </p>
      )}
    </div>
  );
}
