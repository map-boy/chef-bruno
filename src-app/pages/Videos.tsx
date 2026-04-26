// FILE: src/pages/Videos.tsx
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Video } from '../types';
import { Play, Users, Target, ChevronRight, Film, Loader2 } from 'lucide-react';

const categoryColors: Record<string, string> = {
  Brand:       'bg-amber-600/20 text-amber-500 border-amber-600/40',
  Tutorial:    'bg-blue-600/20 text-blue-400 border-blue-600/40',
  Education:   'bg-emerald-600/20 text-emerald-400 border-emerald-600/40',
  Business:    'bg-purple-600/20 text-purple-400 border-purple-600/40',
  Inspiration: 'bg-rose-600/20 text-rose-400 border-rose-600/40',
};

const categories = ['All', 'Brand', 'Tutorial', 'Education', 'Business', 'Inspiration'];

const Videos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Videos | Chef Bruno';
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Video)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const filtered = activeFilter === 'All' ? videos : videos.filter(v => v.category === activeFilter);

  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      {/* Header */}
      <div className="bg-[#1A1A1A] pt-14 pb-8 px-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center">
            <Film size={16} className="text-[#C9973A]" />
          </div>
          <span className="text-[#C9973A] text-[10px] font-bold uppercase tracking-[0.35em]">Content Library</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-white mt-3 leading-tight">
          Video Series
        </h1>
        <p className="text-stone-400 text-sm mt-2">
          Techniques, business, and inspiration — crafted for chefs worldwide.
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-20">
        <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
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

      <div className="px-4 py-6 space-y-4">
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-amber-600" size={32} />
          </div>
        )}

        {!loading && videos.length === 0 && (
          <div className="text-center py-20">
            <Film size={36} className="text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 font-serif text-lg">Videos coming soon</p>
            <p className="text-stone-400 text-sm mt-1">10 episodes in production.</p>
            <div className="flex justify-center gap-4 mt-6">
              <a href="https://tiktok.com/@shimirwabruno" target="_blank" rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#C9973A] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg">
                Follow on TikTok
              </a>
            </div>
          </div>
        )}

        {filtered.map((video, idx) => {
          const isOpen = expanded === video.id;
          const episode = video.episodeNumber || idx + 1;
          return (
            <div key={video.id} className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
              {/* Thumbnail / play area */}
              <div className="relative h-36 bg-gradient-to-br from-stone-800 to-stone-950 flex items-center justify-center">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60" />
                ) : null}
                <div className="relative z-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#C9973A]/20 border-2 border-[#C9973A]/60 flex items-center justify-center mx-auto">
                    <Play size={18} className="text-[#C9973A] ml-0.5" />
                  </div>
                  <p className="text-stone-400 text-[9px] uppercase tracking-widest font-bold mt-2">
                    Episode {episode}
                  </p>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${categoryColors[video.category] || 'bg-stone-100 text-stone-500 border-stone-200'}`}>
                    {video.category}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 text-[9px] text-stone-400 font-bold uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded">
                  {video.duration}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-serif text-lg font-bold text-[#1A1A1A] mb-1 leading-snug">{video.title}</h3>
                <p className="text-stone-500 text-sm mb-3 leading-relaxed line-clamp-2">{video.description}</p>

                <blockquote className="border-l-2 border-[#C9973A] pl-3 mb-3 text-stone-600 text-xs italic leading-relaxed">
                  "{video.hook}"
                </blockquote>

                <div className="flex flex-wrap gap-3 text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-3">
                  <span className="flex items-center gap-1"><Users size={10} /> {video.audience}</span>
                  <span className="flex items-center gap-1"><Target size={10} /> {video.goal}</span>
                </div>

                <button
                  onClick={() => setExpanded(isOpen ? null : video.id)}
                  className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#C9973A] pt-3 border-t border-stone-100">
                  {isOpen ? 'Hide Details' : 'Script Outline'}
                  <ChevronRight size={13} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>

                {isOpen && (
                  <div className="mt-3 space-y-2">
                    <div className="bg-stone-50 rounded-xl p-3">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Script Body</p>
                      <p className="text-stone-700 text-sm">{video.body}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 mb-1">Call to Action</p>
                      <p className="text-stone-700 text-sm font-medium">{video.cta}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Videos;