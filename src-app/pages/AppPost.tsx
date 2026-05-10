import { useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { ProductCategory, CATEGORY_META } from "../types";

const G = {
  gold:    "#C9973A",
  goldL:   "#E8BB6A",
  white:   "#FFFFFF",
  bg:      "#F0EBE0",
  card:    "#FFFFFF",
  border:  "#E2D9C8",
  text:    "#1A1209",
  muted:   "#7A6A52",
  inputBg: "#FAF7F2",
};

interface Props {
  firebaseUser: FirebaseUser | null;
  onClose: () => void;
}

type Mode = "post" | "product";
const CURRENCIES = ["RWF", "USD", "EUR", "KES", "UGX", "TZS", "GBP"];
const LISTING_TYPES = [
  { id: "sale",    label: "For Sale", emoji: "🏷️" },
  { id: "rent",    label: "For Rent", emoji: "🔑" },
  { id: "auction", label: "Auction",  emoji: "🔨" },
  { id: "service", label: "Service",  emoji: "🛠️" },
];

export default function AppPost({ firebaseUser, onClose }: Props) {
  const [mode, setMode]         = useState<Mode>("post");
  const [submitting, setSub]    = useState(false);
  const [success, setSuccess]   = useState(false);
  const [userRole, setUserRole]  = useState<string>("buyer");

  const [postText, setPostText]     = useState("");
  const [postImages, setPostImages] = useState<File[]>([]);
  const [title, setTitle]           = useState("");
  const [description, setDesc]      = useState("");
  const [category, setCategory]     = useState<ProductCategory>("food");
  const [listingType, setLType]     = useState("sale");
  const [price, setPrice]           = useState("");
  const [currency, setCurrency]     = useState("RWF");
  const [negotiable, setNegotiable] = useState(false);
  const [location, setLoc]          = useState("");
  const [country, setCountry]       = useState("");
  const [images, setImages]         = useState<File[]>([]);
  const [tags, setTags]             = useState("");

  useEffect(() => {
    if (!firebaseUser) return;
    getDoc(doc(db, "users", firebaseUser.uid)).then(snap => {
      if (snap.exists()) setUserRole(snap.data().role || "buyer");
    });
  }, [firebaseUser]);

  if (!firebaseUser) return (
    <Overlay onClose={onClose}>
      <p style={{ color: G.muted, textAlign: "center", padding: 40 }}>Please sign in to post.</p>
      <button onClick={onClose} style={cancelBtnStyle}>Close</button>
    </Overlay>
  );

  if (success) return (
    <Overlay onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "40px 0" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "rgba(22,163,74,0.1)", border: "3px solid rgba(22,163,74,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
        }}>✅</div>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: G.text }}>
          {mode === "post" ? "Post Published!" : "Product Listed!"}
        </p>
        <p style={{ color: G.muted, fontSize: 13, textAlign: "center", lineHeight: 1.5 }}>
          {mode === "product" ? "Your product is now live on the marketplace." : "Your post is visible in the feed."}
        </p>
        <button onClick={onClose} style={{
          background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
          border: "none", borderRadius: 12, padding: "13px 40px",
          color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 3px 14px rgba(201,151,58,0.35)",
        }}>Done</button>
      </div>
    </Overlay>
  );

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files.slice(0, 4)) {
      const r = ref(storage, `uploads/${firebaseUser.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(r, file);
      urls.push(await getDownloadURL(r));
    }
    return urls;
  };

  const submitPost = async () => {
    if (!postText.trim() && postImages.length === 0) return;
    setSub(true);
    try {
      const mediaUrls = postImages.length > 0 ? await uploadImages(postImages) : [];
      await addDoc(collection(db, "posts"), {
        authorId: firebaseUser.uid,
        authorName: firebaseUser.displayName || "User",
        authorPhoto: firebaseUser.photoURL || null,
        authorRole: userRole,
        type: postImages.length > 0 ? "image" : "text",
        content: postText.trim(),
        mediaUrls,
        likes: 0, comments: 0, shares: 0, likedBy: [],
        createdAt: new Date().toISOString(),
      });
      setSuccess(true);
    } catch (e) { console.error(e); }
    finally { setSub(false); }
  };

  const submitProduct = async () => {
    if (!title.trim() || !price) return;
    setSub(true);
    try {
      const imageUrls = images.length > 0 ? await uploadImages(images) : [];
      await addDoc(collection(db, "products"), {
        sellerId: firebaseUser.uid,
        sellerName: firebaseUser.displayName || "User",
        sellerPhoto: firebaseUser.photoURL || null,
        title: title.trim(), description: description.trim(),
        category, listingType, status: "active",
        price: parseFloat(price), currency, negotiable,
        images: imageUrls,
        location: location.trim(), country: country.trim(),
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        views: 0, likes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setSuccess(true);
    } catch (e) { console.error(e); }
    finally { setSub(false); }
  };

  return (
    <Overlay onClose={onClose}>
      {/* Mode tabs */}
      <div style={{
        display: "flex", background: G.bg, borderRadius: 12, padding: 3, marginBottom: 20,
      }}>
        {(["post", "product"] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
              background: mode === m ? G.white : "transparent",
              color: mode === m ? G.gold : G.muted,
              fontWeight: mode === m ? 700 : 500, fontSize: 14,
              cursor: "pointer",
              boxShadow: mode === m ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.2s",
            }}>
            {m === "post" ? "📝 Post" : "📦 List Product"}
          </button>
        ))}
      </div>

      {/* Form */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 12 }}>
        {mode === "post" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Author row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, color: "#fff", fontWeight: 700, flexShrink: 0, overflow: "hidden",
              }}>
                {firebaseUser.photoURL
                  ? <img src={firebaseUser.photoURL} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  : firebaseUser.displayName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: G.text }}>
                  {firebaseUser.displayName || "User"}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: G.muted }}>Posting to Digital World</p>
              </div>
            </div>

            <textarea value={postText} onChange={e => setPostText(e.target.value)}
              placeholder="What are you selling or sharing today?"
              rows={5}
              style={{
                width: "100%", boxSizing: "border-box", padding: "13px",
                background: G.inputBg, border: `1.5px solid ${G.border}`,
                borderRadius: 12, color: G.text, fontSize: 15,
                outline: "none", resize: "none", lineHeight: 1.6,
              }} />
            <ImagePickerGold onSelect={setPostImages} max={4} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Category */}
            <div>
              <FieldLabel>Category</FieldLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {(Object.keys(CATEGORY_META) as ProductCategory[]).map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)}
                    style={{
                      padding: "10px 4px", borderRadius: 12,
                      border: `1.5px solid ${category === cat ? G.gold : G.border}`,
                      background: category === cat ? "rgba(201,151,58,0.08)" : G.white,
                      cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                      transition: "all 0.18s",
                    }}>
                    <span style={{ fontSize: 22 }}>{CATEGORY_META[cat].emoji}</span>
                    <span style={{ fontSize: 9, color: category === cat ? G.gold : G.muted, fontWeight: category === cat ? 700 : 400 }}>
                      {CATEGORY_META[cat].label.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Listing type */}
            <div>
              <FieldLabel>Listing Type</FieldLabel>
              <div style={{ display: "flex", gap: 8 }}>
                {LISTING_TYPES.map(lt => (
                  <button key={lt.id} onClick={() => setLType(lt.id)}
                    style={{
                      flex: 1, padding: "9px 4px", borderRadius: 10,
                      border: `1.5px solid ${listingType === lt.id ? G.gold : G.border}`,
                      background: listingType === lt.id ? "rgba(201,151,58,0.08)" : G.white,
                      color: listingType === lt.id ? G.gold : G.muted,
                      fontSize: 11, fontWeight: listingType === lt.id ? 700 : 500,
                      cursor: "pointer", transition: "all 0.18s",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                    }}>
                    <span style={{ fontSize: 18 }}>{lt.emoji}</span>
                    {lt.label}
                  </button>
                ))}
              </div>
            </div>

            <GoldField label="Title *" value={title} onChange={setTitle} placeholder="e.g. Gold nuggets 50g, Toyota Corolla 2019..." />
            <GoldField label="Description" value={description} onChange={setDesc} placeholder="Describe your product in detail..." multiline />

            {/* Price */}
            <div>
              <FieldLabel>Price *</FieldLabel>
              <div style={{ display: "flex", gap: 8 }}>
                <select value={currency} onChange={e => setCurrency(e.target.value)}
                  style={{
                    padding: "12px 10px",
                    background: G.inputBg, border: `1.5px solid ${G.border}`,
                    borderRadius: 10, color: G.text, fontSize: 13, outline: "none",
                  }}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0"
                  style={{
                    flex: 1, padding: "12px 14px",
                    background: G.inputBg, border: `1.5px solid ${G.border}`,
                    borderRadius: 10, color: G.text, fontSize: 14, outline: "none",
                  }} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={negotiable} onChange={e => setNegotiable(e.target.checked)}
                  style={{ accentColor: G.gold, width: 16, height: 16 }} />
                <span style={{ color: G.muted, fontSize: 13 }}>Price negotiable</span>
              </label>
            </div>

            <GoldField label="City / Location" value={location} onChange={setLoc} placeholder="e.g. Kigali, Nairobi, Lagos..." />
            <GoldField label="Country" value={country} onChange={setCountry} placeholder="e.g. Rwanda, Kenya, Nigeria..." />
            <GoldField label="Tags (comma separated)" value={tags} onChange={setTags} placeholder="gold, raw, certified..." />
            <ImagePickerGold onSelect={setImages} max={4} />
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={mode === "post" ? submitPost : submitProduct}
        disabled={submitting}
        style={{
          width: "100%", marginTop: 14, padding: "14px 0",
          background: submitting ? G.bg : `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
          border: submitting ? `1.5px solid ${G.border}` : "none",
          borderRadius: 12, color: submitting ? G.muted : "#fff",
          fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
          boxShadow: submitting ? "none" : "0 3px 14px rgba(201,151,58,0.35)",
          transition: "all 0.2s",
        }}>
        {submitting ? "Publishing…" : mode === "post" ? "📤 Publish Post" : "🛒 List Product"}
      </button>
      <button onClick={onClose} style={cancelBtnStyle}>Cancel</button>
    </Overlay>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "flex-end",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        width: "100%", maxHeight: "94vh",
        background: G.white, borderRadius: "22px 22px 0 0",
        padding: "16px 16px 32px",
        display: "flex", flexDirection: "column", overflowY: "auto",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
      }}>
        {/* Handle */}
        <div style={{
          width: 40, height: 4, background: G.border,
          borderRadius: 2, margin: "0 auto 16px",
        }} />
        {children}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      margin: "0 0 7px", fontSize: 11, color: G.muted,
      fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5,
    }}>{children}</p>
  );
}

