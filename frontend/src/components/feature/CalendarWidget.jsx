import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { CardSkeleton, EmptyState, ErrorState } from '../ui';

export const CalendarWidget = ({ events = [], isLoading, isError, onRetry }) => {
  const [activeTab, setActiveTab] = useState('today');

  // Mock events if empty
  const defaultEvents = [
    { title: 'Yapay Zeka Vize Sınavı', time: '10:00 - 12:00', type: 'sınav', day: 'today' },
    { title: 'Ders Kayıtları Bitişi', time: '23:59', type: 'kayıt dönemi', day: 'today' },
    { title: 'Danışman Onayı Son Gün', time: '17:00', type: 'danışman onayı', day: 'tomorrow' },
    { title: 'Bahar Şenlikleri', time: 'Tüm Gün', type: 'tatil', day: 'week' },
  ];

  const displayEvents = events.length > 0 ? events : defaultEvents;
  const filteredEvents = displayEvents.filter(e => e.day === activeTab);

  const getEventColor = (type) => {
    switch(type) {
      case 'sınav': return '#ef4444'; // red
      case 'kayıt dönemi': return '#3b82f6'; // blue
      case 'danışman onayı': return '#f59e0b'; // amber
      case 'tatil': return '#10b981'; // green
      default: return '#6b7280'; // gray
    }
  };

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16, fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <CalendarIcon size={18} color="var(--color-text-muted)" />
        Takvim
      </div>

      {isLoading ? (
        <CardSkeleton count={3} />
      ) : isError ? (
        <ErrorState message="Takvim yüklenemedi." onRetry={onRetry} />
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
            {['today', 'tomorrow', 'week', 'month'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 600,
                  background: activeTab === tab ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === tab ? '#fff' : 'var(--color-text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab === 'today' ? 'Bugün' : tab === 'tomorrow' ? 'Yarın' : tab === 'week' ? 'Bu Hafta' : 'Bu Ay'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', alignItems: 'center', gap: 12, 
                  padding: '12px', borderRadius: 8, 
                  background: 'var(--color-background)',
                  borderLeft: `4px solid ${getEventColor(event.type)}`
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: 'var(--color-text)' }}>{event.title}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--color-text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12}/> {event.time}</span>
                      <span style={{ textTransform: 'capitalize' }}>• {event.type}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="Etkinlik Yok" description="Planlanan etkinlik yok." icon={CalendarIcon} />
            )}
          </div>
        </>
      )}
    </div>
  );
};
