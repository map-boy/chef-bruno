import { useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import {
  collection, query, orderBy, limit, getDocs,
  updateDoc, deleteDoc, doc, arrayUnion, arrayRemove
} from "firebase/firestore";
import { db } from "../firebase";
import { Post, CATEGORY_META, ProductCategory, User } from "../types";
import { TabName } from "../App";

interface Props {
  firebaseUser: FirebaseUser | null;
  onNavigate: (tab: TabName) => void;
}

const CATEGORY_FILTERS: { id: "all" | ProductCategory; label: string; emoji: string }[] = [
  { id: "all",         label: "All",      emoji: "🌍" },
  { id: "food",        label: "Food",     emoji: "🍗" },
  { id: "hospitality", label: "Hotels",   emoji: "🏨" },
  { id: "minerals",    label: "Minerals", emoji: "⛏️" },
  { id: "automobile",  label: "Cars",     emoji: "🚗" },
  { id: "realestate",  label: "Property", emoji: "🏡" },
  { id: "talent",      label: "Talent",   emoji: "🎯" },
  { id: "services",    label: "Services", emoji: "🧹" },
];

export default function AppHome({ firebaseUser, onNavigate }: Props) {
  const [posts, setPosts]     = useState<Post[]>([]);
  const [stories, setStories] = useState<User[]>([]);
  const [filter, setFilter]   = useState<"all" | ProductCategory>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPosts(); }, [filter]);
  useEffect(() => { fetchStories(); }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(30));
      const snap = await getDocs(q);
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
      if (filter !== "all") {
        data = data.filter(p => (p as any).category === filter);
      }
      setPosts(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchStories = async () => {
    try {
      const q = query(collection(db, "users"), limit(10));
      const snap = await getDocs(q);
      setStories(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
    } catch (e) { console.error(e); }
  };

  const toggleLike = async (post: Post) => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;
    const ref = doc(db, "posts", post.id);
    const liked = post.likedBy?.includes(uid);
    await updateDoc(ref, {
      likes: liked ? post.likes - 1 : post.likes + 1,
      likedBy: liked ? arrayRemove(uid) : arrayUnion(uid),
    });
    setPosts(prev => prev.map(p => p.id === post.id ? {
      ...p,
      likes: liked ? p.likes - 1 : p.likes + 1,
      likedBy: liked ? p.likedBy?.filter(id => id !== uid) : [...(p.likedBy || []), uid],
    } : p));
  };

  const deletePost = async (post: Post) => {
    if (!firebaseUser || firebaseUser.uid !== post.authorId) return;
    const confirmed = window.confirm("Delete this post?");
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, "posts", post.id));
      setPosts(prev => prev.filter(p => p.id !== post.id));
    } catch (e) { console.error(e); }
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

  return (
    <div style={{ background: "#0A0A0F", minHeight: "100vh", color: "#F0F0F5" }}>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(10,10,15,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1A1A2E", padding: "14px 16px 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <h1 style={{
              margin: 0, fontSize: 22, fontWeight: 800, fontFamily: "sans-serif",
              background: "linear-gradient(135deg, #FF6B35, #F7931E)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              🌍 Digital World
            </h1>
            <p style={{ margin: 0, fontSize: 11, color: "#555570", fontFamily: "sans-serif" }}>
              Your global marketplace & community
            </p>
          </div>
          <button onClick={() => onNavigate("explore")}
            style={{ width: 38, height: 38, borderRadius: "50%", background: "#1A1A2E",
              border: "none", cursor: "pointer", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
            🔍
          </button>
        </div>

        {/* Category Filter */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
          {CATEGORY_FILTERS.map(cat => (
            <button key={cat.id} onClick={() => setFilter(cat.id)}
              style={{
                flexShrink: 0, padding: "6px 14px", borderRadius: 20,
                border: filter === cat.id ? "none" : "1px solid #1E1E2E",
                background: filter === cat.id ? "linear-gradient(135deg, #FF6B35, #F7931E)" : "#111118",
                color: filter === cat.id ? "#fff" : "#888",
                fontSize: 12, fontFamily: "sans-serif", cursor: "pointer",
                fontWeight: filter === cat.id ? 700 : 400, whiteSpace: "nowrap",
              }}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stories */}
      <div style={{ padding: "12px 16px", display: "flex", gap: 12, overflowX: "auto", scrollbarWidth: "none" }}>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", background: "#1A1A2E",
            border: "2px dashed #FF6B35", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 22, cursor: "pointer",
          }}>+</div>
          <p style={{ margin: "4px 0 0", fontSize: 10, color: "#555570", fontFamily: "sans-serif" }}>Your story</p>
        </div>
        {stories.map((user) => (
          <div key={user.id} style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "linear-gradient(135deg, #FF6B35, #F7931E)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, cursor: "pointer", overflow: "hidden",
              border: "2px solid #FF6B35",
            }}>
              {user.photoURL
                ? <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : user.displayName?.charAt(0).toUpperCase()}
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 10, color: "#888", fontFamily: "sans-serif",
              maxWidth: 56, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.displayName?.split(" ")[0]}
            </p>
          </div>
        ))}
      </div>

      {/* Feed */}
      <div style={{ padding: "0 0 16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#555570" }}>Loading feed...</div>
        ) : posts.length === 0 ? (
          <div style={{ margin: 16, background: "#111118", borderRadius: 16, padding: "40px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌍</div>
            <p style={{ color: "#F0F0F5", fontFamily: "sans-serif", fontWeight: 700, marginBottom: 8 }}>
              Be the first to post!
            </p>
            <p style={{ color: "#555570", fontSize: 13, fontFamily: "sans-serif", marginBottom: 20 }}>
              Share food, services, products or anything you want to sell to the world.
            </p>
            <button onClick={() => onNavigate("profile")}
              style={{ background: "linear-gradient(135deg, #FF6B35, #F7931E)", border: "none",
                borderRadius: 12, color: "#fff", padding: "12px 28px", fontSize: 14,
                fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" }}>
              Create your profile
            </button>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              uid={firebaseUser?.uid}
              onLike={() => toggleLike(post)}
              onDelete={() => deletePost(post)}
              timeAgo={timeAgo}
            />
          ))
        )}
      </div>
    </div>
  );
}

function PostCard({ post, uid, onLike, onDelete, timeAgo }: {
  post: Post; uid?: string;
  onLike: () => void; onDelete: () => void;
  timeAgo: (ts: string) => string;
}) {
  const liked = post.likedBy?.includes(uid || "");
  const isOwner = uid === post.authorId;
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div style={{ margin: "0 0 1px", background: "#111118", borderBottom: "1px solid #1A1A2E" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "14px 16px 10px", gap: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "linear-gradient(135deg, #FF6B35, #F7931E)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, flexShrink: 0, overflow: "hidden",
        }}>
          {post.authorPhoto
            ? <img src={post.authorPhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : post.authorName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 14, color: "#F0F0F5" }}>
              {post.authorName}
            </span>
            <span style={{
              fontSize: 10, padding: "1px 6px", borderRadius: 6,
              background: post.authorRole === "seller" ? "rgba(255,107,53,0.2)" : "rgba(78,205,196,0.2)",
              color: post.authorRole === "seller" ? "#FF6B35" : "#4ECDC4",
              fontFamily: "sans-serif", fontWeight: 600,
            }}>
              {post.authorRole === "seller" ? "🏪 Seller" : post.authorRole === "buyer" ? "🛒 Buyer" : "🔄 Both"}
            </span>
          </div>
          <span style={{ fontSize: 11, color: "#555570", fontFamily: "sans-serif" }}>
            {timeAgo(post.createdAt)}
          </span>
        </div>

        {/* Menu button — only show to post owner */}
        {isOwner && (
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowMenu(!showMenu)}
              style={{ background: "none", border: "none", color: "#555570", fontSize: 20, cursor: "pointer" }}>
              ⋯
            </button>
            {showMenu && (
              <div style={{
                position: "absolute", right: 0, top: 28, zIndex: 100,
                background: "#1A1A2E", borderRadius: 10, border: "1px solid #2E2E4E",
                overflow: "hidden", minWidth: 140,
              }}>
                <button onClick={() => { setShowMenu(false); onDelete(); }}
                  style={{ width: "100%", padding: "12px 16px", background: "none", border: "none",
                    color: "#FF5050", fontFamily: "sans-serif", fontSize: 14, cursor: "pointer",
                    textAlign: "left" }}>
                  🗑️ Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <p style={{ margin: "0 16px 10px", fontSize: 14, lineHeight: 1.6, color: "#D0D0E0", fontFamily: "sans-serif" }}>
          {post.content}
        </p>
      )}

      {/* Media */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: post.mediaUrls.length === 1 ? "1fr" : "1fr 1fr", gap: 2 }}>
          {post.mediaUrls.slice(0, 4).map((url, i) => (
            <img key={i} src={url} alt="" style={{
              width: "100%", aspectRatio: post.mediaUrls!.length === 1 ? "16/9" : "1", objectFit: "cover",
            }} />
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", padding: "10px 16px", borderTop: "1px solid #0A0A0F", gap: 20 }}>
        <button onClick={onLike} style={{ background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
          color: liked ? "#FF6B35" : "#555570", fontSize: 13, fontFamily: "sans-serif" }}>
          {liked ? "❤️" : "🤍"} {post.likes}
        </button>
        <button style={{ background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
          color: "#555570", fontSize: 13, fontFamily: "sans-serif" }}>
          💬 {post.comments}
        </button>
        <button style={{ background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
          color: "#555570", fontSize: 13, fontFamily: "sans-serif" }}>
          🔗 Share
        </button>
      </div>
    </div>
  );
}