function GoldField({ label, value, onChange, placeholder, multiline = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) {
  const base: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", padding: "12px 14px",
    background: G.inputBg, border: `1.5px solid ${G.border}`,
    borderRadius: 10, color: G.text, fontSize: 14, outline: "none",
  };
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} rows={3}
            style={{ ...base, resize: "none" }} />
        : <input value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} style={base} />
      }
    </div>
  );
}

function ImagePickerGold({ onSelect, max }: { onSelect: (f: File[]) => void; max: number }) {
  const [previews, setPreviews] = useState<string[]>([]);
  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, max);
    onSelect(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };
  return (
    <div>
      <FieldLabel>Photos (up to {max})</FieldLabel>
      <label style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        border: `2px dashed rgba(201,151,58,0.4)`,
        borderRadius: 12, padding: 14, cursor: "pointer",
        color: G.gold, fontSize: 14, fontWeight: 600,
        background: "rgba(201,151,58,0.04)",
        transition: "background 0.15s",
      }}>
        📷 Add Photos
        <input type="file" accept="image/*" multiple onChange={pick} style={{ display: "none" }} />
      </label>
      {previews.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          {previews.map((p, i) => (
            <img key={i} src={p} alt="" style={{
              width: 70, height: 70, objectFit: "cover",
              borderRadius: 10, border: `1.5px solid ${G.border}`,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}


const cancelBtnStyle: React.CSSProperties = {
  width: "100%", marginTop: 8, padding: "12px 0",
  background: "none", border: `1.5px solid ${G.border}`,
  borderRadius: 12, color: G.muted,
  fontSize: 14, cursor: "pointer", fontWeight: 500,
};