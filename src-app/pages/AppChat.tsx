import { useState, useEffect, useRef } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, doc, setDoc, getDocs, limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { ChatRoom, Message } from '../types';

interface Props {
  firebaseUser: FirebaseUser | null;
}

export default function AppChat({ firebaseUser }: Props) {
  const [rooms, setRooms]         = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [text, setText]           = useState('');
  const bottomRef                 = useRef<HTMLDivElement>(null);

  // Load chat rooms
  useEffect(() => {
    if (!firebaseUser) return;
    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', firebaseUser.uid),
      orderBy('lastMessageAt', 'desc'),
      limit(20)
    );
    const unsub = onSnapshot(q, snap => {
      setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatRoom)));
    });
    return () => unsub();
  }, [firebaseUser]);

  // Load messages for active room
  useEffect(() => {
    if (!activeRoom) return;
    const q = query(
      collection(db, 'chatRooms', activeRoom.id, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsub();
  }, [activeRoom]);

  const sendMessage = async () => {
    if (!firebaseUser || !activeRoom || !text.trim()) return;
    const msg = {
      senderId:   firebaseUser.uid,
      senderName: firebaseUser.displayName || 'User',
      content:    text.trim(),
      read:       false,
      createdAt:  new Date().toISOString(),
    };
    setText('');
    await addDoc(collection(db, 'chatRooms', activeRoom.id, 'messages'), msg);
    await setDoc(doc(db, 'chatRooms', activeRoom.id), {
      lastMessage: msg.content,
      lastMessageAt: msg.createdAt,
    }, { merge: true });
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h`;
  };

  if (!firebaseUser) {
    return (
      <div style={{ background: '#0A0A0F', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#555570', fontFamily: 'sans-serif' }}>Sign in to use messaging</p>
      </div>
    );
  }

  // â”€â”€â”€ Message View â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (activeRoom) {
    const otherId = activeRoom.participants.find(id => id !== firebaseUser.uid) || '';
    const otherName = activeRoom.participantNames?.[otherId] || 'User';

    return (
      <div style={{ background: '#0A0A0F', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Chat Header */}
        <div style={{
          background: '#111118', borderBottom: '1px solid #1A1A2E',
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <button
            onClick={() => setActiveRoom(null)}
            style={{ background: 'none', border: 'none', color: '#888', fontSize: 22, cursor: 'pointer', padding: 0 }}
          >â†</button>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg,#FF6B35,#F7931E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>
            {otherName.charAt(0)}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#F0F0F5', fontFamily: 'sans-serif' }}>{otherName}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#06D6A0', fontFamily: 'sans-serif' }}>â— Online</p>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>ðŸ‘‹</div>
              <p style={{ color: '#555570', fontFamily: 'sans-serif', fontSize: 13 }}>
                Start the conversation about a product or service!
              </p>
            </div>
          )}
          {messages.map(msg => {
            const isMine = msg.senderId === firebaseUser.uid;
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%', padding: '10px 14px', borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMine ? 'linear-gradient(135deg,#FF6B35,#F7931E)' : '#1A1A2E',
                  color: '#fff', fontFamily: 'sans-serif', fontSize: 14, lineHeight: 1.5,
                }}>
                  {msg.content}
                  <p style={{ margin: '4px 0 0', fontSize: 10, color: isMine ? 'rgba(255,255,255,0.7)' : '#555570', textAlign: 'right' }}>
                    {timeAgo(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          background: '#111118', borderTop: '1px solid #1A1A2E',
          padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-end',
        }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            style={{
              flex: 1, padding: '11px 14px', background: '#0A0A0F',
              border: '1px solid #1E1E2E', borderRadius: 12,
              color: '#F0F0F5', fontSize: 14, fontFamily: 'sans-serif', outline: 'none',
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#FF6B35,#F7931E)',
              border: 'none', cursor: 'pointer', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >âž¤</button>
        </div>
      </div>
    );
  }

  // â”€â”€â”€ Rooms List â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div style={{ background: '#0A0A0F', minHeight: '100vh' }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1A1A2E', padding: '14px 16px',
      }}>
        <h2 style={{
          margin: 0, fontSize: 20, fontWeight: 800,
          fontFamily: "'Syne', sans-serif",
          background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>ðŸ’¬ Messages</h2>
      </div>

      {rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>ðŸ’¬</div>
          <p style={{ color: '#F0F0F5', fontFamily: 'sans-serif', fontWeight: 700, marginBottom: 8 }}>No conversations yet</p>
          <p style={{ color: '#555570', fontFamily: 'sans-serif', fontSize: 13 }}>
            When you contact a seller or buyer about a product, the conversation will appear here.
          </p>
        </div>
      ) : (
        <div>
          {rooms.map(room => {
            const otherId = room.participants.find(id => id !== firebaseUser.uid) || '';
            const otherName = room.participantNames?.[otherId] || 'User';
            return (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', background: 'none', border: 'none',
                  borderBottom: '1px solid #1A1A2E', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,#FF6B35,#F7931E)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: '#fff', fontFamily: 'sans-serif', fontWeight: 700,
                }}>
                  {otherName.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#F0F0F5', fontFamily: 'sans-serif' }}>{otherName}</span>
                    <span style={{ fontSize: 11, color: '#555570', fontFamily: 'sans-serif' }}>{timeAgo(room.lastMessageAt)}</span>
                  </div>
                  <p style={{
                    margin: 0, fontSize: 13, color: '#888', fontFamily: 'sans-serif',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {room.lastMessage}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
