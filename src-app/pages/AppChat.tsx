// FILE: src-app/pages/AppChat.tsx
import { useState, useEffect, useRef } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, doc, setDoc, getDocs, limit, getDoc, serverTimestamp,
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { ChatRoom, Message, User } from '../types';

// -- Encryption helpers -------------------------------------------------------
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
  } catch { return '[encrypted]'; }
}
function displayContent(msg: Message, roomId: string): string {
  return (msg as any).encrypted ? decryptMessage(msg.content, roomId) : msg.content;
}

// -- Pick best supported audio MIME type for this device ----------------------
function getBestAudioMime(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
  ];
  for (const mime of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
      console.log('[Chat] selected audio MIME:', mime);
      return mime;
    }
  }
  console.warn('[Chat] no preferred MIME supported, using default');
  return '';
}

// -- Presence helpers ---------------------------------------------------------
async function setOnline(uid: string) {
  await setDoc(doc(db, 'presence', uid), { online: true, lastSeen: serverTimestamp() }, { merge: true });
}
async function setOffline(uid: string) {
  await setDoc(doc(db, 'presence', uid), { online: false, lastSeen: serverTimestamp() }, { merge: true });
}

interface Props { firebaseUser: FirebaseUser | null; }

const G = {
  gold:    '#C9973A',
  goldL:   '#E8BB6A',
  white:   '#FFFFFF',
  bg:      '#F0EBE0',
  border:  '#E2D9C8',
  text:    '#1A1209',
  muted:   '#7A6A52',
  inputBg: '#FAF7F2',
  red:     '#DC2626',
  green:   '#16A34A',
};

type MsgType = 'text' | 'image' | 'voice';

