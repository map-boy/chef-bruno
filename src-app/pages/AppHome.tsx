import { useState, useEffect, useRef } from "react";
import { User as FirebaseUser } from "firebase/auth";
import {
  collection, query, orderBy, limit, getDocs, where,
  updateDoc, deleteDoc, doc, arrayUnion, arrayRemove, addDoc, setDoc, getDoc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { Post, ProductCategory } from "../types";
import { TabName } from "../App";
import { v4 as uuidv4 } from "uuid";

const G = {
  gold:    "#C9973A",
  goldL:   "#E8BB6A",
  white:   "#FFFFFF",
  bg:      "#F0EBE0",
  border:  "#E2D9C8",
  text:    "#1A1209",
  muted:   "#7A6A52",
  inputBg: "#FAF7F2",
  danger:  "#DC2626",
};

interface Props {
  firebaseUser: FirebaseUser | null;
  onNavigate: (tab: TabName) => void;
  onOpenPost: () => void;
}

interface CommentItem {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  text: string;
  createdAt: string;
}

interface Story {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  createdAt: string;
  expiresAt: string;
}

const STORY_DURATION = 30000; // 30 seconds

const CATEGORY_FILTERS = [
  { id: "all",         label: "All",      emoji: "🌍" },
  { id: "food",        label: "Food",     emoji: "🍗" },
  { id: "hospitality", label: "Hotels",   emoji: "🏨" },
  { id: "minerals",    label: "Minerals", emoji: "⛏️" },
  { id: "automobile",  label: "Cars",     emoji: "🚗" },
  { id: "realestate",  label: "Property", emoji: "🏡" },
  { id: "talent",      label: "Talent",   emoji: "🎯" },
  { id: "services",    label: "Services", emoji: "🧹" },
];

// ─── Simple XOR encryption (client-side, key = roomId hash) ─────────────────
function deriveKey(roomId: string): number[] {
  const key: number[] = [];
  for (let i = 0; i < 32; i++) {
    key.push(roomId.charCodeAt(i % roomId.length) ^ (i * 7 + 13));
  }
  return key;
}

function encryptMessage(text: string, roomId: string): string {
  const key = deriveKey(roomId);
  const bytes = new TextEncoder().encode(text);
  const enc = bytes.map((b, i) => b ^ key[i % key.length]);
  return btoa(String.fromCharCode(...enc));
}

function decryptMessage(cipher: string, roomId: string): string {
  try {
    const key = deriveKey(roomId);
    const bytes = Uint8Array.from(atob(cipher), c => c.charCodeAt(0));
    const dec = bytes.map((b, i) => b ^ key[i % key.length]);
    return new TextDecoder().decode(dec);
  } catch {
    return "[encrypted message]";
  }
}

export { encryptMessage, decryptMessage };

// ─── Component ───────────────────────────────────────────────────────────────
export default function AppHome({ firebaseUser, onNavigate, onOpenPost }: Props) {
  const [posts, setPosts]     = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [filter, setFilter]   = useState<"all" | ProductCategory>("all");
  const [loading, setLoading] = useState(true);

  // Story upload
  const [storyUploading, setStoryUploading] = useState(false);
  const [storyProgress, setStoryProgress]   = useState(0);
  const storyInputRef = useRef<HTMLInputElement>(null);

  // Story viewer — flat list of ALL stories, ordered by author then time
  const [viewerOpen, setViewerOpen]       = useState(false);
  const [allStories, setAllStories]       = useState<Story[]>([]);
  const [viewerIdx, setViewerIdx]         = useState(0);    // index in allStories
  const [showReply, setShowReply]         = useState(false);
  const [replyText, setReplyText]         = useState("");
  const [replySending, setReplySending]   = useState(false);
  const [replySent, setReplySent]         = useState(false);
  const [progress, setProgress]           = useState(0);    // 0-100 over 30s
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { fetchPosts(); }, [filter]);
  useEffect(() => { fetchStories(); }, []);

  // Story auto-advance every 30s
  useEffect(() => {
    if (!viewerOpen) return;
    setProgress(0);
    setShowReply(false);

    // Progress bar tick every 100ms
    progressRef.current = setInterval(() => {
      setProgress(p => {
        const next = p + (100 / (STORY_DURATION / 100));
        return next >= 100 ? 100 : next;
      });
    }, 100);

    timerRef.current = setTimeout(() => {
      advanceStory();
    }, STORY_DURATION);

    return () => {
      if (timerRef.current)    clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [viewerOpen, viewerIdx]);

  const clearTimers = () => {
    if (timerRef.current)    clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  };

  const advanceStory = () => {
    clearTimers();
    setShowReply(false);
    setReplyText("");
    setReplySent(false);
    if (viewerIdx < allStories.length - 1) {
      setViewerIdx(i => i + 1);
    } else {
      // All stories done — show reply for last author then close
      setShowReply(true);
    }
  };

  const goBack = () => {
    clearTimers();
    setShowReply(false);
    setReplySent(false);
    if (viewerIdx > 0) setViewerIdx(i => i - 1);
  };

  const closeViewer = () => {
    clearTimers();
    setViewerOpen(false);
    setShowReply(false);
    setReplyText("");
    setReplySent(false);
  };

  const openViewer = (startAuthorId: string) => {
    if (allStories.length === 0) return;
    const idx = allStories.findIndex(s => s.authorId === startAuthorId);
    setViewerIdx(idx >= 0 ? idx : 0);
    setViewerOpen(true);
  };

  // Send encrypted reply → opens/creates chatRoom between viewer and story author
  const sendReply = async () => {
    if (!firebaseUser || !replyText.trim() || replySending) return;
    const story = allStories[viewerIdx];
    if (!story || story.authorId === firebaseUser.uid) return;

    const plain = replyText.trim();
    setReplyText("");
    setReplySending(true);

    const ids = [firebaseUser.uid, story.authorId].sort();
    const roomId = ids.join("_");

    // Encrypt the message
    const cipher = encryptMessage(plain, roomId);

    try {
      const roomRef = doc(db, "chatRooms", roomId);
      const existing = await getDoc(roomRef);
      const now = new Date().toISOString();

      if (!existing.exists()) {
        await setDoc(roomRef, {
          participants: ids,
          participantNames: {
            [firebaseUser.uid]: firebaseUser.displayName || "User",
            [story.authorId]: story.authorName,
          },
          participantPhotos: {
            [firebaseUser.uid]: firebaseUser.photoURL || "",
            [story.authorId]: story.authorPhoto || "",
          },
          lastMessage: "🔒 Encrypted message",
          lastMessageAt: now,
          encrypted: true,
        });
      } else {
        await updateDoc(roomRef, {
          lastMessage: "🔒 Encrypted message",
          lastMessageAt: now,
        });
      }

      await addDoc(collection(db, "chatRooms", roomId, "messages"), {
        roomId,
        senderId:   firebaseUser.uid,
        senderName: firebaseUser.displayName || "User",
        content:    cipher,
        encrypted:  true,
        read: false,
        createdAt: now,
      });

      setReplySent(true);
      setTimeout(() => closeViewer(), 1500);
    } catch (e) {
      console.error("reply error:", e);
    } finally {
      setReplySending(false);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(30));
      const snap = await getDocs(q);
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
      if (filter !== "all") data = data.filter(p => (p as any).category === filter);
      setPosts(data);
    } catch (e) { console.error("fetchPosts:", e); }
    finally { setLoading(false); }
  };

  const fetchStories = async () => {
    try {
      const now = new Date().toISOString();
      const q = query(
        collection(db, "stories"),
        where("expiresAt", ">", now),
        orderBy("expiresAt", "asc"),
        limit(50),
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
      setStories(list);

      // Build flat ordered list: my stories first, then others grouped by author
      const byAuthor: Record<string, Story[]> = {};
      for (const s of list) {
        if (!byAuthor[s.authorId]) byAuthor[s.authorId] = [];
        byAuthor[s.authorId].push(s);
      }
      const myUid = firebaseUser?.uid || "";
      const authorOrder = [
        myUid,
        ...Object.keys(byAuthor).filter(id => id !== myUid),
      ].filter(id => byAuthor[id]);

      const flat: Story[] = [];
      for (const aid of authorOrder) {
        if (byAuthor[aid]) flat.push(...byAuthor[aid]);
      }
      setAllStories(flat);
    } catch (e) { console.error("fetchStories:", e); }
  };

  const handleStoryPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firebaseUser) return;
    e.target.value = "";
    uploadStory(file);
  };

  const uploadStory = (file: File) => {
    if (!firebaseUser) return;
    setStoryUploading(true);
    setStoryProgress(0);
    const isVideo = file.type.startsWith("video/");
    const ext = file.name.split(".").pop();
    const storageRef = ref(storage, `stories/${uuidv4()}.${ext}`);
    const task = uploadBytesResumable(storageRef, file);
    task.on(
      "state_changed",
      s => setStoryProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      err => { console.error(err); setStoryUploading(false); },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          const now = new Date();
          const expires = new Date(now.getTime() + 24 * 3600 * 1000);
          const newStory: Omit<Story, "id"> = {
            authorId:    firebaseUser.uid,
            authorName:  firebaseUser.displayName || "User",
            authorPhoto: firebaseUser.photoURL || "",
            mediaUrl:    url,
            mediaType:   isVideo ? "video" : "image",
            createdAt:   now.toISOString(),
            expiresAt:   expires.toISOString(),
          };
          const docRef = await addDoc(collection(db, "stories"), newStory);
          const s = { id: docRef.id, ...newStory };
          setStories(prev => [s, ...prev]);
          setAllStories(prev => [s, ...prev]);
        } catch (e) { console.error(e); }
        finally { setStoryUploading(false); }
      }
    );
  };

  // Group for the row display
  const storiesByAuthor: Record<string, Story[]> = {};
  for (const s of stories) {
    if (!storiesByAuthor[s.authorId]) storiesByAuthor[s.authorId] = [];
    storiesByAuthor[s.authorId].push(s);
  }
  const authorIds = Object.keys(storiesByAuthor);
  const myStories = storiesByAuthor[firebaseUser?.uid || ""] || [];
  const hasMyStory = myStories.length > 0;

  const storyTimeLeft = (expiresAt: string) => {
    const ms = new Date(expiresAt).getTime() - Date.now();
    const hrs = Math.floor(ms / 3600000);
    if (hrs > 0) return `${hrs}h`;
    return `${Math.floor(ms / 60000)}m`;
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const toggleLike = async (post: Post) => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;
    const liked = post.likedBy?.includes(uid);
    await updateDoc(doc(db, "posts", post.id), {
      likes:   liked ? post.likes - 1 : post.likes + 1,
      likedBy: liked ? arrayRemove(uid) : arrayUnion(uid),
    });
    setPosts(prev => prev.map(p => p.id === post.id ? {
      ...p,
      likes:   liked ? p.likes - 1 : p.likes + 1,
      likedBy: liked ? p.likedBy?.filter(id => id !== uid) : [...(p.likedBy || []), uid],
    } : p));
  };

  const handleDelete = async (post: Post) => {
    if (!firebaseUser || firebaseUser.uid !== post.authorId) return;
    if (!window.confirm("Delete this post?")) return;
    await deleteDoc(doc(db, "posts", post.id));
    setPosts(prev => prev.filter(p => p.id !== post.id));
  };

  const handleEdit = async (post: Post, newContent: string) => {
    if (!firebaseUser || firebaseUser.uid !== post.authorId) return;
    await updateDoc(doc(db, "posts", post.id), { content: newContent });
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, content: newContent } : p));
  };

  const handleCommentAdded = (postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p
    ));
  };

  // Current story in viewer
  const currentStory = allStories[viewerIdx];
  const isOwnStory = currentStory?.authorId === firebaseUser?.uid;

  // Stories for current author block (to show their segment in progress bar)
  const viewerAuthorStories = currentStory
    ? allStories.filter(s => s.authorId === currentStory.authorId)
    : [];
  const viewerAuthorStart = currentStory
    ? allStories.findIndex(s => s.authorId === currentStory.authorId)
    : 0;

  return (
    <div style={{ background: G.bg, minHeight: "100vh" }}>

      {/* ── Story Viewer Overlay ── */}
      {viewerOpen && currentStory && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "#000", display: "flex", flexDirection: "column",
        }}>
          {/* Segment progress bars — one bar per story of THIS author */}
          <div style={{ display: "flex", gap: 3, padding: "14px 12px 4px" }}>
            {viewerAuthorStories.map((s, i) => {
              const globalI = viewerAuthorStart + i;
              const isDone    = globalI < viewerIdx;
              const isCurrent = globalI === viewerIdx;
              return (
                <div key={s.id} style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: "rgba(255,255,255,0.25)", overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", borderRadius: 2, background: "#fff",
                    width: isDone ? "100%" : isCurrent ? `${progress}%` : "0%",
                    transition: isCurrent ? "none" : "none",
                  }} />
                </div>
              );
            })}
          </div>

          {/* Author header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px 6px" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", overflow: "hidden",
              border: "2px solid #fff", flexShrink: 0,
              background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, color: "#fff", fontWeight: 700,
            }}>
              {currentStory.authorPhoto
                ? <img src={currentStory.authorPhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : currentStory.authorName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: 13 }}>
                {currentStory.authorName}
              </p>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.55)", fontSize: 10 }}>
                {timeAgo(currentStory.createdAt)} · expires {storyTimeLeft(currentStory.expiresAt)}
              </p>
            </div>
            <button onClick={closeViewer} style={{
              background: "rgba(0,0,0,0.4)", border: "none", color: "#fff",
              fontSize: 20, cursor: "pointer", borderRadius: "50%",
              width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>

          {/* Media — tap left/right to navigate */}
          <div style={{ flex: 1, position: "relative" }}>
            {/* Left tap zone */}
            <div style={{ position: "absolute", left: 0, top: 0, width: "35%", height: "100%", zIndex: 10 }}
              onClick={goBack} />
            {/* Right tap zone */}
            <div style={{ position: "absolute", right: 0, top: 0, width: "35%", height: "100%", zIndex: 10 }}
              onClick={() => { clearTimers(); advanceStory(); }} />

            {currentStory.mediaType === "video"
              ? <video key={currentStory.id} src={currentStory.mediaUrl} autoPlay muted={false}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              : <img key={currentStory.id} src={currentStory.mediaUrl} alt=""
                  style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            }
          </div>

          {/* Reply bar (shown for other people's stories) */}
          {!isOwnStory && (
            <div style={{
              padding: "10px 14px 20px",
              background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
            }}>
              {replySent ? (
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <p style={{ color: "#4ADE80", fontWeight: 700, fontSize: 14 }}>✓ Message sent privately 🔒</p>
                </div>
              ) : showReply ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendReply()}
                    placeholder={`Reply to ${currentStory.authorName}…`}
                    autoFocus
                    style={{
                      flex: 1, padding: "11px 14px",
                      background: "rgba(255,255,255,0.12)",
                      border: "1.5px solid rgba(255,255,255,0.3)",
                      borderRadius: 24, color: "#fff", fontSize: 14, outline: "none",
                    }}
                  />
                  <button onClick={sendReply} disabled={!replyText.trim() || replySending}
                    style={{
                      width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                      background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                      border: "none", cursor: "pointer", fontSize: 18,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: (!replyText.trim() || replySending) ? 0.5 : 1,
                    }}>
                    {replySending ? "…" : "🔒"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { clearTimers(); setShowReply(true); }}
                  style={{
                    width: "100%", padding: "11px", background: "rgba(255,255,255,0.1)",
                    border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 24,
                    color: "rgba(255,255,255,0.75)", fontSize: 13, cursor: "pointer",
                    textAlign: "left", paddingLeft: 16,
                  }}>
                  🔒 Send private reply to {currentStory.authorName}…
                </button>
              )}
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, textAlign: "center", marginTop: 6 }}>
                Replies are end-to-end encrypted and only visible in your private chat
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input ref={storyInputRef} type="file" accept="image/*,video/*"
        style={{ display: "none" }} onChange={handleStoryPick} />

      {/* ── Header ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: G.white, borderBottom: `1px solid ${G.border}`,
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      }}>
        <div style={{ padding: "12px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22, fontWeight: 700, margin: 0,
              background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Digital World</h1>
            <p style={{ margin: 0, fontSize: 11, color: G.muted, marginTop: 1 }}>
              Your global marketplace & community
            </p>
          </div>
          <button onClick={() => onNavigate("market")} style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "rgba(201,151,58,0.1)", border: "1px solid rgba(201,151,58,0.2)",
            cursor: "pointer", fontSize: 17,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>🔍</button>
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "10px 16px 12px", scrollbarWidth: "none" }}>
          {CATEGORY_FILTERS.map(cat => (
            <button key={cat.id} onClick={() => setFilter(cat.id as any)} style={{
              flexShrink: 0, padding: "5px 13px", borderRadius: 20,
              border: filter === cat.id ? "none" : `1.5px solid ${G.border}`,
              background: filter === cat.id ? `linear-gradient(135deg, ${G.gold}, ${G.goldL})` : G.white,
              color: filter === cat.id ? "#fff" : G.muted,
              fontSize: 12, cursor: "pointer", fontWeight: filter === cat.id ? 700 : 400, whiteSpace: "nowrap",
            }}>{cat.emoji} {cat.label}</button>
          ))}
        </div>
      </div>

      {/* ── Stories row ── */}
      <div style={{
        background: G.white, borderBottom: `1px solid ${G.border}`,
        padding: "14px 16px", display: "flex", gap: 14,
        overflowX: "auto", scrollbarWidth: "none",
      }}>
        {/* Add story */}
        <div style={{ textAlign: "center", flexShrink: 0, cursor: "pointer" }}
          onClick={() => !storyUploading && storyInputRef.current?.click()}>
          <div style={{
            width: 58, height: 58, borderRadius: "50%",
            background: G.inputBg,
            border: storyUploading ? `2px solid ${G.gold}` : `2px dashed ${G.gold}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden",
          }}>
            {storyUploading && (
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 58 58">
                <circle cx="29" cy="29" r="27" fill="none" stroke={G.border} strokeWidth="3" />
                <circle cx="29" cy="29" r="27" fill="none" stroke={G.gold} strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 27}`}
                  strokeDashoffset={`${2 * Math.PI * 27 * (1 - storyProgress / 100)}`}
                  strokeLinecap="round" transform="rotate(-90 29 29)"
                  style={{ transition: "stroke-dashoffset 0.3s" }}
                />
              </svg>
            )}
            {firebaseUser?.photoURL
              ? <img src={firebaseUser.photoURL} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} alt="" />
              : <span style={{ fontSize: 14, fontWeight: 700, color: G.muted }}>{firebaseUser?.displayName?.charAt(0).toUpperCase() || "?"}</span>
            }
            {!storyUploading && (
              <span style={{
                position: "absolute", bottom: 0, right: 0,
                width: 20, height: 20, borderRadius: "50%",
                background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                border: `2px solid ${G.white}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, color: "#fff", fontWeight: 800,
              }}>+</span>
            )}
          </div>
          <p style={{ margin: "5px 0 0", fontSize: 10, color: G.muted, fontWeight: 600 }}>
            {storyUploading ? `${storyProgress}%` : hasMyStory ? "My story" : "Add story"}
          </p>
        </div>

        {/* My story bubble */}
        {hasMyStory && (
          <div style={{ textAlign: "center", flexShrink: 0, cursor: "pointer" }}
            onClick={() => openViewer(firebaseUser!.uid)}>
            <div style={{
              width: 58, height: 58, borderRadius: "50%",
              background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`, padding: 2,
            }}>
              <div style={{
                width: "100%", height: "100%", borderRadius: "50%",
                overflow: "hidden", border: `2px solid ${G.white}`,
                background: `linear-gradient(135deg, #F7E7C8, #E8C97A)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {firebaseUser?.photoURL
                  ? <img src={firebaseUser.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{firebaseUser?.displayName?.charAt(0).toUpperCase()}</span>}
              </div>
            </div>
            <p style={{ margin: "5px 0 0", fontSize: 10, color: G.gold, fontWeight: 700 }}>
              {storyTimeLeft(myStories[myStories.length - 1].expiresAt)}
            </p>
          </div>
        )}

        {/* Other users' stories */}
        {authorIds.filter(aid => aid !== firebaseUser?.uid).map(aid => {
          const group = storiesByAuthor[aid];
          const s = group[0];
          return (
            <div key={aid} style={{ textAlign: "center", flexShrink: 0, cursor: "pointer" }}
              onClick={() => openViewer(aid)}>
              <div style={{
                width: 58, height: 58, borderRadius: "50%",
                background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`, padding: 2,
              }}>
                <div style={{
                  width: "100%", height: "100%", borderRadius: "50%",
                  background: s.authorPhoto ? "transparent" : `linear-gradient(135deg, #F7E7C8, #E8C97A)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, overflow: "hidden", border: `2px solid ${G.white}`,
                }}>
                  {s.authorPhoto
                    ? <img src={s.authorPhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : s.authorName.charAt(0).toUpperCase()}
                </div>
              </div>
              <p style={{ margin: "5px 0 0", fontSize: 10, color: G.muted, maxWidth: 58, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.authorName.split(" ")[0]}
              </p>
            </div>
          );
        })}

        {authorIds.filter(aid => aid !== firebaseUser?.uid).length === 0 && !hasMyStory && (
          <div style={{ display: "flex", alignItems: "center", color: G.muted, fontSize: 12, paddingLeft: 4 }}>
            No stories yet — be first!
          </div>
        )}
      </div>

      {/* Create post prompt */}
      <div style={{
        margin: "10px 12px", background: G.white, borderRadius: 14,
        border: `1px solid ${G.border}`, padding: "12px 14px",
        display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
      }} onClick={onOpenPost}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, color: "#fff", fontWeight: 700, flexShrink: 0, overflow: "hidden",
        }}>
          {firebaseUser?.photoURL
            ? <img src={firebaseUser.photoURL} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
            : firebaseUser?.displayName?.charAt(0).toUpperCase()}
        </div>
        <div style={{
          flex: 1, padding: "10px 14px",
          background: G.inputBg, borderRadius: 20,
          border: `1.5px solid ${G.border}`, color: G.muted, fontSize: 13,
        }}>
          What are you selling today?
        </div>
      </div>

      {/* Feed */}
      <div style={{ padding: "0 0 16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 16px" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              border: `3px solid ${G.border}`, borderTopColor: G.gold,
              animation: "spin 0.8s linear infinite", margin: "0 auto",
            }} />
            <p style={{ color: G.muted, marginTop: 12, fontSize: 13 }}>Loading feed…</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ margin: 12, background: G.white, borderRadius: 16, padding: "40px 24px", textAlign: "center", border: `1px solid ${G.border}` }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🌍</div>
            <p style={{ fontWeight: 700, fontSize: 16, color: G.text, marginBottom: 6 }}>Be the first to post!</p>
            <button onClick={onOpenPost} style={{
              background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
              border: "none", borderRadius: 12, color: "#fff",
              padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>Create a post</button>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              firebaseUser={firebaseUser}
              onLike={() => toggleLike(post)}
              onDelete={() => handleDelete(post)}
              onEdit={(c) => handleEdit(post, c)}
              onCommentAdded={() => handleCommentAdded(post.id)}
              timeAgo={timeAgo}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, firebaseUser, onLike, onDelete, onEdit, onCommentAdded, timeAgo }: {
  post: Post;
  firebaseUser: FirebaseUser | null;
  onLike: () => void;
  onDelete: () => void;
  onEdit: (c: string) => void;
  onCommentAdded: () => void;
  timeAgo: (ts: string) => string;
}) {
  const uid     = firebaseUser?.uid;
  const liked   = post.likedBy?.includes(uid || "");
  const isOwner = uid === post.authorId;

  const [showMenu, setShowMenu]               = useState(false);
  const [editing, setEditing]                 = useState(false);
  const [editText, setEditText]               = useState(post.content);
  const [showComments, setShowComments]       = useState(false);
  const [comments, setComments]               = useState<CommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText]         = useState("");
  const [submitting, setSubmitting]           = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loadComments = async () => {
    setCommentsLoading(true);
    setComments([]);
    try {
      const snap = await getDocs(
        query(collection(db, "posts", post.id, "comments"), orderBy("createdAt", "asc"), limit(50))
      );
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() } as CommentItem)));
    } catch (e) { console.error(e); }
    finally { setCommentsLoading(false); }
  };

  const toggleComments = () => {
    const next = !showComments;
    setShowComments(next);
    if (next) loadComments();
  };

  const submitComment = async () => {
    if (!firebaseUser || !commentText.trim() || submitting) return;
    const text = commentText.trim();
    setCommentText("");
    setSubmitting(true);
    const tempId = `temp_${Date.now()}`;
    const optimistic: CommentItem = {
      id: tempId,
      authorId:    firebaseUser.uid,
      authorName:  firebaseUser.displayName || "User",
      authorPhoto: firebaseUser.photoURL || "",
      text,
      createdAt:   new Date().toISOString(),
    };
    setComments(prev => [...prev, optimistic]);
    onCommentAdded();
    try {
      const r = await addDoc(collection(db, "posts", post.id, "comments"), {
        authorId:    optimistic.authorId,
        authorName:  optimistic.authorName,
        authorPhoto: optimistic.authorPhoto,
        text,
        createdAt:   optimistic.createdAt,
      });
      await updateDoc(doc(db, "posts", post.id), { comments: (post.comments || 0) + 1 });
      setComments(prev => prev.map(c => c.id === tempId ? { ...c, id: r.id } : c));
    } catch (e) {
      console.error(e);
      setComments(prev => prev.filter(c => c.id !== tempId));
      setCommentText(text);
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{
      margin: "10px 12px", background: G.white,
      borderRadius: 16, border: `1px solid ${G.border}`,
      boxShadow: "0 1px 6px rgba(0,0,0,0.05)", overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", padding: "14px 14px 10px", gap: 10 }}>
        <div style={{
          width: 42, height: 42, borderRadius: "50%",
          background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, flexShrink: 0, overflow: "hidden",
        }}>
          {post.authorPhoto
            ? <img src={post.authorPhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : post.authorName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: G.text }}>{post.authorName}</span>
            <span style={{
              fontSize: 10, padding: "2px 7px", borderRadius: 20,
              background: post.authorRole === "seller" ? "rgba(201,151,58,0.12)" : "rgba(78,205,196,0.12)",
              color: post.authorRole === "seller" ? G.gold : "#0D9488", fontWeight: 700,
            }}>
              {post.authorRole === "seller" ? "🏪 Seller" : post.authorRole === "buyer" ? "🛒 Buyer" : "🔄 Both"}
            </span>
          </div>
          <span style={{ fontSize: 11, color: G.muted }}>{timeAgo(post.createdAt)}</span>
        </div>
        {isOwner && (
          <div style={{ position: "relative" }} ref={menuRef}>
            <button onClick={() => setShowMenu(!showMenu)} style={{
              background: "none", border: "none", color: G.muted,
              fontSize: 22, cursor: "pointer", width: 32, height: 32,
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            }}>⋯</button>
            {showMenu && (
              <div style={{
                position: "absolute", right: 0, top: 36, zIndex: 200,
                background: G.white, borderRadius: 12, border: `1px solid ${G.border}`,
                boxShadow: "0 8px 28px rgba(0,0,0,0.13)", overflow: "hidden", minWidth: 160,
              }}>
                <button onClick={() => { setShowMenu(false); setEditing(true); setEditText(post.content); }}
                  style={{ width: "100%", padding: "12px 16px", background: "none", border: "none", color: G.text, fontSize: 14, cursor: "pointer", textAlign: "left" }}>
                  ✏️ Edit Post
                </button>
                <div style={{ height: 1, background: G.border }} />
                <button onClick={() => { setShowMenu(false); onDelete(); }}
                  style={{ width: "100%", padding: "12px 16px", background: "none", border: "none", color: G.danger, fontSize: 14, cursor: "pointer", textAlign: "left" }}>
                  🗑️ Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div style={{ padding: "0 14px 12px" }}>
          <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3} autoFocus
            style={{
              width: "100%", boxSizing: "border-box", padding: "11px 13px",
              background: G.inputBg, border: `1.5px solid ${G.gold}`,
              borderRadius: 10, fontSize: 14, color: G.text, outline: "none", resize: "none",
            }} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => { if (editText.trim()) onEdit(editText.trim()); setEditing(false); }}
              style={{ flex: 1, padding: "9px", borderRadius: 8, background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`, border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              Save
            </button>
            <button onClick={() => setEditing(false)}
              style={{ flex: 1, padding: "9px", borderRadius: 8, background: G.inputBg, border: `1px solid ${G.border}`, color: G.muted, fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      ) : post.content ? (
        <p style={{ margin: "0 14px 10px", fontSize: 14, lineHeight: 1.65, color: G.text }}>{post.content}</p>
      ) : null}

      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: post.mediaUrls.length === 1 ? "1fr" : "1fr 1fr", gap: 2 }}>
          {post.mediaUrls.slice(0, 4).map((url, i) => (
            <img key={i} src={url} alt="" style={{ width: "100%", aspectRatio: post.mediaUrls!.length === 1 ? "16/9" : "1", objectFit: "cover" }} />
          ))}
        </div>
      )}

      {(post.likes > 0 || post.comments > 0) && (
        <div style={{ padding: "6px 14px", display: "flex", gap: 12, borderTop: `1px solid ${G.border}` }}>
          {post.likes > 0 && <span style={{ fontSize: 12, color: G.muted }}>❤️ {post.likes} like{post.likes !== 1 ? "s" : ""}</span>}
          {post.comments > 0 && (
            <button onClick={toggleComments} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12, color: G.muted }}>
              💬 {post.comments} comment{post.comments !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}

      <div style={{ display: "flex", padding: "8px 14px", borderTop: `1px solid ${G.border}`, gap: 4 }}>
        <button onClick={onLike} style={{
          flex: 1, padding: "8px 4px", background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          color: liked ? G.gold : G.muted, fontSize: 13, fontWeight: liked ? 700 : 400, borderRadius: 8,
        }}>
          <span style={{ fontSize: 16 }}>{liked ? "❤️" : "🤍"}</span> Like
        </button>
        <button onClick={toggleComments} style={{
          flex: 1, padding: "8px 4px", background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          color: showComments ? G.gold : G.muted, fontSize: 13, fontWeight: showComments ? 700 : 400, borderRadius: 8,
        }}>
          <span style={{ fontSize: 16 }}>💬</span> Comment
        </button>
      </div>

      {showComments && (
        <div style={{ borderTop: `1px solid ${G.border}`, padding: "12px 14px" }}>
          {commentsLoading ? (
            <p style={{ color: G.muted, fontSize: 13, textAlign: "center", padding: "8px 0" }}>Loading…</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
              {comments.length === 0 && (
                <p style={{ color: G.muted, fontSize: 13, textAlign: "center" }}>No comments yet. Be the first!</p>
              )}
              {comments.map(c => (
                <div key={c.id} style={{ display: "flex", gap: 9 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, color: "#fff", fontWeight: 700, overflow: "hidden",
                  }}>
                    {c.authorPhoto
                      ? <img src={c.authorPhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : c.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ background: G.inputBg, borderRadius: 12, padding: "8px 12px", border: `1px solid ${G.border}`, flex: 1 }}>
                    <span style={{ fontWeight: 700, fontSize: 12, color: G.text }}>{c.authorName}</span>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: G.text, lineHeight: 1.5 }}>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {firebaseUser && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, color: "#fff", fontWeight: 700, overflow: "hidden",
              }}>
                {firebaseUser.photoURL
                  ? <img src={firebaseUser.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : firebaseUser.displayName?.charAt(0).toUpperCase()}
              </div>
              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submitComment()}
                placeholder="Write a comment…"
                style={{
                  flex: 1, padding: "9px 12px",
                  background: G.inputBg, border: `1.5px solid ${G.border}`,
                  borderRadius: 20, fontSize: 13, color: G.text, outline: "none",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = G.gold; }}
                onBlur={e => { e.currentTarget.style.borderColor = G.border; }}
              />
              <button onClick={submitComment} disabled={!commentText.trim() || submitting}
                style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                  border: "none", cursor: "pointer", fontSize: 15,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: (!commentText.trim() || submitting) ? 0.4 : 1,
                }}>{submitting ? "…" : "➤"}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}