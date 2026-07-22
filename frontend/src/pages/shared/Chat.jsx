import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConversationMessages, sendMessage, markAsRead } from '../../api/messaging.api';
import { PageHeader, Skeleton, ErrorState } from '../../components/ui/index';
import { ArrowLeft, Send } from 'lucide-react';
import dayjs from 'dayjs';
import io from 'socket.io-client';

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const scrollRef = useRef(null);

  const [content, setContent] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => getConversationMessages(id),
  });

  const sendMutation = useMutation({
    mutationFn: (msg) => sendMessage(id, msg),
    onSuccess: () => {
      setContent('');
      qc.invalidateQueries({ queryKey: ['messages', id] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: () => markAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations'] }),
  });

  useEffect(() => {
    // Socket connection to listen for messages
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const socket = io('http://localhost:5000', { auth: { token } });

    socket.on('message:new', (msg) => {
      if (msg.conversationId === id) {
        qc.setQueryData(['messages', id], (old) => {
          if (!old) return old;
          return { ...old, data: [...old.data, msg] };
        });
        markReadMutation.mutate();
      } else {
        qc.invalidateQueries({ queryKey: ['conversations'] });
      }
    });

    return () => socket.disconnect();
  }, [id, qc]);

  useEffect(() => {
    if (data?.data?.length) {
      // mark as read initially
      markReadMutation.mutate();
      // scroll to bottom
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [data?.data?.length]);

  if (isLoading)
    return (
      <div className="animate-fade-in">
        <Skeleton height={500} />
      </div>
    );
  if (isError) return <ErrorState onRetry={refetch} />;

  const messages = data?.data || [];

  return (
    <div
      className="animate-fade-in"
      style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}
    >
      <PageHeader
        title="Sohbet"
        action={
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Geri
          </button>
        }
      />

      <div
        className="card"
        style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div
          ref={scrollRef}
          style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          {!messages.length && (
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: 40 }}>
              Mesaj geçmişi bulunmuyor. İlk mesajı gönderin!
            </div>
          )}

          {messages.map((m) => {
            const isMe = m.senderId === user.id;
            return (
              <div key={m.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                <div
                  style={{
                    background: isMe ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                    color: isMe ? '#fff' : 'var(--color-text)',
                    padding: '12px 16px',
                    borderRadius: 16,
                    borderBottomRightRadius: isMe ? 4 : 16,
                    borderBottomLeftRadius: isMe ? 16 : 4,
                    fontSize: 14,
                    lineHeight: 1.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  {m.content}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--color-text-muted)',
                    marginTop: 4,
                    textAlign: isMe ? 'right' : 'left',
                  }}
                >
                  {dayjs(m.createdAt).format('HH:mm')}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: 16, borderTop: '1px solid var(--color-border)', display: 'flex', gap: 12 }}>
          <input
            type="text"
            className="input"
            style={{ margin: 0, flex: 1 }}
            placeholder="Mesajınızı yazın..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && content.trim() && sendMutation.mutate(content)}
          />
          <button
            className="btn btn-primary"
            disabled={!content.trim() || sendMutation.isPending}
            onClick={() => sendMutation.mutate(content)}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
