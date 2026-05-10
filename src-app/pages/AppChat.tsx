import { useState, useEffect, useRef } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, doc, setDoc, getDocs, limit, getDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { ChatRoom, Message, User } from '../types';

// Same XOR decrypt as AppHome — must stay in sync
function deriveKey(roomId: string): number[] {
  const key: number[] = [];
  for (let i = 0; i < 32; i++) key.push(roomId.charCodeAt(i % roomId.length) ^ (i * 7 + 13));
  return key;
}
function decryptMessage(cipher: string, roomId: string): string {
  try {
    const key = deriveKey(roomId);
    const bytes = Uint8Array.from(atob(cipher), c => c.charCodeAt(0));
    const dec = bytes.map((b, i) => b ^ key[i % key.length]);
    return new TextDecoder().decode(dec);
  } catch { return "[encrypted]"; }
}
function displayContent(msg: Message, roomId: string): string {
  return (msg as any).encrypted ? decryptMessage(msg.content, roomId) : msg.content;
}

interface Props {
  firebaseUser: FirebaseUser | null;
}

const G = {
  gold:    '#C9973A',
  goldL:   '#E8BB6A',
  white:   '#FFFFFF',
  bg:      '#F0EBE0',
  border:  '#E2D9C8',
  text:    '#1A1209',
  muted:   '#7A6A52',
  inputBg: '#FAF7F2',
};

