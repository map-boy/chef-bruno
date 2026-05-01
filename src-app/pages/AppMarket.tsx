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

const SECTORS: { id: ProductCategory; label: string; emoji: string; bg: string }[] = [
  { id: 'food',        label: 'Food & Catering',  emoji: '🍗', bg: 'linear-gradient(135deg,#FF6B35,#FF8C42)' },
  { id: 'hospitality', label: 'Hotels & Stays',   emoji: '🏨', bg: 'linear-gradient(135deg,#4ECDC4,#44AF9A)' },
  { id: 'minerals',    label: 'Minerals & Oil',   emoji: '⛏️', bg: 'linear-gradient(135deg,#FFD700,#FFA500)' },
  { id: 'automobile',  label: 'Automobiles',      emoji: '🚗', bg: 'linear-gradient(135deg,#2E86AB,#1D6FA4)' },
  { id: 'realestate',  label: 'Real Estate',      emoji: '🏡', bg: 'linear-gradient(135deg,#A8DADC,#6DB4B8)' },
  { id: 'services',    label: 'Services',         emoji: '🧹', bg: 'linear-gradient(135deg,#C77DFF,#9B59B6)' },
  { id: 'talent',      label: 'Talent & Career',  emoji: '🎯', bg: 'linear-gradient(135deg,#06D6A0,#04A07A)' },
  { id: 'other',       label: 'Other',            emoji: '📦', bg: 'linear-gradient(135deg,#6C757D,#495057)' },
];

export default function AppMarket({ firebaseUser, onNavigate }: Props) {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState('');

  useEffect(() => {
    fetchProducts();
  }, [activeCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let q;
      if (activeCategory === 'all') {
        q = query(collection(db, 'products'), where('status', '==', 'active'), orderBy('createdAt', 'desc'), limit(40));
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = search.trim()
    ? products.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  return (
    <div style={{ background: '#0A0A0F', minHeight: '100vh', color: '#F0F0F5' }}>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1A1A2E',
        padding: '14px 16px 12px',
      }}>
        <h2 style={{
          margin: '0 0 12px', fontSize: 20, fontWeight: 800,
          fontFamily: "'Syne', sans-serif",
          background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          🛒 Marketplace
        </h2>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products, services..."
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 12px 10px 38px',
              background: '#111118', border: '1px solid #1E1E2E',
              borderRadius: 12, color: '#F0F0F5', fontSize: 14,
              fontFamily: 'sans-serif', outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Sectors Grid */}
      <div style={{ padding: 16 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20,
        }}>
          <button
            onClick={() => setActiveCategory('all')}
            style={{
              background: activeCategory === 'all' ? 'linear-gradient(135deg,#FF6B35,#F7931E)' : '#111118',
              border: activeCategory === 'all' ? 'none' : '1px solid #1E1E2E',
              borderRadius: 12, padding: '12px 4px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}
          >
            <span style={{ fontSize: 22 }}>🌍</span>
            <span style={{ fontSize: 10, color: activeCategory === 'all' ? '#fff' : '#888', fontFamily: 'sans-serif' }}>All</span>
          </button>
          {SECTORS.map(sector => (
            <button
              key={sector.id}
              onClick={() => setActiveCategory(sector.id)}
              style={{
                background: activeCategory === sector.id ? sector.bg : '#111118',
                border: activeCategory === sector.id ? 'none' : '1px solid #1E1E2E',
                borderRadius: 12, padding: '12px 4px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ fontSize: 22 }}>{sector.emoji}</span>
              <span style={{
                fontSize: 9, color: activeCategory === sector.id ? '#fff' : '#888',
                fontFamily: 'sans-serif', textAlign: 'center', lineHeight: 1.2,
              }}>{sector.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Active Category Label */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: 'sans-serif', color: '#F0F0F5' }}>
            {activeCategory === 'all' ? 'All Products & Services' : CATEGORY_META[activeCategory]?.label}
          </h3>
          <span style={{ fontSize: 12, color: '#555570', fontFamily: 'sans-serif' }}>
            {filtered.length} listings
          </span>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#555570' }}>Loading...</div>
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

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const meta = CATEGORY_META[product.category];
  return (
    <div style={{
      background: '#111118', borderRadius: 14,
      border: '1px solid #1A1A2E', overflow: 'hidden', cursor: 'pointer',
    }}>
      {/* Image */}
      <div style={{
        height: 120, background: '#1A1A2E',
        position: 'relative', overflow: 'hidden',
      }}>
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
          }}>{meta?.emoji}</div>
        )}
        {/* Category badge */}
        <span style={{
          position: 'absolute', top: 6, left: 6,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          borderRadius: 6, padding: '2px 7px', fontSize: 10,
          color: meta?.color, fontFamily: 'sans-serif', fontWeight: 700,
        }}>
          {meta?.emoji} {meta?.label}
        </span>
        {product.listingType === 'auction' && (
          <span style={{
            position: 'absolute', top: 6, right: 6,
            background: '#FF6B35', borderRadius: 6,
            padding: '2px 7px', fontSize: 10, color: '#fff', fontFamily: 'sans-serif',
          }}>AUCTION</span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '10px 10px 12px' }}>
        <p style={{
          margin: '0 0 4px', fontSize: 13, fontWeight: 700,
          color: '#F0F0F5', fontFamily: 'sans-serif',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{product.title}</p>
        <p style={{
          margin: '0 0 8px', fontSize: 11, color: '#555570', fontFamily: 'sans-serif',
        }}>📍 {product.location}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: 14, fontWeight: 800, color: '#FF6B35', fontFamily: 'sans-serif',
          }}>
            {product.currency} {product.price.toLocaleString()}
          </span>
          {product.negotiable && (
            <span style={{ fontSize: 10, color: '#06D6A0', fontFamily: 'sans-serif' }}>Negotiable</span>
          )}
        </div>
        {/* Seller */}
        <p style={{ margin: '6px 0 0', fontSize: 11, color: '#444460', fontFamily: 'sans-serif' }}>
          by {product.sellerName}
        </p>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ category, onNavigate }: { category: ProductCategory | 'all'; onNavigate: (t: TabName) => void }) {
  const meta = category !== 'all' ? CATEGORY_META[category] : null;
  return (
    <div style={{
      background: '#111118', borderRadius: 16, padding: '40px 24px', textAlign: 'center',
      border: '1px solid #1A1A2E',
    }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{meta?.emoji || '🛒'}</div>
      <p style={{ color: '#F0F0F5', fontWeight: 700, fontFamily: 'sans-serif', marginBottom: 8 }}>
        No listings yet
      </p>
      <p style={{ color: '#555570', fontSize: 13, fontFamily: 'sans-serif', marginBottom: 20 }}>
        {meta ? `No ${meta.label} listings posted yet.` : 'No products listed yet.'} Be the first!
      </p>
      <button
        onClick={() => onNavigate('profile')}
        style={{
          background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
          border: 'none', borderRadius: 12, color: '#fff',
          padding: '12px 28px', fontSize: 14, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'sans-serif',
        }}
      >
        + List Your Product
      </button>
    </div>
  );
}