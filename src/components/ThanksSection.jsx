import { useState } from 'react';
import { thanksApi } from '../api/interactivity.api';
import { useApi } from '../hooks/useApi';

export default function ThanksSection({ eventId, token, guestName }) {
  const { data: messages, loading, reload } = useApi(() => thanksApi.list(eventId), [eventId]);
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const visible = (messages || []).filter((m) => ['approved', 'shown'].includes(m.display_status));

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

      {!loading && visible.length > 0 && (
        <div className="section-stack" style={{ marginTop: 16 }}>
          {visible.map((m) => (
            <div className="card" key={m.message_id}>
              <p style={{ fontStyle: 'italic' }}>"{m.message_text}"</p>
              <p className="text-sm text-muted" style={{ marginTop: 6 }}>— {m.author_name || 'Anónimo'}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