export default function AppChat({ firebaseUser }: Props) {
  const [view, setView]             = useState<'rooms' | 'chat' | 'users'>('rooms');
  const [rooms, setRooms]           = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages]     = useState<Message[]>([]);
  const [text, setText]             = useState('');
  const [sending, setSending]       = useState(false);
  const [appUsers, setAppUsers]     = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load chat rooms
  useEffect(() => {
    if (!firebaseUser) return;
    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', firebaseUser.uid),
      orderBy('lastMessageAt', 'desc'),
      limit(30)
    );
    return onSnapshot(q, snap => {
      setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatRoom)));
    }, err => console.error('rooms error:', err));
  }, [firebaseUser]);

  // Load messages for active room
  useEffect(() => {
    if (!activeRoom) return;
    const q = query(
      collection(db, 'chatRooms', activeRoom.id, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );
    return onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }, err => console.error('messages error:', err));
  }, [activeRoom]);

  const loadUsers = async () => {
    if (!firebaseUser) return;
    setUsersLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), limit(50)));
      const all = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as User))
        .filter(u => u.id !== firebaseUser.uid);
      setAppUsers(all);
    } catch (e) { console.error(e); }
    finally { setUsersLoading(false); }
  };

  const openChatWith = async (user: User) => {
    if (!firebaseUser) return;
    const ids = [firebaseUser.uid, user.id].sort();
    const roomId = ids.join('_');
    const roomData = {
      id: roomId,
      participants: ids,
      participantNames: {
        [firebaseUser.uid]: firebaseUser.displayName || 'You',
        [user.id]: user.displayName,
      },
      participantPhotos: {
        [firebaseUser.uid]: firebaseUser.photoURL || '',
        [user.id]: user.photoURL || '',
      },
      lastMessage: '',
      lastMessageAt: new Date().toISOString(),
    };

    // Always open chat immediately — don't wait on Firestore
    setActiveRoom(roomData as ChatRoom);
    setView('chat');

    // Create room in background (ignore errors — rules may block but chat still opens)
    try {
      const roomRef = doc(db, 'chatRooms', roomId);
      const existing = await getDoc(roomRef);
      if (!existing.exists()) {
        await setDoc(roomRef, {
          participants: ids,
          participantNames: roomData.participantNames,
          participantPhotos: roomData.participantPhotos,
          lastMessage: '',
          lastMessageAt: roomData.lastMessageAt,
        });
      } else {
        setActiveRoom({ id: roomId, ...existing.data() } as ChatRoom);
      }
    } catch (e) {
      console.error('openChatWith Firestore error (chat still open):', e);
    }
  };

  // FIX: use string timestamp (not serverTimestamp) so it works immediately
  const sendMessage = async () => {
    if (!firebaseUser || !activeRoom || !text.trim() || sending) return;
    const content = text.trim();
    setText('');
    setSending(true);
    try {
      const now = new Date().toISOString();
      const isEncrypted = (activeRoom as any).encrypted === true;
      const key = deriveKey(activeRoom.id);
      const encryptedContent = isEncrypted
        ? btoa(String.fromCharCode(...new TextEncoder().encode(content).map((b, i) => b ^ key[i % key.length])))
        : content;
      const msg = {
        roomId:     activeRoom.id,
        senderId:   firebaseUser.uid,
        senderName: firebaseUser.displayName || 'User',
        content:    encryptedContent,
        encrypted:  isEncrypted,
        read:       false,
        createdAt:  now,
      };
      await addDoc(collection(db, 'chatRooms', activeRoom.id, 'messages'), msg);
      await setDoc(doc(db, 'chatRooms', activeRoom.id), {
        lastMessage:   content,
        lastMessageAt: now,
        participants:  activeRoom.participants,
        participantNames: activeRoom.participantNames,
      }, { merge: true });
    } catch (e) {
      console.error('send error:', e);
      setText(content); // restore text on failure
    } finally {
      setSending(false);
    }
  };

  const timeAgo = (ts: string) => {
    if (!ts) return '';
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  if (!firebaseUser) {
    return (
      <div style={{ background: G.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: G.muted }}>Sign in to use messaging</p>
      </div>
    );
  }

  // ── Chat view ────────────────────────────────────────────────────────────────
  if (view === 'chat' && activeRoom) {
    const otherId   = activeRoom.participants.find(id => id !== firebaseUser.uid) || '';
    const otherName = activeRoom.participantNames?.[otherId] || 'User';
    const otherPhoto= (activeRoom.participantPhotos as any)?.[otherId] || '';

    return (
      <div style={{ background: G.bg, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          background: G.white, borderBottom: `1px solid ${G.border}`,
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        }}>
          <button onClick={() => { setView('rooms'); setActiveRoom(null); setMessages([]); }}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: G.gold, padding: 0 }}>←</button>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, overflow: 'hidden',
          }}>
            {otherPhoto
              ? <img src={otherPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : otherName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: G.text }}>
              {otherName} {(activeRoom as any).encrypted ? '🔒' : ''}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: '#16A34A' }}>● Online</p>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 60 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>👋</div>
              <p style={{ color: G.muted, fontSize: 13 }}>Say hello to {otherName}!</p>
            </div>
          )}
          {messages.map(msg => {
            const isMine = msg.senderId === firebaseUser.uid;
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%', padding: '10px 14px',
                  borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMine ? `linear-gradient(135deg, ${G.gold}, ${G.goldL})` : G.white,
                  color: isMine ? '#fff' : G.text,
                  fontSize: 14, lineHeight: 1.5,
                  border: isMine ? 'none' : `1px solid ${G.border}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}>
                  {displayContent(msg, activeRoom.id)}
                  <p style={{
                    margin: '4px 0 0', fontSize: 10,
                    color: isMine ? 'rgba(255,255,255,0.75)' : G.muted,
                    textAlign: 'right',
                  }}>{timeAgo(msg.createdAt)}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div style={{
          background: G.white, borderTop: `1px solid ${G.border}`,
          padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center',
        }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type a message..."
            style={{
              flex: 1, padding: '11px 14px',
              background: G.inputBg, border: `1.5px solid ${G.border}`,
              borderRadius: 12, color: G.text, fontSize: 14, outline: 'none',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = G.gold; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,151,58,0.12)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.boxShadow = 'none'; }}
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
              border: 'none', cursor: 'pointer', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 12px rgba(201,151,58,0.4)',
              opacity: (!text.trim() || sending) ? 0.5 : 1,
            }}>
            {sending ? '…' : '➤'}
          </button>
        </div>
      </div>
    );
  }

  // ── People list (new chat) ──────────────────────────────────────────────────
  if (view === 'users') {
    return (
      <div style={{ background: G.bg, minHeight: '100vh' }}>
        <div style={{
          background: G.white, borderBottom: `1px solid ${G.border}`,
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
          position: 'sticky', top: 0, zIndex: 50,
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        }}>
          <button onClick={() => setView('rooms')}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: G.gold, padding: 0 }}>←</button>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, margin: 0,
            background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>New Message</h2>
        </div>

        <div style={{ padding: '12px 16px' }}>
          {usersLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: G.muted }}>Loading people…</div>
          ) : appUsers.length === 0 ? (
            <div style={{ background: G.white, borderRadius: 16, padding: '40px 24px', textAlign: 'center', border: `1px solid ${G.border}` }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>👥</div>
              <p style={{ color: G.text, fontWeight: 700, marginBottom: 6 }}>No other users yet</p>
              <p style={{ color: G.muted, fontSize: 13 }}>As others join, they will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {appUsers.map(user => (
                <button key={user.id} onClick={() => openChatWith(user)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 14px', background: G.white, border: `1px solid ${G.border}`,
                    borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, overflow: 'hidden', color: '#fff', fontWeight: 700,
                  }}>
                    {user.photoURL
                      ? <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : user.displayName?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: G.text }}>{user.displayName}</span>
                      {user.verified && <span style={{ color: G.gold, fontSize: 13 }}>✓</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{
                        fontSize: 10, padding: '1px 7px', borderRadius: 10,
                        background: user.role === 'seller' ? 'rgba(201,151,58,0.1)' : 'rgba(13,148,136,0.1)',
                        color: user.role === 'seller' ? G.gold : '#0D9488',
                        fontWeight: 700,
                      }}>
                        {user.role === 'seller' ? '🏪 Seller' : '🛒 Buyer'}
                      </span>
                      {user.location && (
                        <span style={{ fontSize: 11, color: G.muted }}>📍 {user.location}</span>
                      )}
                    </div>
                  </div>
                  <span style={{ color: G.gold, fontSize: 20 }}>›</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Rooms list ──────────────────────────────────────────────────────────────
  return (
    <div style={{ background: G.bg, minHeight: '100vh' }}>
      <div style={{
        background: G.white, borderBottom: `1px solid ${G.border}`,
        padding: '14px 16px', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, margin: 0,
            background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Messages</h2>
          <button
            onClick={() => { setView('users'); loadUsers(); }}
            style={{
              background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
              border: 'none', borderRadius: 20, padding: '7px 16px',
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(201,151,58,0.35)',
            }}>
            ✉️ New Chat
          </button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>💬</div>
          <p style={{ color: G.text, fontWeight: 700, marginBottom: 8, fontSize: 16 }}>No conversations yet</p>
          <p style={{ color: G.muted, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
            Start a conversation with any user in the community.
          </p>
          <button
            onClick={() => { setView('users'); loadUsers(); }}
            style={{
              background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
              border: 'none', borderRadius: 12, padding: '13px 28px',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(201,151,58,0.4)',
            }}>
            👥 Browse People
          </button>
        </div>
      ) : (
        <div style={{ paddingTop: 8 }}>
          {rooms.map(room => {
            const otherId   = room.participants.find(id => id !== firebaseUser.uid) || '';
            const otherName = room.participantNames?.[otherId] || 'User';
            const otherPhoto= (room.participantPhotos as any)?.[otherId] || '';
            return (
              <button key={room.id}
                onClick={() => { setActiveRoom(room); setView('chat'); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px', background: G.white, border: 'none',
                  borderBottom: `1px solid ${G.border}`, cursor: 'pointer', textAlign: 'left',
                }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: '#fff', fontWeight: 700, overflow: 'hidden',
                }}>
                  {otherPhoto
                    ? <img src={otherPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : otherName.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: G.text }}>{otherName}</span>
                    <span style={{ fontSize: 11, color: G.muted }}>{timeAgo(room.lastMessageAt)}</span>
                  </div>
                  <p style={{
                    margin: 0, fontSize: 13, color: G.muted,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {room.lastMessage || 'Tap to start chatting'}
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