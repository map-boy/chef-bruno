import { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, User, CATEGORY_META, ProductCategory } from '../types';
import { TabName } from '../App';

interface Props {
  firebaseUser: FirebaseUser | null;
  onNavigate: (tab: TabName) => void;
}

type SearchType = 'products' | 'sellers';

export default function AppExplore({ firebaseUser, onNavigate }: Props) {
  const [searchType, setSearchType] = useState<SearchType>('products');
  const [searchText, setSearchText] = useState('');
  const [category, setCategory]     = useState<ProductCategory | 'all'>('all');
  const [results, setResults]       = useState<(Product | User)[]>([]);
  const [loading, setLoading]       = useState(false);
  const [searched, setSearched]     = useState(false);

  const doSearch = async () => {
    if (!searchText.trim() && category === 'all') return;
    setLoading(true);
    setSearched(true);
    try {
      if (searchType === 'products') {
        let q;
        if (category !== 'all') {
          q = query(
            collection(db, 'products'),
            where('status', '==', 'active'),
            where('category', '==', category),
            orderBy('createdAt', 'desc'),
            limit(30)
          );
        } else {
          q = query(
            collection(db, 'products'),
            where('status', '==', 'active'),
            orderBy('createdAt', 'desc'),
            limit(30)
          );
        }
        const snap = await getDocs(q);
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
        const filtered = searchText.trim()
          ? all.filter(p =>
              p.title.toLowerCase().includes(searchText.toLowerCase()) ||
              p.description.toLowerCase().includes(searchText.toLowerCase()) ||
              p.location.toLowerCase().includes(searchText.toLowerCase())
            )
          : all;
        setResults(filtered);
      } else {
        // Search sellers
        const q = query(
          collection(db, 'users'),
          where('role', 'in', ['seller', 'both']),
          limit(30)
        );
        const snap = await getDocs(q);
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
        const filtered = searchText.trim()
          ? all.filter(u =>
              u.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
              (u.businessName || '').toLowerCase().includes(searchText.toLowerCase()) ||
              (u.location || '').toLowerCase().includes(searchText.toLowerCase())
            )
          : all;
        setResults(filtered);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#0A0A0F', minHeight: '100vh', color: '#F0F0F5' }}>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1A1A2E', padding: '14px 16px 12px',
      }}>
        <h2 style={{
          margin: '0 0 12px', fontSize: 20, fontWeight: 800,
          fontFamily: "'Syne', sans-serif",
          background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>🔍 Explore</h2>

        {/* Search Type Toggle */}
        <div style={{ display: 'flex', background: '#111118', borderRadius: 10, padding: 3, marginBottom: 12 }}>
          {(['products','sellers'] as SearchType[]).map(t => (
            <button
              key={t}
              onClick={() => { setSearchType(t); setResults([]); setSearched(false); }}
              style={{
                flex: 1, padding: '8px', borderRadius: 8, border: 'none',
                background: searchType === t ? 'linear-gradient(135deg,#FF6B35,#F7931E)' : 'transparent',
                color: searchType === t ? '#fff' : '#888',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'sans-serif',
              }}
            >
              {t === 'products' ? '📦 Products' : '👥 Sellers'}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder={searchType === 'products' ? 'Search products, location...' : 'Search sellers, businesses...'}
            style={{
              flex: 1, padding: '10px 12px',
              background: '#111118', border: '1px solid #1E1E2E',
              borderRadius: 10, color: '#F0F0F5', fontSize: 14,
              fontFamily: 'sans-serif', outline: 'none',
            }}
          />
          <button
            onClick={doSearch}
            style={{
              background: 'linear-gradient(135deg,#FF6B35,#F7931E)',
              border: 'none', borderRadius: 10, padding: '0 16px',
              color: '#fff', fontSize: 14, cursor: 'pointer',
            }}
          >Go</button>
        </div>

        {/* Category Filter (products only) */}
        {searchType === 'products' && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingTop: 10, scrollbarWidth: 'none' }}>
            <CatChip id="all" label="All" emoji="🌍" active={category === 'all'} onClick={() => setCategory('all')} />
            {(Object.keys(CATEGORY_META) as ProductCategory[]).map(cat => (
              <CatChip
                key={cat}
                id={cat}
                label={CATEGORY_META[cat].label.split(' ')[0]}
                emoji={CATEGORY_META[cat].emoji}
                active={category === cat}
                onClick={() => setCategory(cat)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div style={{ padding: 16 }}>
        {loading ? (
          <p style={{ color: '#555570', fontFamily: 'sans-serif', textAlign: 'center', paddingTop: 40 }}>Searching...</p>
        ) : !searched ? (
          <TrendingSuggestions onNavigate={onNavigate} />
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>😕</div>
            <p style={{ color: '#555570', fontFamily: 'sans-serif' }}>No results found. Try a different search.</p>
          </div>
        ) : searchType === 'products' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {(results as Product[]).map(p => (
              <ProductResult key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(results as User[]).map(u => (
              <SellerResult key={u.id} seller={u} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CatChip({ id, label, emoji, active, onClick }: { id: string; label: string; emoji: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0, padding: '5px 12px', borderRadius: 20, fontSize: 11,
        border: active ? 'none' : '1px solid #1E1E2E',
        background: active ? 'linear-gradient(135deg,#FF6B35,#F7931E)' : '#111118',
        color: active ? '#fff' : '#888', cursor: 'pointer', fontFamily: 'sans-serif',
        whiteSpace: 'nowrap',
      }}
    >
      {emoji} {label}
    </button>
  );
}

function ProductResult({ product }: { product: Product }) {
  const meta = CATEGORY_META[product.category];
  return (
    <div style={{ background: '#111118', borderRadius: 14, overflow: 'hidden', border: '1px solid #1A1A2E', cursor: 'pointer' }}>
      <div style={{ height: 100, background: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
        {product.images?.[0]
          ? <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : meta?.emoji}
      </div>
      <div style={{ padding: '8px 10px' }}>
        <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#F0F0F5', fontFamily: 'sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.title}</p>
        <p style={{ margin: '0 0 4px', fontSize: 11, color: '#555570', fontFamily: 'sans-serif' }}>📍 {product.location}</p>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#FF6B35', fontFamily: 'sans-serif' }}>
          {product.currency} {product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function SellerResult({ seller }: { seller: User }) {
  return (
    <div style={{
      background: '#111118', borderRadius: 14, padding: '14px 16px',
      border: '1px solid #1A1A2E', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg,#FF6B35,#F7931E)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        overflow: 'hidden',
      }}>
        {seller.photoURL
          ? <img src={seller.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : seller.displayName.charAt(0)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#F0F0F5', fontFamily: 'sans-serif' }}>{seller.displayName}</p>
          {seller.verified && <span style={{ color: '#4ECDC4', fontSize: 14 }}>✓</span>}
        </div>
        {seller.businessName && (
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888', fontFamily: 'sans-serif' }}>🏪 {seller.businessName}</p>
        )}
        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#555570', fontFamily: 'sans-serif' }}>
          📍 {seller.location || 'Location not set'} · ⭐ {seller.rating.toFixed(1)} ({seller.reviewCount} reviews)
        </p>
      </div>
      <span style={{ color: '#FF6B35', fontSize: 18 }}>›</span>
    </div>
  );
}

function TrendingSuggestions({ onNavigate }: { onNavigate: (t: TabName) => void }) {
  const trending = [
    { emoji: '🍗', label: 'Catering Services', cat: 'food' },
    { emoji: '🚗', label: 'Toyota Vehicles', cat: 'automobile' },
    { emoji: '🏡', label: 'Kigali Apartments', cat: 'realestate' },
    { emoji: '⛏️', label: 'Coltan & Gold', cat: 'minerals' },
    { emoji: '🏨', label: 'Hotel Rooms', cat: 'hospitality' },
    { emoji: '🎯', label: 'Tech Talent', cat: 'talent' },
  ];

  return (
    <div>
      <h3 style={{ margin: '0 0 14px', fontSize: 14, color: '#888', fontFamily: 'sans-serif', fontWeight: 600 }}>
        🔥 Trending Searches
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {trending.map((t, i) => (
          <button
            key={i}
            onClick={() => onNavigate('market')}
            style={{
              background: '#111118', border: '1px solid #1A1A2E',
              borderRadius: 12, padding: '12px 16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 22 }}>{t.emoji}</span>
            <span style={{ color: '#D0D0E0', fontFamily: 'sans-serif', fontSize: 14 }}>{t.label}</span>
            <span style={{ marginLeft: 'auto', color: '#555570', fontSize: 16 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}