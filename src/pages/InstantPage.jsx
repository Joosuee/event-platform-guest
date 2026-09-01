import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { invitationApi } from '../api/invitation.api';
import { eventApi } from '../api/event.api';
import { galleryApi } from '../api/interactivity.api';
import { useApi } from '../hooks/useApi';
import CameraCapture from '../components/CameraCapture';
import PresentationOverlay from '../components/PresentationOverlay';
import RotatingPhotoGrid from '../components/RotatingPhotoGrid';
import NavBar from '../components/NavBar';
import { BrowserRouter } from 'react-router-dom';

export default function InstantPage() {
  const { token } = useParams();
  const [invitation, setInvitation] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showPresent, setShowPresent] = useState(false);
  const [spotifyUrl, setSpotifyUrl] = useState('');


  useEffect(() => {
    invitationApi.getByToken(token).then(setInvitation).catch((err) => setLoadError(err.message));
  }, [token]);

  const eventId = invitation?.event_id;

  const { data: event } = useApi(
    () => (eventId ? eventApi.getById(eventId) : Promise.resolve(null)),
    [eventId]
  );

  const { data: photos, reload } = useApi(
    () => (eventId ? galleryApi.listApproved(eventId, 'instantanea') : Promise.resolve([])),
    [eventId]
  );

  useEffect(() => {
    if (!eventId) return undefined;
    const timer = setInterval(reload, 15000); // entran fotos nuevas solas
    return () => clearInterval(timer);
  }, [eventId, reload]);

  useEffect(() => {
    if (!eventId) return;
    eventApi.getCustomFields(eventId)
      .then((fields) => {
        const found = fields.find((f) => f.field_key === 'presentation_spotify_url');
        if (found) setSpotifyUrl(found.field_value);
      })
      .catch(() => { });
  }, [eventId]);

  async function handleCapture(blob) {
    setShowCamera(false);
    await galleryApi.upload(eventId, blob, {
      category: 'instantanea',
      invitation_token: token,
      uploaded_by_name: invitation?.representative_name,
    });
    reload();
  }

  function handleSaveSpotify(url) {
    setSpotifyUrl(url);
    if (eventId) eventApi.setCustomField(eventId, 'presentation_spotify_url', url).catch(() => { });
  }

  if (loadError) return <p className="text-muted" style={{ padding: 24 }}>No pudimos encontrar esta invitación.</p>;
  if (!invitation || !event) return <p className="text-muted" style={{ padding: 24 }}>Cargando…</p>;

  return (
    <div>

      <NavBar token={token}></NavBar>

      <div className="page" style={{ paddingBottom: 100, paddingTop: 32 }}>


        <p className="section-eyebrow">En vivo</p>
        <h2 className="section-title">Instantáneas</h2>

        <RotatingPhotoGrid photos={photos} pageSize={10} intervalMs={8000} />

        <div className="fab-row">
          <button className="fab fab--primary" onClick={() => setShowCamera(true)}>📷 Tomar instantánea</button>
          <button className="fab fab--outline" onClick={() => setShowPresent(true)}>▶ Presentar</button>
        </div>

        {showCamera && <CameraCapture onCapture={handleCapture} onClose={() => setShowCamera(false)} />}
        {showPresent && (
          <PresentationOverlay
            photos={photos || []}
            spotifyUrl={spotifyUrl}
            onSaveSpotifyUrl={handleSaveSpotify}
            onClose={() => setShowPresent(false)}
          />
        )}
      </div>
    </div>
  );
}