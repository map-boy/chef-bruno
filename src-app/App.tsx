import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import AppHome    from "./pages/AppHome";
import AppReels   from "./pages/AppReels";
import AppMarket  from "./pages/AppMarket";
import AppChat    from "./pages/AppChat";
import AppProfile from "./pages/AppProfile";
import AppNotifications from "./pages/AppNotifications";
import AppPost    from "./pages/AppPost";
import BottomNav  from "./components/BottomNav";

export type TabName = "home" | "reels" | "market" | "chat" | "notifications" | "profile";

const G = {
  gold:    "#C9973A",
  goldL:   "#E8BB6A",
  goldD:   "#A07830",
  white:   "#FFFFFF",
  offWhite:"#F5F0E8",
  bg:      "#F0EBE0",
  card:    "#FFFFFF",
  border:  "#E2D9C8",
  text:    "#1A1209",
  muted:   "#7A6A52",
  inputBg: "#FAF7F2",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: ${G.bg};
    color: ${G.text};
    -webkit-font-smoothing: antialiased;
  }

  input, textarea, select, button { font-family: inherit; }

  input::placeholder, textarea::placeholder { color: ${G.muted}; opacity: 0.7; }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${G.gold}; border-radius: 4px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .fade-up { animation: fadeUp 0.45s cubic-bezier(.22,1,.36,1) both; }
  .fade-up-2 { animation: fadeUp 0.45s 0.08s cubic-bezier(.22,1,.36,1) both; }
  .fade-up-3 { animation: fadeUp 0.45s 0.16s cubic-bezier(.22,1,.36,1) both; }
  .fade-up-4 { animation: fadeUp 0.45s 0.24s cubic-bezier(.22,1,.36,1) both; }

  .gold-btn {
    background: linear-gradient(135deg, ${G.gold}, ${G.goldL});
    color: #fff;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: filter 0.18s, transform 0.12s;
    box-shadow: 0 3px 14px rgba(201,151,58,0.35);
  }
  .gold-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .gold-btn:active { transform: translateY(0); filter: brightness(0.96); }
  .gold-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  .ghost-btn {
    background: transparent;
    border: 1.5px solid ${G.border};
    border-radius: 10px;
    color: ${G.muted};
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.18s, color 0.18s;
  }
  .ghost-btn:hover { border-color: ${G.gold}; color: ${G.gold}; }

  .input-field {
    width: 100%;
    padding: 13px 16px;
    background: ${G.inputBg};
    border: 1.5px solid ${G.border};
    border-radius: 10px;
    font-size: 14px;
    color: ${G.text};
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .input-field:focus {
    border-color: ${G.gold};
    box-shadow: 0 0 0 3px rgba(201,151,58,0.12);
  }

  .card {
    background: ${G.card};
    border-radius: 14px;
    border: 1px solid ${G.border};
    box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  }

  .gold-text {
    background: linear-gradient(135deg, ${G.gold}, ${G.goldL});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

// ─── Splash / Loading ─────────────────────────────────────────────────────────
function Splash() {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: G.white,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 18,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 36, boxShadow: "0 8px 30px rgba(201,151,58,0.4)",
      }}>🌍</div>
      <div>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: G.gold, textAlign: "center", fontWeight: 700 }}>
          Digital World
        </p>
        <p style={{ color: G.muted, fontSize: 12, textAlign: "center", marginTop: 2, letterSpacing: 1 }}>
          GLOBAL MARKETPLACE
        </p>
      </div>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        border: `3px solid ${G.border}`,
        borderTopColor: G.gold,
        animation: "spin 0.8s linear infinite",
        marginTop: 8,
      }} />
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [role, setRole]             = useState<"buyer" | "seller">("buyer");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  const handleRegister = async () => {
    setError("");
    if (!name.trim())        { setError("Enter your full name"); return; }
    if (!email.trim())       { setError("Enter your email"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(result.user, { displayName: name.trim() });
      await setDoc(doc(db, "users", result.user.uid), {
        id: result.user.uid, displayName: name.trim(),
        photoURL: "", role, verified: false,
        rating: 0, reviewCount: 0, createdAt: new Date().toISOString(),
      });
    } catch (e: any) {
      const code = e.code || "";
      if (code === "auth/email-already-in-use") { setError("Email already registered. Sign in instead."); setIsRegister(false); }
      else if (code === "auth/invalid-email") setError("Invalid email address.");
      else if (code === "auth/weak-password") setError("Use at least 6 characters.");
      else setError("Registration failed. Try again.");
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setError("");
    if (!email.trim()) { setError("Enter your email"); return; }
    if (!password)     { setError("Enter your password"); return; }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e: any) {
      const code = e.code || "";
      if (code === "auth/user-not-found" || code === "auth/invalid-credential") setError("Wrong email or password.");
      else if (code === "auth/wrong-password") setError("Wrong password.");
      else if (code === "auth/too-many-requests") setError("Too many attempts. Try again later.");
      else setError("Login failed. Try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${G.offWhite} 0%, ${G.bg} 100%)`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "32px 20px",
    }}>
      {/* Logo */}
      <div className="fade-up" style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{
          width: 76, height: 76, borderRadius: 22, margin: "0 auto 14px",
          background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, boxShadow: "0 8px 32px rgba(201,151,58,0.4)",
        }}>🌍</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: G.text, fontWeight: 700 }}>
          Digital World
        </h1>
        <p style={{ color: G.muted, fontSize: 13, marginTop: 4 }}>
          Minerals · Cars · Real Estate · Food · Hotels
        </p>
      </div>

      {/* Card */}
      <div className="card fade-up-2" style={{ width: "100%", maxWidth: 380, padding: 28 }}>
        {/* Tab toggle */}
        <div style={{
          display: "flex", background: G.bg, borderRadius: 10, padding: 3, marginBottom: 24,
        }}>
          {["Sign In", "Register"].map((label, i) => {
            const active = isRegister === (i === 1);
            return (
              <button key={label} onClick={() => { setIsRegister(i === 1); setError(""); }}
                style={{
                  flex: 1, padding: "9px", borderRadius: 8, border: "none",
                  background: active ? G.white : "transparent",
                  color: active ? G.gold : G.muted,
                  fontWeight: active ? 700 : 400, fontSize: 14,
                  cursor: "pointer",
                  boxShadow: active ? "0 1px 6px rgba(0,0,0,0.07)" : "none",
                  transition: "all 0.2s",
                }}>
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {isRegister && (
            <div>
              <label style={{ fontSize: 12, color: G.muted, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Full Name</label>
              <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
            </div>
          )}

          {isRegister && (
            <div>
              <label style={{ fontSize: 12, color: G.muted, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>I am a</label>
              <div style={{ display: "flex", gap: 8 }}>
                {(["buyer", "seller"] as const).map(r => (
                  <button key={r} onClick={() => setRole(r)} style={{
                    flex: 1, padding: "10px", borderRadius: 10,
                    border: `1.5px solid ${role === r ? G.gold : G.border}`,
                    background: role === r ? `rgba(201,151,58,0.08)` : G.white,
                    color: role === r ? G.gold : G.muted,
                    fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.18s",
                  }}>
                    {r === "buyer" ? "🛒 Buyer" : "🏪 Seller"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, color: G.muted, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Email</label>
            <input className="input-field" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email" />
          </div>

          <div>
            <label style={{ fontSize: 12, color: G.muted, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Password</label>
            <input className="input-field" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" type="password"
              onKeyDown={e => e.key === "Enter" && (isRegister ? handleRegister() : handleLogin())} />
          </div>

          {error && (
            <div style={{
              background: "rgba(220,50,50,0.07)", border: "1px solid rgba(220,50,50,0.2)",
              borderRadius: 8, padding: "10px 14px",
              color: "#C53030", fontSize: 13, textAlign: "center",
            }}>{error}</div>
          )}

          <button className="gold-btn" onClick={isRegister ? handleRegister : handleLogin}
            disabled={loading}
            style={{ width: "100%", padding: "14px 0", marginTop: 4 }}>
            {loading ? "Please wait…" : isRegister ? "Create Account" : "Sign In"}
          </button>
        </div>
      </div>

      <p className="fade-up-3" style={{ marginTop: 18, color: G.muted, fontSize: 13 }}>
        {isRegister ? "Already have an account? " : "New to Digital World? "}
        <button onClick={() => { setIsRegister(!isRegister); setError(""); }}
          style={{ background: "none", border: "none", color: G.gold, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
          {isRegister ? "Sign In" : "Create Account"}
        </button>
      </p>
    </div>
  );
}

// ─── Main App Shell ───────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab]       = useState<TabName>("home");
  const [showPost, setShowPost]         = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading]   = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
    });
  }, []);

  // Inject global styles
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
    return () => { document.head.removeChild(styleEl); };
  }, []);

  if (authLoading) return <Splash />;
  if (!firebaseUser) return <AuthScreen />;

  const renderPage = () => {
    switch (activeTab) {
      case "home":          return <AppHome          firebaseUser={firebaseUser} onNavigate={setActiveTab} onOpenPost={() => setShowPost(true)} />;
      case "reels":         return <AppReels         firebaseUser={firebaseUser} />;
      case "market":        return <AppMarket        firebaseUser={firebaseUser} onNavigate={setActiveTab} />;
      case "chat":          return <AppChat          firebaseUser={firebaseUser} />;
      case "notifications": return <AppNotifications firebaseUser={firebaseUser} />;
      case "profile":       return <AppProfile       firebaseUser={firebaseUser} onNavigate={setActiveTab} />;
      default:              return <AppHome          firebaseUser={firebaseUser} onNavigate={setActiveTab} onOpenPost={() => setShowPost(true)} />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: G.bg, overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {renderPage()}
      </div>

      {/* Floating Post Button — only on Home tab */}
      {!showPost && activeTab === "home" && (
        <button
          onClick={() => setShowPost(true)}
          className="gold-btn"
          style={{
            position: "fixed", bottom: 80, right: 18, zIndex: 100,
            width: 52, height: 52, borderRadius: "50%",
            fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center",
            padding: 0, boxShadow: "0 6px 24px rgba(201,151,58,0.5)",
          }}>
          +
        </button>
      )}

      {showPost && <AppPost firebaseUser={firebaseUser} onClose={() => setShowPost(false)} />}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} firebaseUser={firebaseUser} />
    </div>
  );
}