// FILE: src/pages/Books.tsx
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Book } from '../types';
import { BookOpen, ChevronRight, Users, Star, ArrowRight, Loader2 } from 'lucide-react';

const defaultGradients = [
  { bg: 'from-amber-950 to-stone-950', accent: '#C9973A', badge: 'bg-amber-600/20 text-amber-400 border-amber-600/40' },
  { bg: 'from-red-950 to-stone-950',   accent: '#7C2D2D', badge: 'bg-red-600/20 text-red-400 border-red-600/40' },
  { bg: 'from-emerald-950 to-stone-950', accent: '#1A6B4A', badge: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/40' },
];

const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Books | Chef Bruno';
    const q = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setBooks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Book)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      {/* Header */}
      <div className="bg-[#1A1A1A] pt-14 pb-8 px-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center">
            <BookOpen size={16} className="text-[#C9973A]" />
          </div>
          <span className="text-[#C9973A] text-[10px] font-bold uppercase tracking-[0.35em]">Chef Bruno Publications</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-white mt-3 leading-tight">
          The Culinary Library
        </h1>
        <p className="text-stone-400 text-sm mt-2 leading-relaxed">
          Three books. One mission — to equip chefs and food entrepreneurs.
        </p>
      </div>

      <div className="px-4 py-6 space-y-4">
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-amber-600" size={32} />
          </div>
        )}

        {!loading && books.length === 0 && (
          <div className="text-center py-20">
            <BookOpen size={36} className="text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 font-serif text-lg">Books coming soon</p>
            <p className="text-stone-400 text-sm mt-1">Currently in development.</p>
          </div>
        )}

        {books.map((book, idx) => {
          const style = defaultGradients[idx % defaultGradients.length];
          const accent = book.accentColor || style.accent;
          const isOpen = expanded === book.id;
          const volume = book.volume || idx + 1;

          return (
            <div key={book.id} className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
              {/* Cover strip */}
              <div className={`bg-gradient-to-r ${book.bgGradient || style.bg} p-5 flex items-start justify-between`}>
                <div className="flex-1">
                  <span className={`text-[9px] font-bold uppercase tracking-[0.3em] px-2.5 py-1 rounded-full border ${book.badgeColor || style.badge}`}>
                    Volume {volume}
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-white mt-3 leading-tight">{book.title}</h2>
                  <p className="text-stone-300 text-sm italic mt-1">{book.subtitle}</p>
                  <div className="flex items-center gap-1 mt-3">
                    {[1,2,3,4,5].map(s => <Star key={s} size={11} className="text-amber-500 fill-amber-500" />)}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-stone-50 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Users size={12} className="text-stone-400" />
                      <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Audience</p>
                    </div>
                    <p className="text-stone-700 text-xs leading-relaxed">{book.audience}</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <BookOpen size={12} className="text-amber-600" />
                      <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600">Purpose</p>
                    </div>
                    <p className="text-stone-700 text-xs leading-relaxed">{book.purpose}</p>
                  </div>
                </div>

                {/* Chapters toggle */}
                {book.chapters?.length > 0 && (
                  <>
                    <button
                      onClick={() => setExpanded(isOpen ? null : book.id)}
                      className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-widest py-3 border-t border-stone-100"
                      style={{ color: accent }}
                    >
                      {isOpen ? 'Hide Chapters' : `View ${book.chapters.length} Chapters`}
                      <ChevronRight size={14} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="space-y-2 pb-1">
                        {book.chapters.map(ch => (
                          <div key={ch.number} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                              style={{ backgroundColor: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>
                              {ch.number}
                            </div>
                            <p className="text-stone-600 text-xs flex-1">
                              <span className="font-semibold">Ch. {ch.number} — </span>{ch.title}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-stone-400 text-xs">Publication date TBA</span>
                  <a href="/contact"
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white px-4 py-2 rounded-lg"
                    style={{ backgroundColor: accent }}>
                    Pre-Register <ArrowRight size={11} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Books;