export default function AppChat({ firebaseUser }: Props) {
  const [view, setView]               = useState<'rooms' | 'chat' | 'users'>('rooms');
  const [rooms, setRooms]             = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom]   = useState<ChatRoom | null>(null);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [text, setText]               = useState('');
  const [sending, setSending]         = useState(false);
  const [sendError, setSendError]     = useState('');
  const [appUsers, setAppUsers]       = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Presence
  const [otherOnline, setOtherOnline]     = useState(false);
  const [otherLastSeen, setOtherLastSeen] = useState<Date | null>(null);

  // Image upload
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Voice recording — TAP TO START / TAP TO STOP
  const [recording, setRecording]           = useState(false);
  const [voiceUploading, setVoiceUploading] = useState(false);
  const [recordedBlob, setRecordedBlob]     = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl]       = useState<string | null>(null);
  const [recordedMime, setRecordedMime]     = useState<string>('audio/webm');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
  const audioChunksRef    = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // -- Presence: set my own ---------------------------------------------------
  useEffect(() => {
    if (!firebaseUser) return;
    setOnline(firebaseUser.uid);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') setOnline(firebaseUser.uid);
      else setOffline(firebaseUser.uid);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', () => setOffline(firebaseUser.uid));
    return () => {
      setOffline(firebaseUser.uid);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [firebaseUser]);

  // -- Presence: watch other person -------------------------------------------
  useEffect(() => {
    if (!activeRoom || !firebaseUser) return;
    const otherId = activeRoom.participants.find(id => id !== firebaseUser.uid) || '';
    if (!otherId) return;
    return onSnapshot(doc(db, 'presence', otherId), snap => {
      if (snap.exists()) {
        const d = snap.data();
        setOtherOnline(d.online === true);
        if (d.lastSeen?.toDate) setOtherLastSeen(d.lastSeen.toDate());
      } else { setOtherOnline(false); }
    });
  }, [activeRoom, firebaseUser]);

  // -- Load rooms -------------------------------------------------------------
  useEffect(() => {
    if (!firebaseUser) return;
    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', firebaseUser.uid),
      limit(50)
    );
    return onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatRoom));
      list.sort((a, b) => (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''));
      setRooms(list);
    }, err => console.error('[Chat] rooms error:', err));
  }, [firebaseUser]);

  // -- Load messages ----------------------------------------------------------
  useEffect(() => {
    if (!activeRoom) return;
    setMessages([]);
    const q = query(
      collection(db, 'chatRooms', activeRoom.id, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );
    return onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    }, err => console.error('[Chat] messages error:', err));
  }, [activeRoom]);

  // -- Scroll to bottom -------------------------------------------------------
  useEffect(() => {
    if (view === 'chat') setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
  }, [messages, view]);

  // -- Load users -------------------------------------------------------------
  const loadUsers = async () => {
    if (!firebaseUser) return;
    setUsersLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), limit(50)));
      setAppUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)).filter(u => u.id !== firebaseUser.uid));
    } catch (e) { console.error('[Chat] loadUsers error:', e); }
    finally { setUsersLoading(false); }
  };

  const openChatWith = async (user: User) => {
    if (!firebaseUser) return;
    const ids    = [firebaseUser.uid, user.id].sort();
    const roomId = ids.join('_');
    const now    = new Date().toISOString();
    const roomData: ChatRoom = {
      id: roomId, participants: ids,
      participantNames:  { [firebaseUser.uid]: firebaseUser.displayName || 'You', [user.id]: user.displayName },
      participantPhotos: { [firebaseUser.uid]: firebaseUser.photoURL || '', [user.id]: user.photoURL || '' } as any,
      lastMessage: '', lastMessageAt: now, unreadCount: {},
    };
    setActiveRoom(roomData);
    setView('chat');
    try {
      const roomRef  = doc(db, 'chatRooms', roomId);
      const existing = await getDoc(roomRef);
      if (!existing.exists()) {
        await setDoc(roomRef, {
          participants: ids, participantNames: roomData.participantNames,
          participantPhotos: roomData.participantPhotos, lastMessage: '', lastMessageAt: now, unreadCount: {},
        });
      } else {
        setActiveRoom({ id: roomId, ...existing.data() } as ChatRoom);
      }
    } catch (e) { console.error('[Chat] openChatWith error:', e); }
  };

  // -- Save message to Firestore ----------------------------------------------
  const _saveMessage = async ({ content, type, mediaUrl, mimeType }: {
    content: string; type: MsgType; mediaUrl?: string; mimeType?: string;
  }) => {
    if (!firebaseUser || !activeRoom) return;
    console.log('[Chat] saving message type:', type, 'mediaUrl:', mediaUrl, 'mime:', mimeType);
    const now = new Date().toISOString();
    await addDoc(collection(db, 'chatRooms', activeRoom.id, 'messages'), {
      roomId: activeRoom.id,
      senderId: firebaseUser.uid,
      senderName: firebaseUser.displayName || 'User',
      content,
      type,
      mediaUrl: mediaUrl || null,
      mimeType: mimeType || null,
      encrypted: false,
      read: false,
      createdAt: now,
    });
    const preview = type === 'image' ? 'Image' : type === 'voice' ? 'Voice note' : content;
    await setDoc(doc(db, 'chatRooms', activeRoom.id), {
      lastMessage: preview, lastMessageAt: now,
      participants: activeRoom.participants,
      participantNames: activeRoom.participantNames,
      participantPhotos: (activeRoom as any).participantPhotos || {},
      unreadCount: {},
    }, { merge: true });
  };

  // -- Send text --------------------------------------------------------------
  const sendMessage = async () => {
    if (!firebaseUser || !activeRoom || !text.trim() || sending) return;
    const content = text.trim();
    setText(''); setSendError(''); setSending(true);
    try {
      await _saveMessage({ content, type: 'text' });
    } catch (e: any) {
      console.error('[Chat] sendMessage error:', e);
      setText(content);
      setSendError('Failed to send. Try again.');
    } finally { setSending(false); inputRef.current?.focus(); }
  };

  // -- Send image -------------------------------------------------------------
  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firebaseUser || !activeRoom) return;
    if (file.size > 5 * 1024 * 1024) { setSendError('Image must be under 5MB.'); return; }
    console.log('[Chat] uploading image:', file.name, file.size);
    setImageUploading(true); setSendError('');
    try {
      const path = `chatImages/${activeRoom.id}/${Date.now()}_${file.name}`;
      const snap = await uploadBytes(storageRef(storage, path), file);
      const url  = await getDownloadURL(snap.ref);
      console.log('[Chat] image uploaded:', url);
      await _saveMessage({ content: 'Image', type: 'image', mediaUrl: url });
    } catch (e) {
      console.error('[Chat] image upload error:', e);
      setSendError('Image upload failed.');
    } finally {
      setImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // -- TAP TO START recording -------------------------------------------------
  const startRecording = async () => {
    setSendError('');
    try {
      console.log('[Chat] requesting microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[Chat] microphone granted');

      const mime = getBestAudioMime();
      const mrOptions = mime ? { mimeType: mime } : {};
      const mr = new MediaRecorder(stream, mrOptions);
      const usedMime = mr.mimeType || mime || 'audio/webm';
      console.log('[Chat] MediaRecorder mimeType in use:', usedMime);

      audioChunksRef.current = [];

      mr.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
          console.log('[Chat] chunk received, size:', e.data.size);
        }
      };

      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: usedMime });
        console.log('[Chat] recording done. blob size:', blob.size, 'type:', blob.type);
        if (blob.size < 200) {
          setSendError('Recording too short. Try again.');
          return;
        }
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(url);
        setRecordedMime(usedMime);
      };

      // collect data every 250ms so chunks always arrive
      mr.start(250);
      mediaRecorderRef.current = mr;
      setRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } catch (e: any) {
      console.error('[Chat] microphone error:', e);
      setSendError('Microphone access denied. Check app permissions.');
    }
  };

  // -- TAP TO STOP recording --------------------------------------------------
  const stopRecording = () => {
    if (!recording || !mediaRecorderRef.current) return;
    console.log('[Chat] stopping recording...');
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  // -- Toggle recording -------------------------------------------------------
  const toggleRecording = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  // -- Send recorded voice note -----------------------------------------------
  const sendVoiceNote = async () => {
    if (!recordedBlob || !activeRoom) return;
    setVoiceUploading(true); setSendError('');
    try {
      const ext = recordedMime.includes('ogg') ? 'ogg' : recordedMime.includes('mp4') ? 'mp4' : 'webm';
      const path = `chatVoice/${activeRoom.id}/${Date.now()}.${ext}`;
      console.log('[Chat] uploading voice note, mime:', recordedMime, 'ext:', ext);
      const snap = await uploadBytes(storageRef(storage, path), recordedBlob, { contentType: recordedMime });
      const url  = await getDownloadURL(snap.ref);
      console.log('[Chat] voice uploaded:', url);
      await _saveMessage({ content: 'Voice note', type: 'voice', mediaUrl: url, mimeType: recordedMime });
      discardVoiceNote();
    } catch (e) {
      console.error('[Chat] voice upload error:', e);
      setSendError('Voice upload failed. Check your connection.');
    } finally { setVoiceUploading(false); }
  };

  // -- Discard voice note -----------------------------------------------------
  const discardVoiceNote = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordingSeconds(0);
  };

  // -- Presence label ---------------------------------------------------------
  const presenceLabel = () => {
    if (otherOnline) return { text: 'Online', color: G.green };
    if (otherLastSeen) {
      const mins = Math.floor((Date.now() - otherLastSeen.getTime()) / 60000);
      if (mins < 1)  return { text: 'Last seen just now', color: G.muted };
      if (mins < 60) return { text: `Last seen ${mins}m ago`, color: G.muted };
      const hrs = Math.floor(mins / 60);
      if (hrs < 24)  return { text: `Last seen ${hrs}h ago`, color: G.muted };
      return { text: `Last seen ${Math.floor(hrs / 24)}d ago`, color: G.muted };
    }
    return { text: 'Offline', color: G.muted };
  };

  const timeAgo = (ts: string) => {
    if (!ts) return '';
    const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const fmtSecs = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (!firebaseUser) {
    return (
      <div style={{ background: G.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: G.muted }}>Sign in to use messaging</p>
      </div>
    );
  }

  // == CHAT VIEW ===============================================================
  if (view === 'chat' && activeRoom) {
    const otherId    = activeRoom.participants.find(id => id !== firebaseUser.uid) || '';
    const otherName  = activeRoom.participantNames?.[otherId] || 'User';
    const otherPhoto = (activeRoom.participantPhotos as any)?.[otherId] || '';
    const presence   = presenceLabel();

    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', background: G.bg }}>

        {/* FULL-SCREEN IMAGE VIEWER */}
        {viewingImage && (
          <div
            onClick={() => setViewingImage(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 999,
              background: 'rgba(0,0,0,0.95)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
            <button
              onClick={e => { e.stopPropagation(); setViewingImage(null); }}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'rgba(255,255,255,0.2)', border: 'none',
                borderRadius: '50%', width: 44, height: 44,
                color: '#fff', fontSize: 22, cursor: 'pointer', fontWeight: 700,
              }}>✕</button>
            <img
              src={viewingImage}
              alt="full"
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '95vw', maxHeight: '80vh', borderRadius: 12, objectFit: 'contain' }}
            />
            <a
              href={viewingImage}
              download
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                marginTop: 20, padding: '12px 28px',
                background: G.gold, color: '#fff',
                borderRadius: 24, fontWeight: 700,
                fontSize: 15, textDecoration: 'none',
              }}>
              ⬇ Download Image
            </a>
          </div>
        )}

        {/* HEADER */}
        <div style={{
          flexShrink: 0, background: G.white, borderBottom: `1px solid ${G.border}`,
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        }}>
          <button
            onClick={() => {
              setView('rooms'); setActiveRoom(null); setMessages([]);
              setSendError(''); discardVoiceNote();
              if (recording) stopRecording();
            }}
            style={{ background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: G.gold, padding: '0 4px' }}>
            ‹
          </button>
          <div style={{
            width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, overflow: 'hidden', position: 'relative', color: '#fff', fontWeight: 700,
          }}>
            {otherPhoto
              ? <img src={otherPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : otherName.charAt(0).toUpperCase()}
            {otherOnline && (
              <span style={{
                position: 'absolute', bottom: 1, right: 1,
                width: 11, height: 11, borderRadius: '50%',
                background: G.green, border: '2px solid #fff',
              }} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: G.text }}>{otherName}</p>
            <p style={{ margin: 0, fontSize: 11, color: presence.color }}>{presence.text}</p>
          </div>
        </div>

        {/* MESSAGES */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 60 }}>
              <p style={{ fontSize: 40 }}>👋</p>
              <p style={{ color: G.muted, fontSize: 13 }}>Say hello to {otherName}!</p>
            </div>
          )}
          {messages.map(msg => {
            const isMine   = msg.senderId === firebaseUser.uid;
            const msgType  = (msg as any).type as MsgType || 'text';
            const mediaUrl = (msg as any).mediaUrl as string | null;
            const msgMime  = (msg as any).mimeType as string | null;

            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%',
                  padding: msgType === 'image' ? '4px' : '9px 13px',
                  borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMine ? `linear-gradient(135deg, ${G.gold}, ${G.goldL})` : G.white,
                  color: isMine ? '#fff' : G.text,
                  fontSize: 14, lineHeight: 1.5,
                  border: isMine ? 'none' : `1px solid ${G.border}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}>
                  {/* IMAGE */}
                  {msgType === 'image' && mediaUrl && (
                    <div>
                      <img
                        src={mediaUrl}
                        alt="sent image"
                        style={{ display: 'block', maxWidth: 220, maxHeight: 220, borderRadius: 14, objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => setViewingImage(mediaUrl)}
                      />
                      <p style={{ margin: '4px 8px 2px', fontSize: 10, color: isMine ? 'rgba(255,255,255,0.75)' : G.muted, textAlign: 'right' }}>
                        {timeAgo(msg.createdAt)}
                      </p>
                    </div>
                  )}
                  {/* VOICE — use mimeType stored with message so browser can decode correctly */}
                  {msgType === 'voice' && mediaUrl && (
                    <div style={{ padding: '4px 2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>🎙</span>
                        <audio
                          controls
                          preload="metadata"
                          style={{ height: 36, maxWidth: 200 }}
                        >
                          <source src={mediaUrl} type={msgMime || 'audio/webm;codecs=opus'} />
                          <source src={mediaUrl} type="audio/webm" />
                          <source src={mediaUrl} type="audio/ogg" />
                        </audio>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: 10, color: isMine ? 'rgba(255,255,255,0.75)' : G.muted, textAlign: 'right' }}>
                        {timeAgo(msg.createdAt)}
                      </p>
                    </div>
                  )}
                  {/* TEXT */}
                  {msgType === 'text' && (
                    <>
                      <p style={{ margin: 0 }}>{displayContent(msg, activeRoom.id)}</p>
                      <p style={{ margin: '3px 0 0', fontSize: 10, color: isMine ? 'rgba(255,255,255,0.75)' : G.muted, textAlign: 'right' }}>
                        {timeAgo(msg.createdAt)}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} style={{ height: 4 }} />
        </div>

        {/* INPUT AREA */}
        <div style={{ flexShrink: 0 }}>
          {/* Errors / upload status */}
          {sendError !== '' && (
            <p style={{ margin: 0, padding: '5px 16px', fontSize: 12, color: G.red, background: 'rgba(220,38,38,0.07)', textAlign: 'center' }}>
              {sendError}
            </p>
          )}
          {(imageUploading || voiceUploading) && (
            <p style={{ margin: 0, padding: '5px 16px', fontSize: 12, color: G.gold, background: 'rgba(201,151,58,0.07)', textAlign: 'center' }}>
              {imageUploading ? 'Uploading image...' : 'Sending voice note...'}
            </p>
          )}

          {/* RECORDING INDICATOR — shown while mic is active */}
          {recording && (
            <div style={{
              background: 'rgba(220,38,38,0.06)', borderTop: `1px solid ${G.border}`,
              padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{
                width: 10, height: 10, borderRadius: '50%', background: G.red,
                display: 'inline-block', flexShrink: 0,
              }} />
              <span style={{ color: G.red, fontWeight: 700, fontSize: 13 }}>
                Recording {fmtSecs(recordingSeconds)}
              </span>
              <span style={{ color: G.muted, fontSize: 12 }}>Tap mic again to stop</span>
            </div>
          )}

          {/* VOICE PREVIEW — shown after recording stops */}
          {recordedUrl && !recording && (
            <div style={{
              background: G.white, borderTop: `1px solid ${G.border}`,
              padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>🎙</span>
              {/* Preview player — multi-source for Android compatibility */}
              <audio controls preload="auto" style={{ flex: 1, height: 36 }}>
                <source src={recordedUrl} type={recordedMime} />
                <source src={recordedUrl} type="audio/webm" />
                <source src={recordedUrl} type="audio/ogg" />
              </audio>
              {/* Delete */}
              <button
                onClick={discardVoiceNote}
                style={{
                  width: 40, height: 40, borderRadius: '50%', border: 'none', flexShrink: 0,
                  background: 'rgba(220,38,38,0.1)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: G.red,
                }}>
                🗑
              </button>
              {/* Send voice */}
              <button
                onClick={sendVoiceNote}
                disabled={voiceUploading}
                style={{
                  width: 44, height: 44, borderRadius: '50%', border: 'none', flexShrink: 0,
                  background: voiceUploading ? G.border : `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                  cursor: voiceUploading ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, color: '#fff',
                  boxShadow: voiceUploading ? 'none' : '0 3px 12px rgba(201,151,58,0.4)',
                }}>
                {voiceUploading ? '…' : '➤'}
              </button>
            </div>
          )}

          {/* MAIN INPUT BAR — hidden while previewing recorded voice */}
          {!recordedUrl && (
            <div style={{
              background: G.white, borderTop: `1px solid ${G.border}`,
              padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center',
            }}>
              {/* Camera */}
              <button
                onClick={() => { console.log('[Chat] opening image picker'); imageInputRef.current?.click(); }}
                disabled={imageUploading || voiceUploading || recording}
                title="Send image"
                style={{
                  width: 38, height: 38, borderRadius: '50%', border: 'none', flexShrink: 0,
                  background: G.inputBg, cursor: 'pointer', fontSize: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: (imageUploading || voiceUploading || recording) ? 0.4 : 1,
                }}>
                📷
              </button>
              <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImagePick} />

              {/* Mic — TAP TO START / TAP TO STOP */}
              <button
                onClick={() => { console.log('[Chat] mic tapped, recording:', recording); toggleRecording(); }}
                disabled={imageUploading || voiceUploading}
                title={recording ? 'Tap to stop recording' : 'Tap to record voice note'}
                style={{
                  width: 38, height: 38, borderRadius: '50%', border: 'none', flexShrink: 0,
                  background: recording ? G.red : G.inputBg,
                  cursor: 'pointer', fontSize: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                  opacity: (imageUploading || voiceUploading) ? 0.4 : 1,
                  boxShadow: recording ? `0 0 0 4px rgba(220,38,38,0.25)` : 'none',
                }}>
                🎙
              </button>

              {/* Text input */}
              <input
                ref={inputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={recording ? 'Recording... tap mic to stop' : 'Type a message...'}
                disabled={recording || voiceUploading || imageUploading}
                style={{
                  flex: 1, padding: '11px 16px',
                  background: G.inputBg, border: `1.5px solid ${G.border}`,
                  borderRadius: 24, color: G.text, fontSize: 14, outline: 'none',
                  opacity: recording ? 0.5 : 1,
                }}
                onFocus={e => { e.currentTarget.style.borderColor = G.gold; }}
                onBlur={e => { e.currentTarget.style.borderColor = G.border; }}
              />

              {/* Send */}
              <button
                onClick={sendMessage}
                disabled={!text.trim() || sending || recording}
                style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0, border: 'none',
                  background: (!text.trim() || sending || recording)
                    ? G.border
                    : `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                  cursor: (!text.trim() || sending || recording) ? 'default' : 'pointer',
                  fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: (!text.trim() || sending || recording) ? 'none' : '0 3px 12px rgba(201,151,58,0.4)',
                  transition: 'background 0.2s', color: '#fff',
                }}>
                {sending ? '…' : '➤'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // == PEOPLE LIST =============================================================
  if (view === 'users') {
    return (
      <div style={{ background: G.bg, minHeight: '100vh' }}>
        <div style={{
          background: G.white, borderBottom: `1px solid ${G.border}`,
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
          position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        }}>
          <button onClick={() => setView('rooms')}
            style={{ background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: G.gold, padding: '0 4px' }}>‹</button>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, margin: 0,
            background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>New Message</h2>
        </div>
        <div style={{ padding: '12px 16px' }}>
          {usersLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: G.muted }}>Loading people...</div>
          ) : appUsers.length === 0 ? (
            <div style={{ background: G.white, borderRadius: 16, padding: '40px 24px', textAlign: 'center', border: `1px solid ${G.border}` }}>
              <p style={{ fontSize: 44, margin: '0 0 10px' }}>👥</p>
              <p style={{ color: G.text, fontWeight: 700, marginBottom: 6 }}>No other users yet</p>
              <p style={{ color: G.muted, fontSize: 13 }}>As others join, they will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {appUsers.map(user => (
                <button key={user.id} onClick={() => openChatWith(user)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 14px', background: G.white,
                    border: `1px solid ${G.border}`, borderRadius: 14,
                    cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
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
                        color: user.role === 'seller' ? G.gold : '#0D9488', fontWeight: 700,
                      }}>
                        {user.role === 'seller' ? 'Seller' : 'Buyer'}
                      </span>
                      {user.location && <span style={{ fontSize: 11, color: G.muted }}>{user.location}</span>}
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

  // == ROOMS LIST ==============================================================
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
          <button onClick={() => { setView('users'); loadUsers(); }}
            style={{
              background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
              border: 'none', borderRadius: 20, padding: '7px 16px',
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(201,151,58,0.35)',
            }}>New Chat</button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <p style={{ fontSize: 52, margin: '0 0 14px' }}>💬</p>
          <p style={{ color: G.text, fontWeight: 700, marginBottom: 8, fontSize: 16 }}>No conversations yet</p>
          <p style={{ color: G.muted, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
            Start a conversation with any user in the community.
          </p>
          <button onClick={() => { setView('users'); loadUsers(); }}
            style={{
              background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
              border: 'none', borderRadius: 12, padding: '13px 28px',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(201,151,58,0.4)',
            }}>Browse People</button>
        </div>
      ) : (
        <div style={{ paddingTop: 8 }}>
          {rooms.map(room => {
            const otherId    = room.participants.find(id => id !== firebaseUser.uid) || '';
            const otherName  = room.participantNames?.[otherId] || 'User';
            const otherPhoto = (room.participantPhotos as any)?.[otherId] || '';
            return (
              <button key={room.id} onClick={() => { setActiveRoom(room); setView('chat'); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px', background: G.white, border: 'none',
                  borderBottom: `1px solid ${G.border}`, cursor: 'pointer', textAlign: 'left',
                }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, color: '#fff', fontWeight: 700, overflow: 'hidden',
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
                  <p style={{ margin: 0, fontSize: 13, color: G.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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