import { useState, useEffect } from "react";
import { User as FirebaseUser, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { User, UserRole, Product, CATEGORY_META } from "../types";
import { TabName } from "../App";

interface Props {
  firebaseUser: FirebaseUser | null;
  onNavigate: (tab: TabName) => void;
}

export default function AppProfile({ firebaseUser, onNavigate }: Props) {
  const [profile, setProfile]       = useState<User | null>(null);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [editMode, setEditMode]     = useState(false);
  const [form, setForm]             = useState<Partial<User>>({});
  const [activeTab, setActiveTabLocal] = useState<"listings" | "orders" | "about">("listings");

  useEffect(() => {
    if (firebaseUser) loadProfile();
    else setLoading(false);
  }, [firebaseUser]);

  const loadProfile = async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const ref = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as User;
        setProfile(data);
        setForm(data);
      } else {
        const newUser: User = {
          id: firebaseUser.uid,
          displayName: firebaseUser.displayName || "New User",
          photoURL: firebaseUser.photoURL || undefined,
          role: "buyer",
          verified: false,
          rating: 0,
          reviewCount: 0,
          createdAt: new Date().toISOString(),
        };
        await setDoc(ref, newUser);
        setProfile(newUser);
        setForm(newUser);
        setEditMode(true);
      }
      const pq = query(collection(db, "products"), where("sellerId", "==", firebaseUser.uid), orderBy("createdAt", "desc"));
      const psnap = await getDocs(pq);
      setMyProducts(psnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const saveProfile = async () => {
    if (!firebaseUser) return;
    setSaving(true);
    try {
      const updated: Partial<User> = {
        displayName: form.displayName,
        bio: form.bio,
        role: form.role,
        location: form.location,
        phone: form.phone,
        businessName: form.businessName,
      };
      await setDoc(doc(db, "users", firebaseUser.uid), { ...profile, ...updated }, { merge: true });
      setProfile(prev => ({ ...prev!, ...updated }));
      setEditMode(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const deleteProduct = async (productId: string) => {
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, "products", productId));
      setMyProducts(prev => prev.filter(p => p.id !== productId));
    } catch (e) { console.error(e); }
  };

  if (!firebaseUser || loading) return (
    <div style={{ background: "#0A0A0F", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#555570", fontFamily: "sans-serif" }}>
        {!firebaseUser ? "Please sign in" : "Loading profile..."}
      </p>
    </div>
  );

  if (editMode) return (
    <div style={{ background: "#0A0A0F", minHeight: "100vh", color: "#F0F0F5" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,15,0.95)",
        backdropFilter: "blur(12px)", borderBottom: "1px solid #1A1A2E", padding: "14px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => setEditMode(false)}
          style={{ background: "none", border: "none", color: "#555570", fontSize: 22, cursor: "pointer" }}>←</button>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: "sans-serif" }}>Edit Profile</h2>
        <button onClick={saveProfile}
          style={{ background: saving ? "#333" : "linear-gradient(135deg, #FF6B35, #F7931E)",
            border: "none", borderRadius: 8, padding: "7px 18px",
            color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" }}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, color: "#888", fontFamily: "sans-serif", display: "block", marginBottom: 8 }}>
            Account Type
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {([["buyer","🛒 Buyer"],["seller","🏪 Seller"],["both","🔄 Both"]] as [UserRole, string][]).map(([r, l]) => (
              <button key={r} onClick={() => setForm(f => ({ ...f, role: r }))}
                style={{ flex: 1, padding: "10px 4px", borderRadius: 10,
                  border: form.role === r ? "none" : "1px solid #1E1E2E",
                  background: form.role === r ? "linear-gradient(135deg,#FF6B35,#F7931E)" : "#111118",
                  color: form.role === r ? "#fff" : "#888",
                  fontSize: 12, fontFamily: "sans-serif", cursor: "pointer", fontWeight: 700 }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {field("Display Name", "displayName", "Your full name or business name", form, setForm)}
        {field("Bio", "bio", "Tell people about yourself...", form, setForm, true)}
        {field("Location", "location", "City, Country", form, setForm)}
        {field("Phone / WhatsApp", "phone", "+250 700 000 000", form, setForm)}
        {(form.role === "seller" || form.role === "both") &&
          field("Business Name", "businessName", "Your shop or company name", form, setForm)}
      </div>
    </div>
  );

  return (
    <div style={{ background: "#0A0A0F", minHeight: "100vh", color: "#F0F0F5" }}>
      <div style={{ background: "linear-gradient(180deg, #1A0A00 0%, #0A0A0F 100%)", padding: "20px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button onClick={() => signOut(auth)}
            style={{ background: "#1A1A2E", border: "none", borderRadius: 8,
              padding: "6px 14px", color: "#888", fontSize: 12, cursor: "pointer", fontFamily: "sans-serif" }}>
            Sign out
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 14 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg, #FF6B35, #F7931E)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, border: "3px solid #FF6B35", overflow: "hidden", flexShrink: 0 }}>
            {profile?.photoURL
              ? <img src={profile.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : profile?.displayName?.charAt(0) || "?"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: "sans-serif" }}>
                {profile?.displayName}
              </h2>
              {profile?.verified && <span style={{ color: "#4ECDC4", fontSize: 16 }}>✓</span>}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
              <RoleBadge role={profile?.role || "buyer"} />
              {profile?.location && (
                <span style={{ fontSize: 11, color: "#555570", fontFamily: "sans-serif" }}>📍 {profile.location}</span>
              )}
            </div>
          </div>
          <button onClick={() => setEditMode(true)}
            style={{ background: "#1A1A2E", border: "1px solid #2E2E4E", borderRadius: 10,
              padding: "8px 14px", color: "#F0F0F5", fontSize: 13, cursor: "pointer", fontFamily: "sans-serif" }}>
            ✏️ Edit
          </button>
        </div>

        {profile?.bio && (
          <p style={{ margin: "0 0 14px", fontSize: 13, color: "#AAA", fontFamily: "sans-serif", lineHeight: 1.5 }}>
            {profile.bio}
          </p>
        )}

        <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
          {[
            { label: "Listings", value: myProducts.length },
            { label: "Rating", value: profile?.rating ? `${profile.rating.toFixed(1)}★` : "—" },
            { label: "Reviews", value: profile?.reviewCount || 0 },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "sans-serif", color: "#FF6B35" }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: "#555570", fontFamily: "sans-serif" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <button onClick={() => onNavigate("market")}
          style={{ width: "100%", background: "linear-gradient(135deg, #FF6B35, #F7931E)",
            border: "none", borderRadius: 12, padding: "12px 0", color: "#fff",
            fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif", marginBottom: 16 }}>
          + List New Product
        </button>

        <div style={{ display: "flex", borderTop: "1px solid #1A1A2E" }}>
          {(["listings","orders","about"] as const).map(t => (
            <button key={t} onClick={() => setActiveTabLocal(t)}
              style={{ flex: 1, padding: "12px 0", background: "none", border: "none",
                cursor: "pointer", fontFamily: "sans-serif", fontSize: 13, fontWeight: 600,
                color: activeTab === t ? "#FF6B35" : "#555570",
                borderBottom: activeTab === t ? "2px solid #FF6B35" : "2px solid transparent" }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {activeTab === "listings" && (
          myProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#555570", fontFamily: "sans-serif" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
              <p>No products listed yet.</p>
              <p style={{ fontSize: 12 }}>Tap "+ List New Product" above to get started.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {myProducts.map(p => (
                <MiniProductCard key={p.id} product={p} onDelete={() => deleteProduct(p.id)} />
              ))}
            </div>
          )
        )}
        {activeTab === "orders" && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#555570", fontFamily: "sans-serif" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
            <p>Order history coming soon.</p>
          </div>
        )}
        {activeTab === "about" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <InfoRow icon="📍" label="Location" value={profile?.location || "—"} />
            <InfoRow icon="📞" label="Phone" value={profile?.phone || "—"} />
            <InfoRow icon="🏪" label="Business" value={profile?.businessName || "—"} />
            <InfoRow icon="📅" label="Member since" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"} />
          </div>
        )}
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const map: Record<UserRole, [string, string]> = {
    buyer:  ["🛒 Buyer", "#4ECDC4"],
    seller: ["🏪 Seller", "#FF6B35"],
    both:   ["🔄 Buyer & Seller", "#C77DFF"],
  };
  const [label, color] = map[role];
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6,
      background: color + "22", color, fontFamily: "sans-serif", fontWeight: 700 }}>
      {label}
    </span>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ background: "#111118", borderRadius: 10, padding: "12px 14px",
      display: "flex", gap: 10, alignItems: "center" }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div>
        <p style={{ margin: 0, fontSize: 11, color: "#555570", fontFamily: "sans-serif" }}>{label}</p>
        <p style={{ margin: 0, fontSize: 14, color: "#F0F0F5", fontFamily: "sans-serif", fontWeight: 500 }}>{value}</p>
      </div>
    </div>
  );
}

function MiniProductCard({ product, onDelete }: { product: Product; onDelete: () => void }) {
  const meta = CATEGORY_META[product.category];
  return (
    <div style={{ background: "#111118", borderRadius: 12, overflow: "hidden", border: "1px solid #1A1A2E", position: "relative" }}>
      <div style={{ height: 90, background: "#1A1A2E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
        {product.images?.[0]
          ? <img src={product.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : meta?.emoji}
      </div>
      <div style={{ padding: "8px 10px" }}>
        <p style={{ margin: "0 0 3px", fontSize: 12, fontWeight: 700, color: "#F0F0F5",
          fontFamily: "sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {product.title}
        </p>
        <p style={{ margin: "0 0 4px", fontSize: 12, color: "#FF6B35", fontFamily: "sans-serif", fontWeight: 700 }}>
          {product.currency} {product.price.toLocaleString()}
        </p>
        <button onClick={onDelete}
          style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)",
            borderRadius: 6, padding: "4px 10px", color: "#FF5050",
            fontSize: 11, cursor: "pointer", fontFamily: "sans-serif" }}>
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

function field(label: string, key: keyof User, placeholder: string,
  form: Partial<User>, setForm: (fn: (f: Partial<User>) => Partial<User>) => void, multiline = false) {
  return (
    <div key={key}>
      <label style={{ fontSize: 12, color: "#888", fontFamily: "sans-serif", display: "block", marginBottom: 6 }}>{label}</label>
      {multiline ? (
        <textarea value={(form[key] as string) || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={placeholder} rows={3}
          style={{ width: "100%", boxSizing: "border-box", padding: "12px", background: "#111118",
            border: "1px solid #1E1E2E", borderRadius: 10, color: "#F0F0F5",
            fontSize: 14, fontFamily: "sans-serif", outline: "none", resize: "none" }} />
      ) : (
        <input value={(form[key] as string) || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={placeholder}
          style={{ width: "100%", boxSizing: "border-box", padding: "12px", background: "#111118",
            border: "1px solid #1E1E2E", borderRadius: 10, color: "#F0F0F5",
            fontSize: 14, fontFamily: "sans-serif", outline: "none" }} />
      )}
    </div>
  );
}
