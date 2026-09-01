import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { invitationApi } from '../api/invitation.api';
import { eventApi } from '../api/event.api';
import { useApi } from '../hooks/useApi';
import GallerySection from '../components/GallerySection';

export default function Presentation() {
  const { token } = useParams();
  const [invitation, setInvitation] = useState(null);
  const [opened, setOpened] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    invitationApi.getByToken(token)
      .then((inv) => {
        setInvitation(inv);
        if (['abierta', 'confirmada', 'rechazada'].includes(inv.status)) setOpened(true);
      })
      .catch((err) => setLoadError(err.message));
  }, [token]);

  const { data: event } = useApi(
    () => (invitation ? eventApi.getById(invitation.event_id) : Promise.resolve(null)),
    [invitation?.event_id]
  );

  async function handleOpenEnvelope() {
    const updated = await invitationApi.open(token);
    setInvitation(updated);
    setOpened(true);
  }

  if (loadError) {
    return <p className="text-muted" style={{ padding: 24 }}>No pudimos encontrar esta invitación.</p>;
  }

  if (!invitation || !event) {
    return <p className="text-muted" style={{ padding: 24 }}>Cargando…</p>;
  }

  return (
    <div>
      <GallerySection
        eventId={event.event_id}
        token={token}
        guestName={invitation.representative_name}
      />
    </div>
  );
}