import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { invitationApi } from '../api/invitation.api';
import { eventApi } from '../api/event.api';
import { useApi } from '../hooks/useApi';
import { applyEventTheme } from '../utils/applyTheme';

import Envelope from '../components/Envelope';
import HeroSection from '../components/HeroSection';
import RsvpSection from '../components/RsvpSection';
import LocationsSection from '../components/LocationsSection';
import ScheduleSection from '../components/ScheduleSection';
import DressCodeSection from '../components/DressCodeSection';
import AboutSection from '../components/AboutSection';
import InvitationCardGenerator from '../components/InvitationCardGenerator';
import SongsSection from '../components/SongsSection';
import AssetCarousel from '../components/AssetCarousel';
import MusicPlayer from '../components/MusicPlayer';
import GiftsSection from '../components/GiftsSection';
import ThanksSection from '../components/ThanksSection';
import GallerySection from '../components/GallerySection';
import DressReferenceNotice from '../components/DressReferenceNotice';
import NavBar from '../components/NavBar';

export default function InvitePage() {
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
  const { data: honorees } = useApi(
    () => (invitation ? eventApi.getHonorees(invitation.event_id) : Promise.resolve(null)),
    [invitation?.event_id]
  );
  const { data: people } = useApi(
    () => (invitation ? eventApi.getPeople(invitation.event_id) : Promise.resolve(null)),
    [invitation?.event_id]
  );
  const { data: locations } = useApi(
    () => (invitation ? eventApi.getLocations(invitation.event_id) : Promise.resolve(null)),
    [invitation?.event_id]
  );
  const { data: schedule } = useApi(
    () => (invitation ? eventApi.getSchedule(invitation.event_id) : Promise.resolve(null)),
    [invitation?.event_id]
  );

  useEffect(() => {
    if (event?.theme_json) applyEventTheme(event.theme_json);
  }, [event]);

  async function handleOpenEnvelope() {
    const updated = await invitationApi.open(token);
    setInvitation(updated);
    setOpened(true);
  }

  if (loadError) {
    return (
      <div className="envelope-screen">
        <h2>No pudimos encontrar esta invitación</h2>
        <p className="text-muted" style={{ marginTop: 12 }}>
          Verifica que el link esté completo, o contacta a quien te lo compartió.
        </p>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="envelope-screen">
        <p className="text-muted">Cargando invitación…</p>
      </div>
    );
  }

  if (!opened) {
    return (
      <Envelope
        representativeName={invitation.representative_name}
        cupos={invitation.total_slots}
        onOpen={handleOpenEnvelope}
      />
    );
  }

  if (!event) {
    return (
      <div className="envelope-screen">
        <p className="text-muted">Cargando invitación…</p>
      </div>
    );
  }

  return (
    <main>
      <div className="page">

        <NavBar token={token}></NavBar>

        <HeroSection event={event} honorees={honorees} />

        <div className="divider">✦</div>


        <AboutSection honorees={honorees} people={people} token={token} />

        <AssetCarousel eventId={event.event_id} />

        <LocationsSection locations={locations} />
        <ScheduleSection schedule={schedule} />
        <DressCodeSection event={event} />

        {/* <GallerySection
          eventId={event.event_id}
          token={token}
          guestName={invitation.representative_name}
        /> */}

        {/* <SongsSection
          eventId={event.event_id}
          token={token}
          guestName={invitation.representative_name}
        /> */}

        <MusicPlayer />

        <GiftsSection eventId={event.event_id} token={token} />

        <ThanksSection
          eventId={event.event_id}
          token={token}
          guestName={invitation.representative_name}
        />

        <DressReferenceNotice eventId={event.event_id} />

        <RsvpSection
          invitation={invitation}
          onInvitationChange={setInvitation}
          token={token}
        />

        <InvitationCardGenerator
          event={event}
          locations={locations}
          invitation={invitation}
          honorees={honorees}
        />

        <footer className="page-footer">
          {event.hashtag && <p className="hashtag">{event.hashtag}</p>}
          <p style={{ marginTop: 8 }}>Con cariño te esperamos ✦</p>
        </footer>
        <section>
          <a style={{ textDecoration: none }} className="btn btn--primary" href="https://wa.me/2311005914</section>">Diseña tu invitación aqui</a>
        </section>
      </div>
    </main>
  );
}
