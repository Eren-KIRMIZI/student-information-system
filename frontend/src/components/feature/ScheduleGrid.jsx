import { DAY_LABELS } from '../../utils/constants';

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#9333ea'];
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const HOURS = Array.from({ length: 10 }, (_, i) => `${i + 8}:00`);

const parseMin = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const pct = (t) => ((parseMin(t) - 480) / 600) * 100;

export const ScheduleGrid = ({ slots = [] }) => {
  const colorMap = {};
  let colorIdx = 0;
  slots.forEach((s) => {
    const id = s.courseSection?.id;
    if (id && !colorMap[id]) colorMap[id] = COLORS[colorIdx++ % COLORS.length];
  });

  return (
    <div className="card" style={{ overflow: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(${DAYS.length},1fr)`, minWidth: 600 }}>
        <div style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }} />
        {DAYS.map((d) => (
          <div
            key={d}
            style={{
              padding: '8px 12px',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: 13,
              borderBottom: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {DAY_LABELS[d]}
          </div>
        ))}

        <div style={{ position: 'relative', height: 600 }}>
          {HOURS.map((h) => (
            <div
              key={h}
              style={{
                position: 'absolute',
                top: `${pct(h)}%`,
                left: 0,
                right: 0,
                fontSize: 11,
                color: 'var(--color-text-muted)',
                padding: '0 8px',
                transform: 'translateY(-50%)',
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {DAYS.map((day) => (
          <div key={day} style={{ position: 'relative', height: 600, borderLeft: '1px solid var(--color-border)' }}>
            {HOURS.map((h) => (
              <div
                key={h}
                style={{
                  position: 'absolute',
                  top: `${pct(h)}%`,
                  left: 0,
                  right: 0,
                  borderTop: '1px dashed var(--color-border)',
                }}
              />
            ))}
            {slots
              .filter((s) => s.dayOfWeek === day)
              .map((s) => {
                const top = pct(s.startTime);
                const bot = pct(s.endTime);
                const color = colorMap[s.courseSection?.id] || '#2563eb';
                return (
                  <div
                    key={s.id}
                    style={{
                      position: 'absolute',
                      top: `${top}%`,
                      height: `${bot - top}%`,
                      left: 4,
                      right: 4,
                      background: color + '22',
                      border: `1.5px solid ${color}`,
                      borderRadius: 8,
                      padding: '6px 8px',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 11, color, lineHeight: 1.2 }}>
                      {s.courseSection?.course?.name ?? 'Ders'}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {s.startTime}–{s.endTime}
                      {s.classroom && ` · ${s.classroom}`}
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
};
