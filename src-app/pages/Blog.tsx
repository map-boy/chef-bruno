// FILE: src/pages/Blog.tsx
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { BlogPost } from '../types';
import { PenLine, Clock, ArrowRight, Tag, Loader2 } from 'lucide-react';

const categoryColors: Record<string, string> = {
  Branding:   'bg-amber-100 text-amber-700',
  Techniques: 'bg-blue-100 text-blue-700',
  Business:   'bg-emerald-100 text-emerald-700',
  Innovation: 'bg-purple-100 text-purple-700',
  Mindset:    'bg-rose-100 text-rose-700',
  Ethics:     'bg-stone-100 text-stone-600',
};

const allCategories = ['All', 'Branding', 'Techniques', 'Business', 'Innovation', 'Mindset', 'Ethics'];

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    document.title = 'Blog | Chef Bruno';
    const q = query(collection(db, 'blog'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const filtered = activeFilter === 'All' ? posts : posts.filter(p => p.category === activeFilter);
  const featured = filtered.filter(p => p.featured);
  const regular  = filtered.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      {/* Header — compact for mobile app */}
      <div className="bg-[#1A1A1A] pt-14 pb-8 px-5 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center">
            <PenLine size={16} className="text-[#C9973A]" />
          </div>
          <span className="text-[#C9973A] text-[10px] font-bold uppercase tracking-[0.35em]">Chef Bruno Journal</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-white mt-3 leading-tight">
          The Culinary Blog
        </h1>
        <p className="text-stone-400 text-sm mt-2 leading-relaxed">
          Insights from the intersection of food, business, and culture.
        </p>
      </div>

      {/* Filter tabs — horizontal scroll */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-20">
        <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
          {allCategories.map(cat => (
            <button key={cat} onClick={() => setActiveFilter(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                activeFilter === cat
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'text-stone-500 border-stone-200 bg-transparent'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-amber-600" size={32} />
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-20">
            <PenLine size={36} className="text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 font-serif text-lg">Articles coming soon</p>
            <p className="text-stone-400 text-sm mt-1">Chef Bruno's blog is being written and curated.</p>
          </div>
        )}

        {/* Featured posts */}
        {featured.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9973A] flex items-center gap-2">
              <span className="w-5 h-px bg-[#C9973A]" /> Featured
            </p>
            {featured.map(post => (
              <div key={post.id}
                className="bg-[#1A1A1A] rounded-2xl p-5 relative overflow-hidden group active:scale-[0.98] transition-transform cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${categoryColors[post.category] || 'bg-stone-100 text-stone-600'}`}>
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-stone-500 text-[10px]">
                    <Clock size={10} /> {post.readTime}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-white mb-2 leading-snug">{post.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-1 text-[#C9973A] text-[10px] font-bold uppercase tracking-widest mt-4">
                  Read Article <ArrowRight size={11} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Regular posts */}
        {regular.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 flex items-center gap-2">
              <span className="w-5 h-px bg-stone-300" />
              {activeFilter === 'All' ? 'All Articles' : activeFilter}
            </p>
            <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 divide-y divide-stone-100">
              {regular.map((post, i) => (
                <div key={post.id}
                  className="p-4 flex items-start gap-4 active:bg-stone-50 transition-colors cursor-pointer group">
                  <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 text-[10px] font-bold shrink-0 group-active:bg-[#C9973A] group-active:text-white transition-all">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${categoryColors[post.category] || 'bg-stone-100 text-stone-600'}`}>
                        {post.category}
                      </span>
                      <span className="text-stone-400 text-[10px] flex items-center gap-1">
                        <Clock size={9} /> {post.readTime}
                      </span>
                    </div>
                    <h3 className="font-serif text-base font-bold text-[#1A1A1A] leading-snug line-clamp-2">{post.title}</h3>
                  </div>
                  <ArrowRight size={14} className="text-stone-300 shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && filtered.length === 0 && posts.length > 0 && (
          <div className="text-center py-16">
            <Tag size={32} className="text-stone-300 mx-auto mb-3" />
            <p className="text-stone-400 font-serif">No articles in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;