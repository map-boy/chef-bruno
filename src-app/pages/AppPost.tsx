import { useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { ProductCategory, CATEGORY_META } from "../types";

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

  const [postText, setPostText]   = useState("");
  const [postImages, setPostImages] = useState<File[]>([]);
  const [title, setTitle]         = useState("");
  const [description, setDesc]    = useState("");
  const [category, setCategory]   = useState<ProductCategory>("food");
  const [listingType, setLType]   = useState("sale");
  const [price, setPrice]         = useState("");
  const [currency, setCurrency]   = useState("RWF");
  const [negotiable, setNegotiable] = useState(false);
  const [location, setLoc]        = useState("");
  const [country, setCountry]     = useState("");
  const [images, setImages]       = useState<File[]>([]);
  const [tags, setTags]           = useState("");

  useEffect(() => {
    if (!firebaseUser) return;
    getDoc(doc(db, "users", firebaseUser.uid)).then(snap => {
      if (snap.exists()) setUserRole(snap.data().role || "buyer");
    });
  }, [firebaseUser]);

  if (!firebaseUser) return (
    <div style={overlay}>
      <div style={sheet}>
        <p style={{ color: "#F0F0F5", fontFamily: "sans-serif", textAlign: "center", padding: 40 }}>
          Please sign in to post.
        </p>
        <button onClick={onClose} style={cancelBtn}>Close</button>
      </div>
    </div>
  );

  if (success) return (
    <div style={overlay}>
      <div style={{ ...sheet, alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 56 }}>✅</div>
        <p style={{ color: "#F0F0F5", fontFamily: "sans-serif", fontWeight: 700, fontSize: 18 }}>
          {mode === "post" ? "Post published!" : "Product listed!"}
        </p>
        <p style={{ color: "#555570", fontFamily: "sans-serif", fontSize: 13, textAlign: "center" }}>
          {mode === "product" ? "Your product is now live on the marketplace." : "Your post is now visible in the feed."}
        </p>
        <button onClick={onClose} style={{
          background: "linear-gradient(135deg,#FF6B35,#F7931E)", border: "none",
          borderRadius: 12, padding: "12px 36px", color: "#fff",
          fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif",
        }}>Done</button>
      </div>
    </div>
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
        authorId:    firebaseUser.uid,
        authorName:  firebaseUser.displayName || "User",
        authorPhoto: firebaseUser.photoURL || null,
        authorRole:  userRole,
        type:        postImages.length > 0 ? "image" : "text",
        content:     postText.trim(),
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
        sellerId:    firebaseUser.uid,
        sellerName:  firebaseUser.displayName || "User",
        sellerPhoto: firebaseUser.photoURL || null,
        title:       title.trim(),
        description: description.trim(),
        category,
        listingType,
        status:      "active",
        price:       parseFloat(price),
        currency,
        negotiable,
        images:      imageUrls,
        location:    location.trim(),
        country:     country.trim(),
        tags:        tags.split(",").map(t => t.trim()).filter(Boolean),
        views: 0, likes: 0,
        createdAt:  new Date().toISOString(),
        updatedAt:  new Date().toISOString(),
      });
      setSuccess(true);
    } catch (e) { console.error(e); }
    finally { setSub(false); }
  };

  return (
    <div style={overlay}>
      <div style={sheet}>
        <div style={{ width: 36, height: 4, background: "#2E2E4E", borderRadius: 2, margin: "0 auto 16px" }} />

        <div style={{ display: "flex", background: "#111118", borderRadius: 12, padding: 3, marginBottom: 20 }}>
          {(["post","product"] as Mode[]).map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{
                flex: 1, padding: "9px 0", borderRadius: 10, border: "none",
                background: mode === m ? "linear-gradient(135deg,#FF6B35,#F7931E)" : "transparent",
                color: mode === m ? "#fff" : "#888",
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif",
              }}>
              {m === "post" ? "📝 Post" : "📦 List Product"}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 20 }}>
          {mode === "post" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <textarea value={postText} onChange={e => setPostText(e.target.value)}
                placeholder="What are you selling or sharing today?"
                rows={5}
                style={{ width: "100%", boxSizing: "border-box", padding: 12,
                  background: "#111118", border: "1px solid #1E1E2E", borderRadius: 12,
                  color: "#F0F0F5", fontSize: 15, fontFamily: "sans-serif", outline: "none", resize: "none" }} />
              <ImagePicker onSelect={setPostImages} max={4} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <Label>Category</Label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                  {(Object.keys(CATEGORY_META) as ProductCategory[]).map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)}
                      style={{ padding: "10px 4px", borderRadius: 10, border: "none",
                        background: category === cat ? "linear-gradient(135deg,#FF6B35,#F7931E)" : "#111118",
                        cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <span style={{ fontSize: 20 }}>{CATEGORY_META[cat].emoji}</span>
                      <span style={{ fontSize: 9, color: category === cat ? "#fff" : "#888", fontFamily: "sans-serif" }}>
                        {CATEGORY_META[cat].label.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Listing Type</Label>
                <div style={{ display: "flex", gap: 8 }}>
                  {LISTING_TYPES.map(lt => (
                    <button key={lt.id} onClick={() => setLType(lt.id)}
                      style={{ flex: 1, padding: "8px 4px", borderRadius: 10,
                        border: listingType === lt.id ? "none" : "1px solid #1E1E2E",
                        background: listingType === lt.id ? "linear-gradient(135deg,#FF6B35,#F7931E)" : "#111118",
                        color: listingType === lt.id ? "#fff" : "#888",
                        fontSize: 11, fontFamily: "sans-serif", cursor: "pointer" }}>
                      {lt.emoji}<br />{lt.label}
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Title *" value={title} onChange={setTitle} placeholder="e.g. Gold nuggets 50g, Toyota Corolla 2019..." />
              <Field label="Description" value={description} onChange={setDesc} placeholder="Describe your product in detail..." multiline />

              <div>
                <Label>Price *</Label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select value={currency} onChange={e => setCurrency(e.target.value)}
                    style={{ padding: "12px 8px", background: "#111118", border: "1px solid #1E1E2E",
                      borderRadius: 10, color: "#F0F0F5", fontSize: 13, fontFamily: "sans-serif" }}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0"
                    style={{ flex: 1, padding: "12px", background: "#111118", border: "1px solid #1E1E2E",
                      borderRadius: 10, color: "#F0F0F5", fontSize: 14, fontFamily: "sans-serif", outline: "none" }} />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={negotiable} onChange={e => setNegotiable(e.target.checked)} />
                  <span style={{ color: "#888", fontSize: 12, fontFamily: "sans-serif" }}>Price negotiable</span>
                </label>
              </div>

              <Field label="City / Location" value={location} onChange={setLoc} placeholder="e.g. Kigali, Nairobi, Lagos..." />
              <Field label="Country" value={country} onChange={setCountry} placeholder="e.g. Rwanda, Kenya, Nigeria..." />
              <Field label="Tags (comma separated)" value={tags} onChange={setTags} placeholder="gold, raw, certified..." />
              <ImagePicker onSelect={setImages} max={4} />
            </div>
          )}
        </div>

        <button onClick={mode === "post" ? submitPost : submitProduct} disabled={submitting}
          style={{ width: "100%", background: submitting ? "#333" : "linear-gradient(135deg,#FF6B35,#F7931E)",
            border: "none", borderRadius: 12, padding: "14px 0", color: "#fff",
            fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
            fontFamily: "sans-serif", marginTop: 12 }}>
          {submitting ? "Publishing..." : mode === "post" ? "📤 Publish Post" : "🛒 List Product"}
        </button>
        <button onClick={onClose} style={cancelBtn}>Cancel</button>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: "0 0 6px", fontSize: 12, color: "#888", fontFamily: "sans-serif" }}>{children}</p>;
}

function Field({ label, value, onChange, placeholder, multiline = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) {
  const base = {
    width: "100%", boxSizing: "border-box" as const, padding: "12px",
    background: "#111118", border: "1px solid #1E1E2E", borderRadius: 10,
    color: "#F0F0F5", fontSize: 14, fontFamily: "sans-serif", outline: "none",
  };
  return (
    <div>
      <Label>{label}</Label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...base, resize: "none" }} />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />
      }
    </div>
  );
}

