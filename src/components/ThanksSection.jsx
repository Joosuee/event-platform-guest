import { useEffect, useState } from 'react';
import { thanksApi } from '../api/interactivity.api';
import { useApi } from '../hooks/useApi';
import { useSwipe } from '../hooks/useSwipe';

const PAGE_SIZE = 3;
const AUTO_ADVANCE_MS = 8000;

export default function ThanksSection({ eventId, token, guestName }) {
  const { data: messages, loading, reload } = useApi(() => thanksApi.list(eventId), [eventId]);
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [page, setPage] = useState(0);

  const visible = (messages || []).filter((m) => ['approved', 'shown'].includes(m.display_status));
  const pageCount = Math.ceil(visible.length / PAGE_SIZE);

  // Si llegan mensajes nuevos y la página actual ya no existe, regresa a la primera.
  useEffect(() => {
    if (page >= pageCount) setPage(0);
  }, [pageCount, page]);

  // Cambia de tanda sola cada AUTO_ADVANCE_MS, sin cortar si el usuario ya
  // está interactuando (se reinicia solo al cambiar de página).
  useEffect(() => {
    if (pageCount < 2) return undefined;
    const timer = setInterval(() => {
      setPage((p) => (p + 1) % pageCount);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [pageCount]);

  function goNext() {
    if (pageCount < 2) return;
    setPage((p) => (p + 1) % pageCount);
  }
  function goPrev() {
    if (pageCount < 2) return;
    setPage((p) => (p - 1 + pageCount) % pageCount);
  }
  const swipeHandlers = useSwipe({ onSwipeLeft: goNext, onSwipeRight: goPrev });

  const currentMessages = visible.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setPending(true);
    setError(null);
    setSuccess(false);
    try {
      await thanksApi.create(eventId, {
        invitation_token: token,
        author_name: guestName,
        message_text: text.trim(),
      });
      setText('');
      setSuccess(true);
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="section">
      <p className="section-eyebrow">Un mensaje</p>
      <h2 className="section-title">Muro de agradecimientos</h2>

      <div className="card">
        {error && <div className="banner-error">{error}</div>}
        {success && <div className="banner-success">¡Gracias por tu mensaje! 💌</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="thanks-text">Deja unas palabras</label>
            <textarea
              id="thanks-text"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="¡Felicidades! Que este día sea inolvidable..."
              required
            />
          </div>
          <button className="btn btn--primary btn--block" type="submit" disabled={pending}>
            {pending ? 'Enviando…' : 'Enviar mensaje'}
          </button>
        </form>
      </div>

      {!loading && currentMessages.length > 0 && (
        <div className="thanks-wall">
          <div className="thanks-wall__viewport" {...swipeHandlers}>
            {currentMessages.map((m) => (
              <div className="card" key={m.message_id}>
                <p style={{ fontStyle: 'italic' }}>"{m.message_text}"</p>
                <p className="text-sm text-muted" style={{ marginTop: 6 }}>— {m.author_name || 'Anónimo'}</p>
              </div>
            ))}
          </div>

          {pageCount > 1 && (
            <div className="asset-carousel__dots">
              {Array.from({ length: pageCount }).map((_, i) => (
                <span
                  key={i}
                  className={`asset-carousel__dot${i === page ? ' asset-carousel__dot--active' : ''}`}
                  aria-hidden="true"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}