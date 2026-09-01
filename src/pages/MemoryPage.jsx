import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { invitationApi } from '../api/invitation.api';
import { eventApi } from '../api/event.api';
import { galleryApi } from '../api/interactivity.api';
import { useApi } from '../hooks/useApi';
import MemoryPhotoPicker from '../components/MemoryPhotoPicker';
import PresentationOverlay from '../components/PresentationOverlay';
import RotatingPhotoGrid from '../components/RotatingPhotoGrid';
import NavBar from '../components/NavBar';

export default function MemoryPage() {
    const { token } = useParams();
    const [invitation, setInvitation] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [showPicker, setShowPicker] = useState(false);
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
        () => (eventId ? galleryApi.listApproved(eventId, 'recuerdo') : Promise.resolve([])),
        [eventId]
    );

    useEffect(() => {
        if (!eventId) return undefined;
        const timer = setInterval(reload, 15000);
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

    async function handlePick(file) {
        setShowPicker(false);
        await galleryApi.upload(eventId, file, {
            category: 'recuerdo',
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
                <p className="section-eyebrow">De antes</p>
                <h2 className="section-title">Recuerdos</h2>

                <RotatingPhotoGrid photos={photos} pageSize={10} intervalMs={8000} />

                <div className="fab-row">
                    <button className="fab fab--primary" onClick={() => setShowPicker(true)}>🖼️ Elegir de mi galería</button>
                    <button className="fab fab--outline" onClick={() => setShowPresent(true)}>▶ Presentar</button>
                </div>

                {showPicker && <MemoryPhotoPicker onCapture={handlePick} onClose={() => setShowPicker(false)} />}
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