function ImagePicker({ onSelect, max }: { onSelect: (f: File[]) => void; max: number }) {
  const [previews, setPreviews] = useState<string[]>([]);
  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, max);
    onSelect(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };
  return (
    <div>
      <Label>Photos (up to {max})</Label>
      <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        border: "2px dashed #2E2E4E", borderRadius: 12, padding: 14, cursor: "pointer",
        color: "#555570", fontFamily: "sans-serif", fontSize: 13 }}>
        📷 Add photos
        <input type="file" accept="image/*" multiple onChange={pick} style={{ display: "none" }} />
      </label>
      {previews.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          {previews.map((p, i) => (
            <img key={i} src={p} alt="" style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 8 }} />
          ))}
        </div>
      )}
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, zIndex: 200,
  background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
  display: "flex", alignItems: "flex-end",
};
const sheet: React.CSSProperties = {
  width: "100%", maxHeight: "92vh", background: "#0D0D18",
  borderRadius: "20px 20px 0 0", padding: "16px 16px 24px",
  display: "flex", flexDirection: "column", overflowY: "auto",
};
const cancelBtn: React.CSSProperties = {
  width: "100%", background: "none", border: "1px solid #1E1E2E",
  borderRadius: 12, padding: "12px 0", color: "#888",
  fontSize: 14, cursor: "pointer", fontFamily: "sans-serif", marginTop: 8,
};
