// Agrupa el role_code técnico (viene de role_catalog) en el título grande
// que se muestra en la tarjeta. Si aparece un rol que no está en la lista
// (ej. lo agregaste nuevo a mano en la base de datos), cae en "Especiales".
const ROLE_GROUP_LABEL = {
  padre: 'Padres',
  madre: 'Madre',
  padrino: 'Padrinos',
  madrina: 'Madrina',
  hermano: 'Hermano',
  hermana: 'Hermana',
};

function roleGroupLabel(roleCode) {
  return ROLE_GROUP_LABEL[roleCode] || 'Especiales';
}

// ⚠️ Mensaje de agradecimiento hardcodeado por persona (event_person_id).
// Lo ves en la respuesta de GET /events/:eventId/people, o en la pestaña
// "Personas" del panel de organizador. El que no tenga id en esta lista
// usa el mensaje genérico de abajo.
const THANK_YOU_MESSAGES = {
  7: 'Gracias por acompañarnos siempre y por tanto amor incondicional.',
  8: 'Por cada consejo y por creer en nosotros desde el primer día.',
  10: 'Gracias por ser cómplices de tantas aventuras.',
};

const DEFAULT_THANK_YOU = 'Gracias por ser parte de este día tan especial para nosotros.';

// Agrupa a las personas por su "rol grande" (Padrinos, Padres, Hermanos,
// Especiales...), respetando el orden en que van apareciendo.
function groupByRole(people) {
  const order = [];
  const groups = {};
  people.forEach((p) => {
    const label = roleGroupLabel(p.role_code);
    if (!groups[label]) {
      groups[label] = [];
      order.push(label);
    }
    groups[label].push(p);
  });
  return order.map((label) => ({ label, people: groups[label] }));
}

function ThanksCard({ label, people }) {
  const solo = people.length === 1;
  return (
    <div className={`thanks-card${solo ? ' thanks-card--solo' : ''}`}>
      <p className="thanks-card__role">{label}</p>
      <div className="thanks-card__people">
        {people.map((p) => (
          <div className="thanks-person" key={p.event_person_id}>
            <p className="thanks-person__name">{p.full_name}</p>
            <p className="thanks-person__message">
              {THANK_YOU_MESSAGES[p.event_person_id] || DEFAULT_THANK_YOU}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AboutSection({ honorees, people }) {
  const bios = (honorees || []).filter((h) => h.bio);
  const publicPeople = (people || []).filter((p) => p.display_public);
  const roleGroups = groupByRole(publicPeople);

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

      {roleGroups.length > 0 && (
        <div style={{ marginTop: bios.length > 0 ? 32 : 0 }}>
          {/* <p className="section-eyebrow">Con cariño de</p> */}
          <h2 className="section-title">Agradecimientos especiales</h2>

          <div className="thanks-stack">
            {roleGroups.map((group) => (
              <ThanksCard key={group.label} label={group.label} people={group.people} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}