import { useState } from 'react';
import { songsApi } from '../api/interactivity.api';
import { useApi } from '../hooks/useApi';

const VOTED_KEY = 'ep_voted_songs';

function getVotedIds() {
  try {
    return JSON.parse(localStorage.getItem(VOTED_KEY)) || [];
  } catch {
    return [];
  }
}

function rememberVote(id) {
  const voted = getVotedIds();
  localStorage.setItem(VOTED_KEY, JSON.stringify([...voted, id]));
}

export default function SongsSection({ eventId, token, guestName }) {
  const { data: songs, loading, reload } = useApi(() => songsApi.list(eventId), [eventId]);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [votedIds, setVotedIds] = useState(getVotedIds());

  async function handleSuggest(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setPending(true);
    setError(null);
    try {
      await songsApi.suggest(eventId, {
        invitation_token: token,
        requested_by_name: guestName,
        song_title: title.trim(),
        artist: artist.trim() || undefined,
      });
      setTitle('');
      setArtist('');
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  async function handleVote(requestId) {
    try {
      await songsApi.vote(requestId, token);
      rememberVote(requestId);
      setVotedIds(getVotedIds());
      reload();
    } catch (err) {
      // si el backend rechaza el voto duplicado, igual lo marcamos como votado localmente
      rememberVote(requestId);
      setVotedIds(getVotedIds());
      setError(err.message);
    }
  }

  return (
    <section className="section">
      <p className="section-eyebrow">Pista de baile</p>
      <h2 className="section-title">Recomienda una canción</h2>
      <p className="section-lead">Ayúdanos a armar el playlist perfecto para la fiesta.</p>

      <div className="card">
        {error && <div className="banner-error">{error}</div>}
        <form onSubmit={handleSuggest}>
          <div className="field">
            <label htmlFor="song-title">Título de la canción</label>
            <input id="song-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="song-artist">Artista (opcional)</label>
            <input id="song-artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
          </div>
          <button className="btn btn--primary btn--block" type="submit" disabled={pending}>
            {pending ? 'Enviando…' : 'Recomendar canción'}
          </button>
        </form>
      </div>

      {!loading && songs && songs.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          {songs.map((s) => {
            const alreadyVoted = votedIds.includes(s.request_id);
            return (
              <div className="list-row" key={s.request_id}>
                <div>
                  <p className="list-row__title">{s.song_title}</p>
                  {s.artist && <p className="list-row__subtitle">{s.artist}</p>}
                </div>
                <button
                  className="vote-btn"
                  disabled={alreadyVoted}
                  onClick={() => handleVote(s.request_id)}
                >
                  ▲ {s.votes_count}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
