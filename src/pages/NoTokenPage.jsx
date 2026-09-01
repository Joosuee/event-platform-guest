export default function NoTokenPage() {
  return (
    <div className="envelope-screen">
      <p className="section-eyebrow">Event Platform</p>
      <h2>Este es el link de la vista del invitado</h2>
      <p className="text-muted" style={{ marginTop: 12, maxWidth: 360 }}>
        Cada invitación tiene su propio link único, como <code>/invite/&#123;token&#125;</code>.
        Pide al organizador que te comparta el tuyo.
      </p>
    </div>
  );
}
