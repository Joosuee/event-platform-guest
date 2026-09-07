import { useEffect, useRef, useState } from 'react';
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
  const [outgoing, setOutgoing] = useState(null); // tarjetas que se están desvaneciendo
  const outgoingTimer = useRef(null);

  const visible = (messages || []).filter((m) => ['approved', 'shown'].includes(m.display_status));
  const pageCount = Math.ceil(visible.length / PAGE_SIZE);
  const currentMessages = visible.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  // Si llegan mensajes nuevos y la página actual ya no existe, regresa a la primera.
  useEffect(() => {
    if (page >= pageCount) setPage(0);
  }, [pageCount, page]);

  // Cambia de página guardando primero lo que se veía, para poder
  // desvanecerlo en vez de que desaparezca de golpe.
  function changePage(nextPage) {
    setOutgoing(currentMessages);
    clearTimeout(outgoingTimer.current);
    outgoingTimer.current = setTimeout(() => setOutgoing(null), 1000); // debe coincidir con la duración del CSS
    setPage(nextPage);
  }

  useEffect(() => () => clearTimeout(outgoingTimer.current), []); // limpieza al desmontar

  // Cambia de tanda sola cada AUTO_ADVANCE_MS. Al incluir "page" en las
  // dependencias, cualquier cambio (automático o por swipe) reinicia el
  // conteo desde cero en vez de sumarse al tiempo que ya había corrido.
  useEffect(() => {
    if (pageCount < 2) return undefined;
    const timer = setInterval(() => {
      changePage((page + 1) % pageCount);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCount, page]);

  function goNext() {
    if (pageCount < 2) return;
    changePage((page + 1) % pageCount);
  }
  function goPrev() {
    if (pageCount < 2) return;
    changePage((page - 1 + pageCount) % pageCount);
  }
  const swipeHandlers = useSwipe({ onSwipeLeft: goNext, onSwipeRight: goPrev });

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

      {!loading && (currentMessages.length > 0 || outgoing) && (
        <div className="thanks-wall">
          <div className="thanks-wall__viewport" {...swipeHandlers}>
            {outgoing && (
              <div className="thanks-wall__page thanks-wall__page--out">
                {outgoing.map((m) => (
                  <div className="card" key={m.message_id}>
                    <p style={{ fontStyle: 'italic' }}>"{m.message_text}"</p>
                    <p className="text-sm text-muted" style={{ marginTop: 6 }}>— {m.author_name || 'Anónimo'}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="thanks-wall__page thanks-wall__page--in" key={page}>
              {currentMessages.map((m) => (
                <div className="card" key={m.message_id}>
                  <p style={{ fontStyle: 'italic' }}>"{m.message_text}"</p>
                  <p className="text-sm text-muted" style={{ marginTop: 6 }}>— {m.author_name || 'Anónimo'}</p>
                </div>
              ))}
            </div>
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