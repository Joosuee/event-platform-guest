export default function AboutSection({ honorees, people }) {
  const bios = (honorees || []).filter((h) => h.bio);
  const publicPeople = (people || []).filter((p) => p.display_public);

  if (bios.length === 0 && publicPeople.length === 0) return null;

  return (
    <section className="section">
      {bios.length > 0 && (
        <>
          <p className="section-eyebrow">Un poco más</p>
          <h2 className="section-title">Sobre {bios.length > 1 ? 'nosotros' : 'mí'}</h2>
          <div className="section-stack">
            {bios.map((h) => (
              <div className="card" key={h.honoree_id}>
                <p style={{ fontWeight: 700 }}>{h.full_name}</p>
                <p className="text-sm text-muted" style={{ marginTop: 6 }}>{h.bio}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {publicPeople.length > 0 && (
        <div style={{ marginTop: bios.length > 0 ? 32 : 0 }}>
          <p className="section-eyebrow">Con cariño de</p>
          <h2 className="section-title">Agradecimientos especiales:</h2>
          <div className="chip-row">
            {publicPeople.map((p) => (
              <span className="chip" key={p.event_person_id}> {p.full_name}: { p.role_name}</span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
