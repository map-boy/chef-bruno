import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  collection, query, orderBy, limit, onSnapshot,
  addDoc, updateDoc, doc, arrayUnion, arrayRemove, getDocs,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

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

interface Reel {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  caption: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  likes: number;
  likedBy: string[];
  comments: number;
  createdAt: string;
}

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  text: string;
  createdAt: string;
}

export default function AppReels({ firebaseUser }: Props) {
  const [reels, setReels]           = useState<Reel[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [caption, setCaption]       = useState('');
  const [file, setFile]             = useState<File | null>(null);
  const [preview, setPreview]       = useState<string | null>(null);
  const [uploading, setUploading]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [uploadDone, setUploadDone] = useState(false);

  const [openComments, setOpenComments]       = useState<string | null>(null);
  const [commentsMap, setCommentsMap]         = useState<Record<string, Comment[]>>({});
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText]         = useState('');

  useEffect(() => {
    const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'), limit(40));
    return onSnapshot(q, snap => {
      setReels(snap.docs.map(d => ({ id: d.id, ...d.data() } as Reel)));
      setLoading(false);
    });
  }, []);

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setUploadDone(false);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const resetUpload = () => {
    setShowUpload(false);
    setCaption('');
    setFile(null);
    setPreview(null);
    setProgress(0);
    setUploadDone(false);
    setUploading(false);
  };

  const uploadReel = async () => {
    if (!firebaseUser || !file || !caption.trim() || uploading) return;
    setUploading(true);
    setProgress(0);
    setUploadDone(false);

    const isVideo = file.type.startsWith('video/');
    const ext = file.name.split('.').pop();
    const storageRef = ref(storage, `reels/${uuidv4()}.${ext}`);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      'state_changed',
      snap => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        setProgress(pct);
      },
      err => {
        console.error('upload error:', err);
        setUploading(false);
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          await addDoc(collection(db, 'reels'), {
            authorId:    firebaseUser.uid,
            authorName:  firebaseUser.displayName || 'User',
            authorPhoto: firebaseUser.photoURL || '',
            caption:     caption.trim(),
            mediaUrl:    url,
            mediaType:   isVideo ? 'video' : 'image',
            likes:       0,
            likedBy:     [],
            comments:    0,
            createdAt:   new Date().toISOString(),
          });
          setUploadDone(true);
          // After 800ms show the feed (the new reel will appear via onSnapshot)
          setTimeout(() => resetUpload(), 800);
        } catch (e) {
          console.error('firestore write error:', e);
          setUploading(false);
        }
      }
    );
  };

  const toggleLike = async (reel: Reel) => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;
    const liked = reel.likedBy?.includes(uid);
    await updateDoc(doc(db, 'reels', reel.id), {
      likes:   liked ? reel.likes - 1 : reel.likes + 1,
      likedBy: liked ? arrayRemove(uid) : arrayUnion(uid),
    });
  };

  const loadComments = async (reelId: string) => {
    setCommentsLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, 'reels', reelId, 'comments'), orderBy('createdAt', 'asc'), limit(50))
      );
      setCommentsMap(prev => ({
        ...prev,
        [reelId]: snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment)),
      }));
    } catch (e) { console.error(e); }
    finally { setCommentsLoading(false); }
  };

  const toggleComments = (reelId: string) => {
    if (openComments === reelId) {
      setOpenComments(null);
    } else {
      setOpenComments(reelId);
      if (!commentsMap[reelId]) loadComments(reelId);
    }
  };

  const submitComment = async (reel: Reel) => {
    if (!firebaseUser || !commentText.trim()) return;
    const text = commentText.trim();
    setCommentText('');
    const newComment = {
      authorId:    firebaseUser.uid,
      authorName:  firebaseUser.displayName || 'User',
      authorPhoto: firebaseUser.photoURL || '',
      text,
      createdAt:   new Date().toISOString(),
    };
    try {
      const ref2 = await addDoc(collection(db, 'reels', reel.id, 'comments'), newComment);
      await updateDoc(doc(db, 'reels', reel.id), { comments: reel.comments + 1 });
      setCommentsMap(prev => ({
        ...prev,
        [reel.id]: [...(prev[reel.id] || []), { id: ref2.id, ...newComment }],
      }));
    } catch (e) { console.error(e); }
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // ── Upload screen ─────────────────────────────────────────────────────────────
  if (showUpload) {
    return (
      <div style={{ background: G.bg, minHeight: '100vh' }}>
        <div style={{
          background: G.white, borderBottom: `1px solid ${G.border}`,
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
          position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        }}>
          <button onClick={() => { if (!uploading) resetUpload(); }}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: G.gold, padding: 0 }}>←</button>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, margin: 0,
            background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Post a Reel</h2>
        </div>

        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!preview ? (
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: 220, borderRadius: 16, border: `2px dashed rgba(201,151,58,0.4)`,
              background: G.white, cursor: 'pointer', gap: 10,
            }}>
              <span style={{ fontSize: 44 }}>🎬</span>
              <span style={{ fontWeight: 700, color: G.text, fontSize: 15 }}>Pick a photo or video</span>
              <span style={{ color: G.muted, fontSize: 12 }}>JPG · PNG · MP4 · Max 50MB</span>
              <input type="file" accept="image/*,video/*" onChange={pickFile} style={{ display: 'none' }} />
            </label>
          ) : (
            <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', height: 240, background: '#000' }}>
              {file?.type.startsWith('video/')
                ? <video src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls />
                : <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              }
              {!uploading && (
                <button onClick={() => { setPreview(null); setFile(null); }}
                  style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 30, height: 30, borderRadius: '50%', border: 'none',
                    background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 16, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>✕</button>
              )}
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, color: G.muted, fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Caption
            </label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Write something about your post…"
              rows={3}
              disabled={uploading}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '12px 14px', background: G.inputBg,
                border: `1.5px solid ${G.border}`, borderRadius: 12,
                fontSize: 14, color: G.text, outline: 'none', resize: 'none',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = G.gold; }}
              onBlur={e => { e.currentTarget.style.borderColor = G.border; }}
            />
          </div>

          {uploading && (
            <div>
              <div style={{ height: 8, background: G.border, borderRadius: 6, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${progress}%`,
                  background: uploadDone
                    ? '#16A34A'
                    : `linear-gradient(90deg, ${G.gold}, ${G.goldL})`,
                  transition: 'width 0.3s, background 0.3s', borderRadius: 6,
                }} />
              </div>
              <p style={{ color: G.muted, fontSize: 13, marginTop: 6, textAlign: 'center' }}>
                {uploadDone ? '✅ Posted! Opening feed…' : `Uploading… ${progress}%`}
              </p>
            </div>
          )}

          <button
            onClick={uploadReel}
            disabled={!file || !caption.trim() || uploading}
            style={{
              width: '100%', padding: '14px',
              background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
              border: 'none', borderRadius: 12, color: '#fff',
              fontWeight: 700, fontSize: 15, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(201,151,58,0.4)',
              opacity: (!file || !caption.trim() || uploading) ? 0.5 : 1,
            }}>
            {uploading ? (uploadDone ? '✅ Done!' : `Uploading ${progress}%…`) : '🚀 Post Reel'}
          </button>
        </div>
      </div>
    );
  }

  // ── Feed ──────────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: G.bg, minHeight: '100vh' }}>
      <div style={{
        background: G.white, borderBottom: `1px solid ${G.border}`,
        padding: '14px 16px', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, margin: 0,
          background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Reels</h2>
        {firebaseUser && (
          <button onClick={() => setShowUpload(true)}
            style={{
              background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
              border: 'none', borderRadius: 20, padding: '7px 16px',
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(201,151,58,0.35)',
            }}>+ Post</button>
        )}
      </div>

      <div style={{ padding: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: G.muted }}>Loading reels…</div>
        ) : reels.length === 0 ? (
          <div style={{
            background: G.white, borderRadius: 18, padding: '50px 24px', textAlign: 'center',
            border: `2px dashed rgba(201,151,58,0.3)`,
          }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🎬</div>
            <p style={{ fontWeight: 700, color: G.text, fontSize: 16, marginBottom: 8 }}>No reels yet</p>
            <p style={{ color: G.muted, fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              Be the first to post! Share a photo or video.
            </p>
            {firebaseUser && (
              <button onClick={() => setShowUpload(true)}
                style={{
                  background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                  border: 'none', borderRadius: 12, padding: '12px 28px',
                  color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(201,151,58,0.4)',
                }}>🎬 Post First Reel</button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {reels.map(reel => {
              const liked = firebaseUser ? reel.likedBy?.includes(firebaseUser.uid) : false;
              const showingComments = openComments === reel.id;
              const reelComments = commentsMap[reel.id] || [];

              return (
                <div key={reel.id} style={{
                  background: G.white, borderRadius: 18,
                  border: `1px solid ${G.border}`,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden',
                }}>
                  {/* Author */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px 10px' }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, color: '#fff', fontWeight: 700, overflow: 'hidden', flexShrink: 0,
                    }}>
                      {reel.authorPhoto
                        ? <img src={reel.authorPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : reel.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: G.text }}>{reel.authorName}</p>
                      <p style={{ margin: 0, fontSize: 11, color: G.muted }}>{timeAgo(reel.createdAt)}</p>
                    </div>
                  </div>

                  {/* Media */}
                  <div style={{ background: '#000', maxHeight: 380, overflow: 'hidden' }}>
                    {reel.mediaType === 'video'
                      ? <video src={reel.mediaUrl} controls style={{ width: '100%', maxHeight: 380, objectFit: 'contain' }} />
                      : <img src={reel.mediaUrl} alt="" style={{ width: '100%', maxHeight: 380, objectFit: 'cover', display: 'block' }} />
                    }
                  </div>

                  {reel.caption && (
                    <p style={{ margin: '10px 14px 0', fontSize: 13, color: G.text, lineHeight: 1.55 }}>
                      {reel.caption}
                    </p>
                  )}

                  {/* Actions — Like and Comment only, Share removed */}
                  <div style={{
                    display: 'flex', padding: '10px 14px 12px',
                    borderTop: `1px solid ${G.border}`, gap: 4, marginTop: 10,
                  }}>
                    <button onClick={() => toggleLike(reel)}
                      style={{
                        flex: 1, padding: '8px 4px', background: 'none', border: 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 5,
                        color: liked ? G.gold : G.muted, fontSize: 13,
                        fontWeight: liked ? 700 : 400, borderRadius: 8,
                      }}>
                      <span style={{ fontSize: 16 }}>{liked ? '❤️' : '🤍'}</span>
                      {reel.likes}
                    </button>
                    <button onClick={() => toggleComments(reel.id)}
                      style={{
                        flex: 1, padding: '8px 4px', background: 'none', border: 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 5,
                        color: showingComments ? G.gold : G.muted, fontSize: 13,
                        fontWeight: showingComments ? 700 : 400, borderRadius: 8,
                      }}>
                      <span style={{ fontSize: 16 }}>💬</span>
                      {reel.comments}
                    </button>
                  </div>

                  {/* Comments */}
                  {showingComments && (
                    <div style={{ borderTop: `1px solid ${G.border}`, padding: '12px 14px' }}>
                      {commentsLoading && reelComments.length === 0 ? (
                        <p style={{ color: G.muted, fontSize: 13, textAlign: 'center' }}>Loading…</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                          {reelComments.length === 0 && (
                            <p style={{ color: G.muted, fontSize: 13, textAlign: 'center' }}>No comments yet. Be first!</p>
                          )}
                          {reelComments.map(c => (
                            <div key={c.id} style={{ display: 'flex', gap: 9 }}>
                              <div style={{
                                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                                background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, color: '#fff', fontWeight: 700, overflow: 'hidden',
                              }}>
                                {c.authorPhoto
                                  ? <img src={c.authorPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  : c.authorName.charAt(0).toUpperCase()}
                              </div>
                              <div style={{
                                background: G.inputBg, borderRadius: 12, padding: '8px 12px',
                                border: `1px solid ${G.border}`, flex: 1,
                              }}>
                                <span style={{ fontWeight: 700, fontSize: 12, color: G.text }}>{c.authorName}</span>
                                <p style={{ margin: '2px 0 0', fontSize: 13, color: G.text, lineHeight: 1.5 }}>{c.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {firebaseUser && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && submitComment(reel)}
                            placeholder="Write a comment…"
                            style={{
                              flex: 1, padding: '9px 12px', background: G.inputBg,
                              border: `1.5px solid ${G.border}`, borderRadius: 10,
                              fontSize: 13, color: G.text, outline: 'none',
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = G.gold; }}
                            onBlur={e => { e.currentTarget.style.borderColor = G.border; }}
                          />
                          <button onClick={() => submitComment(reel)}
                            disabled={!commentText.trim()}
                            style={{
                              width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                              background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                              border: 'none', cursor: 'pointer', fontSize: 16,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              opacity: !commentText.trim() ? 0.4 : 1,
                            }}>➤</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}