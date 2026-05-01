import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import AppHome    from "./pages/AppHome";
import AppMarket  from "./pages/AppMarket";
import AppExplore from "./pages/AppExplore";
import AppChat    from "./pages/AppChat";
import AppProfile from "./pages/AppProfile";
import AppPost    from "./pages/AppPost";
import BottomNav  from "./components/BottomNav";

export type TabName = "home" | "market" | "explore" | "chat" | "profile";

export default function App() {
  const [activeTab, setActiveTab]       = useState<TabName>("home");
  const [showPost, setShowPost]         = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading]   = useState(true);
  const [isRegister, setIsRegister]     = useState(false);
  const [name, setName]                 = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [role, setRole]                 = useState<"buyer" | "seller">("buyer");
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
    });
  }, []);

  const handleRegister = async () => {
    setError("");
    if (!name.trim())          { setError("Enter your full name"); return; }
    if (!email.trim())         { setError("Enter your email"); return; }
    if (password.length < 6)   { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(result.user, { displayName: name.trim() });
      await setDoc(doc(db, "users", result.user.uid), {
        id: result.user.uid,
        displayName: name.trim(),
        photoURL: "",
        role: role,
        verified: false,
        rating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
      });
      // Firebase auto signs in after register — onAuthStateChanged will fire
    } catch (e: any) {
      console.error("Register error:", e);
      const code = e.code || "";
      if (code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in.");
        setIsRegister(false);
      } else if (code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else {
        setError("Registration failed: " + (e.message || code));
      }
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setError("");
    if (!email.trim())   { setError("Enter your email"); return; }
    if (!password)       { setError("Enter your password"); return; }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e: any) {
      console.error("Login error:", e);
      const code = e.code || "";
      if (code === "auth/user-not-found")       setError("No account found with this email.");
      else if (code === "auth/wrong-password")   setError("Wrong password. Try again.");
      else if (code === "auth/invalid-email")    setError("Invalid email address.");
      else if (code === "auth/too-many-requests") setError("Too many attempts. Try again later.");
      else if (code === "auth/invalid-credential") setError("Wrong email or password. Try again.");
      else setError("Login failed: " + (e.message || code));
    }
    setLoading(false);
  };

  if (authLoading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
      height:"100vh", background:"#0A0A0F", flexDirection:"column", gap:16 }}>
      <div style={{ fontSize:48 }}>🌍</div>
      <p style={{ color:"#FF6B35", fontFamily:"sans-serif", fontSize:14, letterSpacing:2 }}>
        DIGITAL WORLD
      </p>
    </div>
  );

  if (!firebaseUser) return (
    <div style={{ minHeight:"100vh", background:"#0A0A0F", display:"flex",
      flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 24px" }}>
      <div style={{ fontSize:56, marginBottom:12 }}>🌍</div>
      <h1 style={{ color:"#FF6B35", fontFamily:"sans-serif", fontSize:26,
        fontWeight:700, margin:"0 0 4px", letterSpacing:1 }}>DIGITAL WORLD</h1>
      <p style={{ color:"#666", fontFamily:"sans-serif", fontSize:13,
        marginBottom:36, textAlign:"center", lineHeight:1.6 }}>
        Minerals • Automobiles • Real Estate • Food • Hotels
      </p>

      <div style={{ width:"100%", maxWidth:360, background:"#111118",
        borderRadius:16, padding:24, border:"1px solid #1E1E2E" }}>
        <h2 style={{ color:"white", fontFamily:"sans-serif", fontSize:18,
          fontWeight:600, margin:"0 0 20px", textAlign:"center" }}>
          {isRegister ? "Create Account" : "Sign In"}
        </h2>

        {isRegister && (
          <div style={{ marginBottom:14 }}>
            <label style={{ color:"#888", fontSize:12, fontFamily:"sans-serif",
              display:"block", marginBottom:6 }}>Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              style={{ width:"100%", padding:"12px 14px", background:"#0A0A0F",
                border:"1px solid #2A2A3E", borderRadius:10, color:"white",
                fontFamily:"sans-serif", fontSize:14, boxSizing:"border-box" }} />
          </div>
        )}

        {isRegister && (
          <div style={{ marginBottom:14 }}>
            <label style={{ color:"#888", fontSize:12, fontFamily:"sans-serif",
              display:"block", marginBottom:6 }}>I am a</label>
            <div style={{ display:"flex", gap:10 }}>
              {(["buyer","seller"] as const).map(r => (
                <button key={r} onClick={() => setRole(r)}
                  style={{ flex:1, padding:"10px 0", borderRadius:10, border:"none",
                    cursor:"pointer", fontFamily:"sans-serif", fontSize:13, fontWeight:600,
                    background: role === r ? "linear-gradient(135deg,#FF6B35,#F7931E)" : "#1A1A2E",
                    color: role === r ? "white" : "#888" }}>
                  {r === "buyer" ? "🛒 Buyer" : "🏪 Seller"}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom:14 }}>
          <label style={{ color:"#888", fontSize:12, fontFamily:"sans-serif",
            display:"block", marginBottom:6 }}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com" type="email"
            style={{ width:"100%", padding:"12px 14px", background:"#0A0A0F",
              border:"1px solid #2A2A3E", borderRadius:10, color:"white",
              fontFamily:"sans-serif", fontSize:14, boxSizing:"border-box" }} />
        </div>

        <div style={{ marginBottom:20 }}>
          <label style={{ color:"#888", fontSize:12, fontFamily:"sans-serif",
            display:"block", marginBottom:6 }}>Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Min 6 characters" type="password"
            style={{ width:"100%", padding:"12px 14px", background:"#0A0A0F",
              border:"1px solid #2A2A3E", borderRadius:10, color:"white",
              fontFamily:"sans-serif", fontSize:14, boxSizing:"border-box" }} />
        </div>

        {error && (
          <div style={{ background:"rgba(255,80,80,0.1)", border:"1px solid rgba(255,80,80,0.3)",
            borderRadius:8, padding:"10px 14px", marginBottom:16,
            color:"#FF5050", fontFamily:"sans-serif", fontSize:13, textAlign:"center" }}>
            {error}
          </div>
        )}

        <button onClick={isRegister ? handleRegister : handleLogin} disabled={loading}
          style={{ width:"100%", padding:"14px 0",
            background: loading ? "#333" : "linear-gradient(135deg,#FF6B35,#F7931E)",
            border:"none", borderRadius:12, color:"white", fontFamily:"sans-serif",
            fontSize:16, fontWeight:700, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
        </button>

        <button onClick={() => { setIsRegister(!isRegister); setError(""); setName(""); setEmail(""); setPassword(""); }}
          style={{ width:"100%", marginTop:14, padding:"12px 0", background:"transparent",
            border:"none", color:"#FF6B35", fontFamily:"sans-serif",
            fontSize:14, cursor:"pointer" }}>
          {isRegister ? "Already have an account? Sign In" : "New here? Create Account"}
        </button>
      </div>
    </div>
  );

  const renderPage = () => {
    switch (activeTab) {
      case "home":    return <AppHome    firebaseUser={firebaseUser} onNavigate={setActiveTab} />;
      case "market":  return <AppMarket  firebaseUser={firebaseUser} onNavigate={setActiveTab} />;
      case "explore": return <AppExplore firebaseUser={firebaseUser} onNavigate={setActiveTab} />;
      case "chat":    return <AppChat    firebaseUser={firebaseUser} />;
      case "profile": return <AppProfile firebaseUser={firebaseUser} onNavigate={setActiveTab} />;
      default:        return <AppHome    firebaseUser={firebaseUser} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh",
      background:"#0A0A0F", overflow:"hidden" }}>
      <div style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
        {renderPage()}
      </div>
      {!showPost && (
        <button onClick={() => setShowPost(true)}
          style={{ position:"fixed", bottom:80, right:20, zIndex:100,
            width:52, height:52, borderRadius:"50%",
            background:"linear-gradient(135deg,#FF6B35,#F7931E)",
            border:"none", cursor:"pointer", fontSize:28,
            boxShadow:"0 4px 20px rgba(255,107,53,0.5)",
            display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>
          +
        </button>
      )}
      {showPost && <AppPost firebaseUser={firebaseUser} onClose={() => setShowPost(false)} />}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
