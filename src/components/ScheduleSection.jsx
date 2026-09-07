const STATUS_LABEL = { pending: 'Próximamente', in_progress: 'Sucediendo ahora', done: 'Terminado' };

export default function ScheduleSection({ schedule }) {
  if (!schedule || schedule.length === 0) return null;

  return (
    <section className="section">
      <p className="section-eyebrow">Programa</p>
      <h2 className="section-title">Cronograma</h2>

      <div className="section-stack">
        {schedule.map((item) => (
          <div className={`schedule-item schedule-item--${item.status}`} key={item.schedule_id}  style={{ alignItems: 'center', justifyContent:'space-around' }}>
            <span className="schedule-item__time">
              {item.scheduled_time
                ? new Date(item.scheduled_time.replace(' ', 'T')).toLocaleTimeString('es-MX', {
                  hour: '2-digit', minute: '2-digit',
                })
                : '—'}
            </span>
            <div>
              <p style={{ fontWeight: 600 }}>{item.title}</p>
              {item.description && <p className="text-sm text-muted">{item.description}</p>}
              {/* <p className="schedule-item__status">{STATUS_LABEL[item.status]}</p> */}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
