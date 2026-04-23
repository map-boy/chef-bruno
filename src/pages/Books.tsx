// FILE: src/pages/Books.tsx
import React, { useEffect } from 'react';
import { BookOpen, ChevronRight, Users, Star, ArrowRight } from 'lucide-react';

interface BookChapter { number: number; title: string; }
interface Book {
  id: number; title: string; subtitle: string; audience: string; purpose: string;
  chapters: BookChapter[]; accentColor: string; bgGradient: string; badgeColor: string;
}

const books: Book[] = [
  {
    id: 1, title: 'The Modern Chef', subtitle: 'A Guide to Culinary Mastery',
    audience: 'Professionals and entrepreneurs looking to pivot to the food industry',
    purpose: 'To provide a comprehensive roadmap for building a culinary presence and career.',
    chapters: [
      { number: 1, title: 'The Shift: Understanding the New Food Economy' },
      { number: 2, title: 'Identity: Crafting Your Culinary Persona' },
      { number: 3, title: 'Tools: The Essential Kitchen and Digital Stack' },
      { number: 4, title: 'Strategy: Building Systems for Culinary Growth' },
      { number: 5, title: 'Legacy: Creating Flavors that Endure' },
    ],
    accentColor: '#C9973A', bgGradient: 'from-amber-950 to-stone-950', badgeColor: 'bg-amber-600/20 text-amber-400 border-amber-600/40',
  },
  {
    id: 2, title: 'Flavor and Flow', subtitle: 'The Art of Technical Cooking',
    audience: 'Chefs, food scientists, and culinary artists',
    purpose: 'To bridge the gap between technical skill and culinary expression.',
    chapters: [
      { number: 1, title: 'Chemistry as a Medium' },
      { number: 2, title: 'The Aesthetics of the Plate' },
      { number: 3, title: 'Molecular Gastronomy and AI Collaboration' },
      { number: 4, title: 'Dining Experience as Storytelling' },
      { number: 5, title: 'The Future of the Creative Chef' },
    ],
    accentColor: '#7C2D2D', bgGradient: 'from-red-950 to-stone-950', badgeColor: 'bg-red-600/20 text-red-400 border-red-600/40',
  },
  {
    id: 3, title: 'Chef Bruno', subtitle: 'The Science of Culinary Influence',
    audience: 'Food creators and restaurant managers',
    purpose: 'To explore the psychological and technical aspects of building a loyal food community.',
    chapters: [
      { number: 1, title: 'The Psychology of Hunger and Attention' },
      { number: 2, title: 'Trust in the Age of Food Reviews' },
      { number: 3, title: 'Menu Pillars and Consistency' },
      { number: 4, title: 'Community over Customers' },
      { number: 5, title: 'Scaling Your Culinary Impact' },
    ],
    accentColor: '#1A6B4A', bgGradient: 'from-emerald-950 to-stone-950', badgeColor: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/40',
  },
];

const Books: React.FC = () => {
  useEffect(() => { document.title = 'Books | Chef Bruno Hotel & Culinary Center'; }, []);

  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      {/* Hero */}
      <div className="bg-[#1A1A1A] pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-amber-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-red-800 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 border border-amber-600/40 text-amber-500 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
            <BookOpen size={12} /> Chef Bruno Publications
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            The <span className="text-[#C9973A]">Culinary</span> Library
          </h1>
          <p className="text-stone-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Three books. One mission — to equip chefs, creators, and food entrepreneurs with the
            knowledge, strategy, and mindset to build lasting culinary legacies.
          </p>
        </div>
      </div>

      {/* Books */}
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-12">
        {books.map((book) => (
          <div key={book.id} className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-500 group">
            <div className="grid md:grid-cols-5">
              {/* Cover */}
              <div className={`md:col-span-2 bg-gradient-to-br ${book.bgGradient} p-10 flex flex-col justify-between min-h-64 relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-5">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <div key={j} className="absolute border border-white rounded-full"
                      style={{ width: `${(j+1)*80}px`, height: `${(j+1)*80}px`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                  ))}
                </div>
                <div className="relative z-10">
                  <span className={`text-[9px] font-bold uppercase tracking-[0.3em] px-3 py-1.5 rounded-full border ${book.badgeColor}`}>Volume {book.id}</span>
                </div>
                <div className="relative z-10">
                  <p className="text-stone-400 text-[9px] uppercase tracking-[0.4em] font-bold mb-2">Chef Bruno</p>
                  <h2 className="font-serif text-3xl font-bold text-white leading-tight mb-1">{book.title}</h2>
                  <p className="text-stone-300 text-sm italic font-light">{book.subtitle}</p>
                </div>
                <div className="relative z-10 flex items-center gap-3 mt-6">
                  {[1,2,3,4,5].map(s => <Star key={s} size={12} className="text-amber-500 fill-amber-500" />)}
                </div>
              </div>

              {/* Details */}
              <div className="md:col-span-3 p-10 flex flex-col justify-between">
                <div>
                  <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-stone-50 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={14} className="text-stone-400" />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Target Audience</p>
                      </div>
                      <p className="text-stone-700 text-sm leading-relaxed">{book.audience}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen size={14} className="text-amber-600" />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600">Purpose</p>
                      </div>
                      <p className="text-stone-700 text-sm leading-relaxed">{book.purpose}</p>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 mb-4">Chapter Overview</p>
                  <div className="space-y-3">
                    {book.chapters.map(ch => (
                      <div key={ch.number} className="flex items-center gap-4 group/ch">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{ backgroundColor: `${book.accentColor}20`, color: book.accentColor, border: `1px solid ${book.accentColor}40` }}>
                          {ch.number}
                        </div>
                        <div className="flex-1 flex items-center justify-between border-b border-stone-100 pb-3">
                          <p className="text-stone-700 text-sm"><span className="font-medium">Chapter {ch.number} — </span>{ch.title}</p>
                          <ChevronRight size={14} className="text-stone-300 shrink-0 ml-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-8 pt-8 border-t border-stone-100">
                  <a href="/contact" className="inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-stone-800 text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all">
                    Pre-Register Interest <ArrowRight size={12} />
                  </a>
                  <span className="text-stone-400 text-xs">Publication date TBA</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-[#1A1A1A] py-20 px-6 text-center">
        <p className="text-stone-400 text-[10px] uppercase tracking-[0.4em] font-bold mb-4">Get Notified</p>
        <h2 className="font-serif text-3xl md:text-4xl text-white font-bold mb-6">Be the First to Read</h2>
        <p className="text-stone-500 max-w-xl mx-auto mb-8 leading-relaxed">
          These publications are currently in development. Contact us to express your interest.
        </p>
        <a href="/contact" className="inline-flex items-center gap-3 bg-[#C9973A] hover:bg-[#b08432] text-white px-10 py-4 text-[10px] font-bold uppercase tracking-widest transition-all">
          Get in Touch <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
};

export default Books;