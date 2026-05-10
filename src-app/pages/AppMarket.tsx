import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, ProductCategory, CATEGORY_META } from '../types';
import { TabName } from '../App';

interface Props {
  firebaseUser: FirebaseUser | null;
  onNavigate: (tab: TabName) => void;
}

const G = {
  gold:    '#C9973A',
  goldL:   '#E8BB6A',
  white:   '#FFFFFF',
  bg:      '#F0EBE0',
  card:    '#FFFFFF',
  border:  '#E2D9C8',
  text:    '#1A1209',
  muted:   '#7A6A52',
  inputBg: '#FAF7F2',
};

const SECTORS: { id: ProductCategory; label: string; emoji: string }[] = [
  { id: 'food',        label: 'Food',      emoji: '🍗' },
  { id: 'hospitality', label: 'Hotels',    emoji: '🏨' },
  { id: 'minerals',    label: 'Minerals',  emoji: '⛏️' },
  { id: 'automobile',  label: 'Cars',      emoji: '🚗' },
  { id: 'realestate',  label: 'Property',  emoji: '🏡' },
  { id: 'services',    label: 'Services',  emoji: '🧹' },
  { id: 'talent',      label: 'Talent',    emoji: '🎯' },
  { id: 'other',       label: 'Other',     emoji: '📦' },
];

export default function AppMarket({ firebaseUser, onNavigate }: Props) {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');

  useEffect(() => { fetchProducts(); }, [activeCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let q;
      if (activeCategory === 'all') {
        q = query(
          collection(db, 'products'),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc'),
          limit(40)
        );
      } else {
        q = query(
          collection(db, 'products'),
          where('status', '==', 'active'),
          where('category', '==', activeCategory),
          orderBy('createdAt', 'desc'),
          limit(40)
        );
      }
      const snap = await getDocs(q);
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = search.trim()
    ? products.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  return (
    <div style={{ background: G.bg, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        background: G.white, borderBottom: `1px solid ${G.border}`,
        padding: '14px 16px 12px',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20, fontWeight: 700, margin: 0,
            background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Marketplace</h2>
          <button onClick={() => onNavigate('profile')}
            style={{
              background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
              border: 'none', borderRadius: 20, padding: '7px 14px',
              color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(201,151,58,0.35)',
            }}>+ List Item</button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products, services…"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 12px 10px 36px',
              background: G.inputBg, border: `1.5px solid ${G.border}`,
              borderRadius: 12, color: G.text, fontSize: 14, outline: 'none',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = G.gold; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,151,58,0.12)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
          <button onClick={() => setActiveCategory('all')}
            style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: 20, fontSize: 12,
              border: activeCategory === 'all' ? 'none' : `1.5px solid ${G.border}`,
              background: activeCategory === 'all' ? `linear-gradient(135deg, ${G.gold}, ${G.goldL})` : G.white,
              color: activeCategory === 'all' ? '#fff' : G.muted,
              cursor: 'pointer', fontWeight: activeCategory === 'all' ? 700 : 400,
              boxShadow: activeCategory === 'all' ? '0 2px 8px rgba(201,151,58,0.3)' : 'none',
            }}>🌍 All</button>
          {SECTORS.map(s => (
            <button key={s.id} onClick={() => setActiveCategory(s.id)}
              style={{
                flexShrink: 0, padding: '6px 14px', borderRadius: 20, fontSize: 12,
                border: activeCategory === s.id ? 'none' : `1.5px solid ${G.border}`,
                background: activeCategory === s.id ? `linear-gradient(135deg, ${G.gold}, ${G.goldL})` : G.white,
                color: activeCategory === s.id ? '#fff' : G.muted,
                cursor: 'pointer', fontWeight: activeCategory === s.id ? 700 : 400,
                whiteSpace: 'nowrap',
                boxShadow: activeCategory === s.id ? '0 2px 8px rgba(201,151,58,0.3)' : 'none',
              }}>{s.emoji} {s.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: G.text }}>
            {activeCategory === 'all' ? 'All Products & Services' : CATEGORY_META[activeCategory]?.label}
          </h3>
          <span style={{ fontSize: 12, color: G.muted }}>{filtered.length} listings</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: G.muted }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <EmptyState category={activeCategory} onNavigate={onNavigate} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const meta = CATEGORY_META[product.category];
  return (
    <div style={{
      background: '#FFFFFF', borderRadius: 14,
      border: '1px solid #E2D9C8', overflow: 'hidden', cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      transition: 'box-shadow 0.15s, transform 0.15s',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(201,151,58,0.15)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
    >
      {/* Image */}
      <div style={{ height: 118, background: '#F0EBE0', position: 'relative', overflow: 'hidden' }}>
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 36,
          }}>{meta?.emoji}</div>
        )}
        {product.listingType === 'auction' && (
          <span style={{
            position: 'absolute', top: 6, right: 6,
            background: `linear-gradient(135deg, #C9973A, #E8BB6A)`,
            borderRadius: 6, padding: '2px 7px', fontSize: 9,
            color: '#fff', fontWeight: 700,
          }}>AUCTION</span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '9px 10px 11px' }}>
        <p style={{
          margin: '0 0 3px', fontSize: 12, fontWeight: 700, color: '#1A1209',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{product.title}</p>
        <p style={{ margin: '0 0 6px', fontSize: 10, color: '#7A6A52' }}>📍 {product.location}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#C9973A' }}>
            {product.currency} {product.price.toLocaleString()}
          </span>
          {product.negotiable && (
            <span style={{ fontSize: 9, color: '#16A34A', fontWeight: 700 }}>Negotiable</span>
          )}
        </div>
        <p style={{ margin: '5px 0 0', fontSize: 10, color: '#A89880' }}>by {product.sellerName}</p>
      </div>
    </div>
  );
}

function EmptyState({ category, onNavigate }: { category: ProductCategory | 'all'; onNavigate: (t: TabName) => void }) {
  const meta = category !== 'all' ? CATEGORY_META[category] : null;
  return (
    <div style={{
      background: '#FFFFFF', borderRadius: 16, padding: '44px 24px', textAlign: 'center',
      border: '1px solid #E2D9C8', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{meta?.emoji || '🛒'}</div>
      <p style={{ color: '#1A1209', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No listings yet</p>
      <p style={{ color: '#7A6A52', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
        {meta ? `No ${meta.label} listings posted yet.` : 'No products listed yet.'} Be the first!
      </p>
      <button onClick={() => onNavigate('profile')}
        style={{
          background: 'linear-gradient(135deg, #C9973A, #E8BB6A)',
          border: 'none', borderRadius: 12, color: '#fff',
          padding: '12px 28px', fontSize: 14, fontWeight: 700,
          cursor: 'pointer', boxShadow: '0 4px 14px rgba(201,151,58,0.4)',
        }}>+ List Your Product</button>
    </div>
  );
}