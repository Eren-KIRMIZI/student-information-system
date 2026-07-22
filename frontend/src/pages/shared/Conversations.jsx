import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConversations } from '../../api/messaging.api';
import { PageHeader, Skeleton, ErrorState, EmptyState } from '../../components/ui/index';
import { MessageSquare, Clock, User as UserIcon } from 'lucide-react';
import dayjs from 'dayjs';

const Conversations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(),
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Mesajlar" subtitle="Tüm sohbetleriniz" />
        <div className="card">
          <Skeleton height={400} />
        </div>
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={refetch} />;

  const conversations = data?.data || [];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Mesajlar" subtitle="Tüm sohbetleriniz" />

      {!conversations.length ? (
        <div className="card">
          <EmptyState icon={MessageSquare} title="Henüz bir sohbetiniz yok" />
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {conversations.map((c) => {
              const otherParticipant = c.participants.find((p) => p.userId !== user.id);
              const otherUser = otherParticipant?.user;
              const name = otherUser?.student
                ? `${otherUser.student.firstName} ${otherUser.student.lastName}`
                : otherUser?.lecturer
                  ? `${otherUser.lecturer.firstName} ${otherUser.lecturer.lastName}`
                  : otherUser?.email;

              const lastMsg = c.messages?.[0];
              const isUnread = lastMsg && !lastMsg.isRead && lastMsg.senderId !== user.id;

              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/chat/${c.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: 20,
                    borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    background: isUnread ? 'rgba(0, 102, 255, 0.05)' : 'transparent',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-secondary)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = isUnread ? 'rgba(0, 102, 255, 0.05)' : 'transparent')
                  }
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <UserIcon size={24} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontWeight: isUnread ? 700 : 600, fontSize: 15 }}>{name}</span>
                      <span
                        style={{
                          fontSize: 12,
                          color: 'var(--color-text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Clock size={12} /> {c.lastMessageAt ? dayjs(c.lastMessageAt).format('DD.MM.YYYY HH:mm') : ''}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: isUnread ? 'var(--color-text)' : 'var(--color-text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: isUnread ? 500 : 400,
                      }}
                    >
                      {lastMsg
                        ? lastMsg.senderId === user.id
                          ? `Siz: ${lastMsg.content}`
                          : lastMsg.content
                        : 'Henüz mesaj yok'}
                    </div>
                  </div>

                  {isUnread && (
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Conversations;
