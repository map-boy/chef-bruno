import { useState, useEffect } from "react";
import { User as FirebaseUser, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { auth, db, ADMIN_EMAILS } from "../firebase";
import { User, Post, Product } from "../types";
import { TabName } from "../App";

const G = {
  gold:    "#C9973A",
  goldL:   "#E8BB6A",
  goldD:   "#A07830",
  white:   "#FFFFFF",
  bg:      "#F0EBE0",
  card:    "#FFFFFF",
  border:  "#E2D9C8",
  text:    "#1A1209",
  muted:   "#7A6A52",
  inputBg: "#FAF7F2",
  danger:  "#DC2626",
};

interface Props {
  firebaseUser: FirebaseUser | null;
  onNavigate: (tab: TabName) => void;
}

type ProfileTab = "posts" | "listings" | "about";

export default function AppProfile({ firebaseUser, onNavigate }: Props) {
  const [profile, setProfile]           = useState<User | null>(null);
  const [posts, setPosts]               = useState<Post[]>([]);
  const [listings, setListings]         = useState<Product[]>([]);
  const [activeTab, setActiveTab]       = useState<ProfileTab>("posts");
  const [loading, setLoading]           = useState(true);
  const [editing, setEditing]           = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Edit fields
  const [editName, setEditName]     = useState("");
  const [editBio, setEditBio]       = useState("");
  const [editLoc, setEditLoc]       = useState("");
  const [editPhone, setEditPhone]   = useState("");
  const [editBiz, setEditBiz]       = useState("");
  const [saving, setSaving]         = useState(false);

  const isAdmin = firebaseUser && ADMIN_EMAILS.includes(firebaseUser.email || "");

  useEffect(() => {
    if (!firebaseUser) return;
    fetchProfile();
    fetchPosts();
    fetchListings();
  }, [firebaseUser]);

  const fetchProfile = async () => {
    if (!firebaseUser) return;
    const snap = await getDoc(doc(db, "users", firebaseUser.uid));
    if (snap.exists()) {
      const data = { id: snap.id, ...snap.data() } as User;
      setProfile(data);
      setEditName(data.displayName || "");
      setEditBio(data.bio || "");
      setEditLoc(data.location || "");
      setEditPhone(data.phone || "");
      setEditBiz(data.businessName || "");
    }
    setLoading(false);
  };

  const fetchPosts = async () => {
    if (!firebaseUser) return;
    const q = query(collection(db, "posts"),
      where("authorId", "==", firebaseUser.uid),
      orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
  };

  const fetchListings = async () => {
    if (!firebaseUser) return;
    const q = query(collection(db, "products"),
      where("sellerId", "==", firebaseUser.uid),
      orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setListings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
  };

  const saveProfile = async () => {
    if (!firebaseUser || !editName.trim()) return;
    setSaving(true);
    try {
      await updateProfile(firebaseUser, { displayName: editName.trim() });
      await updateDoc(doc(db, "users", firebaseUser.uid), {
        displayName: editName.trim(),
        bio: editBio.trim(),
        location: editLoc.trim(),
        phone: editPhone.trim(),
        businessName: editBiz.trim(),
      });
      await fetchProfile();
      setEditing(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleSignOut = async () => {
    if (window.confirm("Sign out of Digital World?")) {
      await signOut(auth);
    }
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };

  if (!firebaseUser) return (
    <div style={{ background: G.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: G.muted }}>Please sign in to view your profile.</p>
    </div>
  );

  if (loading) return (
    <div style={{ background: G.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        border: `3px solid ${G.border}`, borderTopColor: G.gold,
        animation: "spin 0.8s linear infinite",
      }} />
    </div>
  );

  return (
    <div style={{ background: G.bg, minHeight: "100vh" }}>

      {/* ── Profile Header ─────────────────────────────────── */}
      <div style={{ background: G.white, borderBottom: `1px solid ${G.border}` }}>

        {/* Cover */}
        <div style={{
          height: 120,
          background: `linear-gradient(135deg, ${G.gold} 0%, ${G.goldL} 50%, #F5DFA8 100%)`,
          position: "relative",
        }}>
          {isAdmin && (
            <span style={{
              position: "absolute", top: 10, left: 10,
              background: "rgba(255,255,255,0.9)",
              color: G.goldD, fontSize: 11, fontWeight: 800,
              padding: "4px 10px", borderRadius: 20,
              border: `1px solid rgba(201,151,58,0.3)`,
            }}>⭐ Admin</span>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              position: "absolute", top: 10, right: 10,
              background: "rgba(255,255,255,0.85)",
              border: "none", borderRadius: "50%",
              width: 36, height: 36, cursor: "pointer",
              fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(4px)",
            }}>⚙️</button>
        </div>

        {/* Avatar + Info */}
        <div style={{ padding: "0 16px 18px", position: "relative" }}>
          {/* Avatar */}
          <div style={{
            width: 84, height: 84, borderRadius: "50%",
            border: `4px solid ${G.white}`,
            background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, color: "#fff", fontWeight: 700,
            overflow: "hidden", marginTop: -42,
            boxShadow: "0 4px 18px rgba(201,151,58,0.4)",
          }}>
            {firebaseUser.photoURL
              ? <img src={firebaseUser.photoURL} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              : (profile?.displayName || "?").charAt(0).toUpperCase()}
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: G.text, fontFamily: "'Playfair Display', serif" }}>
                {profile?.displayName || firebaseUser.displayName || "User"}
              </h2>
              {profile?.verified && (
                <span style={{
                  background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                  color: "#fff", fontSize: 11, fontWeight: 700,
                  padding: "2px 8px", borderRadius: 10,
                }}>✓ Verified</span>
              )}
              <span style={{
                fontSize: 11,
                background: "rgba(201,151,58,0.1)",
                border: `1px solid rgba(201,151,58,0.25)`,
                color: G.gold, padding: "2px 8px", borderRadius: 10, fontWeight: 700,
              }}>
                {profile?.role === "seller" ? "🏪 Seller" : profile?.role === "buyer" ? "🛒 Buyer" : "🔄 Both"}
              </span>
            </div>

            {profile?.bio && (
              <p style={{ margin: "6px 0 0", fontSize: 13, color: G.muted, lineHeight: 1.55 }}>
                {profile.bio}
              </p>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
              {profile?.location && (
                <span style={{ fontSize: 12, color: G.muted, display: "flex", alignItems: "center", gap: 4 }}>
                  📍 {profile.location}
                </span>
              )}
              {profile?.businessName && (
                <span style={{ fontSize: 12, color: G.muted, display: "flex", alignItems: "center", gap: 4 }}>
                  🏪 {profile.businessName}
                </span>
              )}
              <span style={{ fontSize: 12, color: G.muted }}>
                ⭐ {profile?.rating?.toFixed(1) || "0.0"} ({profile?.reviewCount || 0} reviews)
              </span>
            </div>

            {/* Stats row */}
            <div style={{
              display: "flex", gap: 0, marginTop: 14,
              borderTop: `1px solid ${G.border}`, paddingTop: 14,
            }}>
              {[
                { label: "Posts", value: posts.length },
                { label: "Listings", value: listings.length },
                { label: "Rating", value: `${profile?.rating?.toFixed(1) || "0.0"}⭐` },
              ].map((stat, i) => (
                <div key={stat.label} style={{
                  flex: 1, textAlign: "center",
                  borderRight: i < 2 ? `1px solid ${G.border}` : "none",
                }}>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: G.gold, fontFamily: "'Playfair Display', serif" }}>
                    {stat.value}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: G.muted, fontWeight: 500 }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button onClick={() => setEditing(true)}
                style={{
                  flex: 1, padding: "10px",
                  background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                  border: "none", borderRadius: 10, color: "#fff",
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  boxShadow: "0 3px 12px rgba(201,151,58,0.35)",
                }}>✏️ Edit Profile</button>
              <button onClick={() => onNavigate("chat")}
                style={{
                  flex: 1, padding: "10px",
                  background: G.bg,
                  border: `1.5px solid ${G.border}`,
                  borderRadius: 10, color: G.muted,
                  fontWeight: 600, fontSize: 14, cursor: "pointer",
                }}>💬 Messages</button>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div style={{ display: "flex", borderTop: `1px solid ${G.border}` }}>
          {(["posts", "listings", "about"] as ProfileTab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: "13px 0",
                border: "none", background: "transparent", cursor: "pointer",
                fontWeight: activeTab === tab ? 700 : 500,
                fontSize: 13,
                color: activeTab === tab ? G.gold : G.muted,
                borderBottom: activeTab === tab ? `2.5px solid ${G.gold}` : "2.5px solid transparent",
                transition: "all 0.18s",
                textTransform: "capitalize",
              }}>
              {tab === "posts" ? `📝 Posts (${posts.length})` :
               tab === "listings" ? `📦 Listings (${listings.length})` :
               "👤 About"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ────────────────────────────────────── */}
      <div style={{ padding: "12px" }}>

        {activeTab === "posts" && (
          <div>
            {posts.length === 0 ? (
              <EmptyState emoji="📝" title="No posts yet" sub="Share something with your community!" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {posts.map(post => (
                  <MiniPostCard key={post.id} post={post} timeAgo={timeAgo} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "listings" && (
          <div>
            {listings.length === 0 ? (
              <EmptyState emoji="📦" title="No listings yet" sub="List your first product to start selling!" />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {listings.map(product => (
                  <MiniProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div style={{
            background: G.white, borderRadius: 16,
            border: `1px solid ${G.border}`, overflow: "hidden",
          }}>
            {[
              { icon: "📛", label: "Full Name", value: profile?.displayName },
              { icon: "📧", label: "Email", value: firebaseUser.email },
              { icon: "📱", label: "Phone", value: profile?.phone },
              { icon: "📍", label: "Location", value: profile?.location },
              { icon: "🏪", label: "Business", value: profile?.businessName },
              { icon: "📅", label: "Member since", value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : undefined },
            ].filter(f => f.value).map((field, i, arr) => (
              <div key={field.label} style={{
                padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 12,
                borderBottom: i < arr.length - 1 ? `1px solid ${G.border}` : "none",
              }}>
                <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{field.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: G.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {field.label}
                  </p>
                  <p style={{ margin: 0, fontSize: 14, color: G.text, fontWeight: 500, marginTop: 2 }}>
                    {field.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Powered By ─────────────────────────────────────── */}
      <div style={{
        margin: "24px 12px 12px",
        padding: "18px 16px",
        background: G.white,
        border: `1px solid ${G.border}`,
        borderRadius: 16,
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 6,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        <p style={{ margin: 0, fontSize: 10, color: G.muted, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
          Powered by
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "#fff",
            fontFamily: "'Playfair Display', serif",
          }}>V</div>
          <p style={{
            margin: 0, fontSize: 15, fontWeight: 800, color: G.text,
            fontFamily: "'Playfair Display', serif", letterSpacing: 0.5,
          }}>
            VAF{" "}
            <span style={{
              background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>UBWENGE</span>{" "}
            TECH
          </p>
        </div>
        <p style={{ margin: 0, fontSize: 11, color: G.muted }}>
          Building digital solutions for Africa 🌍
        </p>
      </div>

      {/* ── Edit Profile Modal ──────────────────────────────── */}
      {editing && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 300,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "flex-end",
        }}>
          <div style={{
            width: "100%", maxHeight: "90vh",
            background: G.white, borderRadius: "20px 20px 0 0",
            padding: "20px 16px 32px",
            overflowY: "auto",
          }}>
            <div style={{ width: 36, height: 4, background: G.border, borderRadius: 2, margin: "0 auto 16px" }} />
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18, fontWeight: 700, color: G.text,
              textAlign: "center", marginBottom: 20,
            }}>Edit Profile</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Full Name *", val: editName, set: setEditName, placeholder: "Your full name" },
                { label: "Bio", val: editBio, set: setEditBio, placeholder: "Tell the world about yourself..." },
                { label: "Location", val: editLoc, set: setEditLoc, placeholder: "City, Country" },
                { label: "Phone", val: editPhone, set: setEditPhone, placeholder: "+250 788 000 000" },
                { label: "Business Name", val: editBiz, set: setEditBiz, placeholder: "Your business or store name" },
              ].map(field => (
                <div key={field.label}>
                  <label style={{
                    fontSize: 11, color: G.muted, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: 0.5,
                    display: "block", marginBottom: 6,
                  }}>{field.label}</label>
                  {field.label === "Bio" ? (
                    <textarea value={field.val} onChange={e => field.set(e.target.value)}
                      placeholder={field.placeholder} rows={3}
                      style={{
                        width: "100%", boxSizing: "border-box",
                        padding: "12px 14px", background: G.inputBg,
                        border: `1.5px solid ${G.border}`, borderRadius: 10,
                        fontSize: 14, color: G.text, outline: "none", resize: "none",
                      }} />
                  ) : (
                    <input value={field.val} onChange={e => field.set(e.target.value)}
                      placeholder={field.placeholder}
                      style={{
                        width: "100%", boxSizing: "border-box",
                        padding: "12px 14px", background: G.inputBg,
                        border: `1.5px solid ${G.border}`, borderRadius: 10,
                        fontSize: 14, color: G.text, outline: "none",
                      }} />
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={saveProfile} disabled={saving}
                style={{
                  flex: 1, padding: "13px",
                  background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                  border: "none", borderRadius: 12, color: "#fff",
                  fontWeight: 700, fontSize: 15, cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.6 : 1,
                  boxShadow: "0 3px 14px rgba(201,151,58,0.35)",
                }}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={() => setEditing(false)}
                style={{
                  flex: 1, padding: "13px",
                  background: G.bg, border: `1.5px solid ${G.border}`,
                  borderRadius: 12, color: G.muted,
                  fontWeight: 600, fontSize: 15, cursor: "pointer",
                }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Panel ──────────────────────────────────── */}
      {showSettings && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 300,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "flex-end",
        }}>
          <div style={{
            width: "100%",
            background: G.white, borderRadius: "20px 20px 0 0",
            padding: "20px 16px 40px",
          }}>
            <div style={{ width: 36, height: 4, background: G.border, borderRadius: 2, margin: "0 auto 16px" }} />
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18, fontWeight: 700, color: G.text,
              textAlign: "center", marginBottom: 20,
            }}>Settings</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { icon: "✏️", label: "Edit Profile", action: () => { setShowSettings(false); setEditing(true); } },
                { icon: "🔔", label: "Notifications", action: () => setShowSettings(false) },
                { icon: "🔒", label: "Privacy & Security", action: () => setShowSettings(false) },
                { icon: "🌍", label: "Language & Region", action: () => setShowSettings(false) },
                { icon: "💳", label: "Payment Methods", action: () => setShowSettings(false) },
                { icon: "❓", label: "Help & Support", action: () => setShowSettings(false) },
                { icon: "ℹ️", label: "About Digital World", action: () => setShowSettings(false) },
              ].map((item, i) => (
                <button key={i} onClick={item.action}
                  style={{
                    width: "100%", padding: "14px 12px",
                    background: "none", border: "none",
                    display: "flex", alignItems: "center", gap: 12,
                    cursor: "pointer", borderRadius: 10,
                    color: G.text, fontSize: 14, fontWeight: 500,
                    transition: "background 0.15s",
                    textAlign: "left",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = G.bg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <span style={{ fontSize: 20, width: 28 }}>{item.icon}</span>
                  {item.label}
                  <span style={{ marginLeft: "auto", color: G.muted, fontSize: 16 }}>›</span>
                </button>
              ))}

              <div style={{ height: 1, background: G.border, margin: "8px 0" }} />

              <button onClick={handleSignOut}
                style={{
                  width: "100%", padding: "14px 12px",
                  background: "none", border: "none",
                  display: "flex", alignItems: "center", gap: 12,
                  cursor: "pointer", borderRadius: 10,
                  color: G.danger, fontSize: 14, fontWeight: 600,
                  transition: "background 0.15s",
                  textAlign: "left",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(220,38,38,0.05)")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                <span style={{ fontSize: 20, width: 28 }}>🚪</span>
                Sign Out
              </button>
            </div>

            <button onClick={() => setShowSettings(false)}
              style={{
                width: "100%", marginTop: 14, padding: "12px",
                background: G.bg, border: `1.5px solid ${G.border}`,
                borderRadius: 12, color: G.muted,
                fontWeight: 600, fontSize: 14, cursor: "pointer",
              }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mini Cards ───────────────────────────────────────────────────────────────
function MiniPostCard({ post, timeAgo }: { post: Post; timeAgo: (ts: string) => string }) {
  return (
    <div style={{
      background: G.white, borderRadius: 14,
      border: `1px solid ${G.border}`, padding: "13px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      {post.mediaUrls?.[0] && (
        <img src={post.mediaUrls[0]} alt="" style={{
          width: "100%", height: 140, objectFit: "cover",
          borderRadius: 10, marginBottom: 10,
        }} />
      )}
      {post.content && (
        <p style={{
          margin: "0 0 8px", fontSize: 13, color: G.text, lineHeight: 1.55,
          overflow: "hidden", textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
        } as any}>{post.content}</p>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 11, color: G.muted }}>{timeAgo(post.createdAt)}</span>
        <span style={{ fontSize: 12, color: G.muted }}>❤️ {post.likes}</span>
        <span style={{ fontSize: 12, color: G.muted }}>💬 {post.comments}</span>
      </div>
    </div>
  );
}

function MiniProductCard({ product }: { product: Product }) {
  return (
    <div style={{
      background: G.white, borderRadius: 14,
      border: `1px solid ${G.border}`, overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        height: 100, background: G.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 32, overflow: "hidden",
      }}>
        {product.images?.[0]
          ? <img src={product.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : "📦"}
      </div>
      <div style={{ padding: "8px 10px 10px" }}>
        <p style={{
          margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: G.text,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{product.title}</p>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: G.gold }}>
          {product.currency} {product.price.toLocaleString()}
        </p>
        <span style={{
          display: "inline-block", marginTop: 5,
          fontSize: 10, padding: "2px 7px", borderRadius: 8,
          background: product.status === "active" ? "rgba(22,163,74,0.1)" : "rgba(201,151,58,0.1)",
          color: product.status === "active" ? "#16A34A" : G.gold,
          fontWeight: 700,
        }}>
          {product.status === "active" ? "● Active" : "○ " + product.status}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ emoji, title, sub }: { emoji: string; title: string; sub: string }) {
  return (
    <div style={{
      background: G.white, borderRadius: 16, padding: "44px 24px", textAlign: "center",
      border: `1px solid ${G.border}`,
    }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{emoji}</div>
      <p style={{ fontWeight: 700, fontSize: 15, color: G.text, marginBottom: 6 }}>{title}</p>
      <p style={{ color: G.muted, fontSize: 13 }}>{sub}</p>
    </div>
  );
}