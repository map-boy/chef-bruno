// FILE: src/pages/Videos.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Play, X, Film, Clock, Tag } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  videoUrl: string;
  thumbnail?: string;
  hook?: string;
  cta?: string;
}

const categoryColors: Record<string, string> = {
  Brand:       'bg-amber-600/20 text-amber-400 border-amber-600/40',
  Tutorial:    'bg-blue-600/20 text-blue-400 border-blue-600/40',
  Education:   'bg-emerald-600/20 text-emerald-400 border-emerald-600/40',
  Business:    'bg-purple-600/20 text-purple-400 border-purple-600/40',
  Inspiration: 'bg-rose-600/20 text-rose-400 border-rose-600/40',
};

// Convert any YouTube URL to embed URL
function toEmbedUrl(url: string): string | null {
  if (!url) return null;

  // Already an embed URL
  if (url.includes('youtube.com/embed/')) return url;

  // youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1`;

  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1`;

  // YouTube Shorts
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=1`;

  // Direct .mp4 or other video file — return as-is (will use <video> tag)
  if (url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i)) return url;

  return null;
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

const VideoModal: React.FC<{ video: Video; onClose: () => void }> = ({ video, onClose }) => {
  const embedUrl = toEmbedUrl(video.videoUrl);
  const direct = embedUrl ? isDirectVideo(embedUrl) : false;

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4"
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-4xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/70 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <X size={18} /> Close
        </button>

        {/* Video container */}
        <div className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-black" style={{ aspectRatio: '16/9' }}>
          {!embedUrl ? (
            <div className="flex items-center justify-center h-full text-stone-400 text-sm">
              No video URL available.
            </div>
          ) : direct ? (
            <video
              src={embedUrl}
              controls
              autoPlay
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          )}
        </div>

        {/* Video info below player */}
        <div className="mt-4 text-white">
          <h2 className="font-serif text-xl font-bold mb-1">{video.title}</h2>
          {video.description && (
            <p className="text-stone-400 text-sm leading-relaxed">{video.description}</p>
          )}
          {video.cta && (
            <p className="mt-3 text-[#C9973A] text-sm font-medium">{video.cta}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Videos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [playing, setPlaying] = useState<Video | null>(null);

  useEffect(() => {
    document.title = 'Videos | Chef Bruno Hotel & Culinary Center';
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Video)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const categories = ['All', ...Array.from(new Set(videos.map(v => v.category).filter(Boolean)))];
  const filtered = activeFilter === 'All' ? videos : videos.filter(v => v.category === activeFilter);

  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      {/* Modal */}
      {playing && <VideoModal video={playing} onClose={() => setPlaying(null)} />}

      {/* Hero */}
      <div className="bg-[#1A1A1A] pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-800 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 border border-amber-600/40 text-amber-500 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
            <Film size={12} /> Video Library
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Watch & <span className="text-[#C9973A]">Learn</span>
          </h1>
          <p className="text-stone-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Culinary tutorials, techniques, and insights — watch everything right here without leaving the page.
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      {categories.length > 1 && (
        <div className="sticky top-[64px] z-30 bg-white border-b border-stone-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex gap-3 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`shrink-0 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                  activeFilter === cat
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-transparent text-stone-500 border-stone-300 hover:border-stone-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-stone-200 animate-pulse">
                <div className="h-48 bg-stone-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-full" />
                  <div className="h-3 bg-stone-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Film size={40} className="text-stone-300 mx-auto mb-4" />
            <p className="text-stone-400 text-lg font-serif">No videos yet.</p>
            <p className="text-stone-400 text-sm mt-2">Check back soon — new content is on the way.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((video) => {
              const hasVideo = !!video.videoUrl;
              return (
                <div
                  key={video.id}
                  className="bg-white rounded-xl overflow-hidden border border-stone-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  onClick={() => hasVideo && setPlaying(video)}
                >
                  {/* Thumbnail / Play area */}
                  <div className="relative h-48 bg-gradient-to-br from-stone-800 to-stone-950 flex items-center justify-center overflow-hidden">
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt={video.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    ) : (
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_#C9973A,_transparent)]" />
                    )}
                    <div className="relative z-10 text-center">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-110 ${
                        hasVideo
                          ? 'bg-[#C9973A] shadow-lg shadow-amber-900/40'
                          : 'bg-stone-700/60 border-2 border-stone-600'
                      }`}>
                        <Play size={22} className={`ml-1 ${hasVideo ? 'text-white' : 'text-stone-400'}`} />
                      </div>
                      {!hasVideo && (
                        <p className="text-stone-500 text-[9px] uppercase tracking-widest font-bold mt-2">Coming Soon</p>
                      )}
                    </div>
                    {/* Category badge */}
                    {video.category && (
                      <div className="absolute top-3 right-3">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${categoryColors[video.category] || 'bg-stone-700/40 text-stone-300 border-stone-600/40'}`}>
                          {video.category}
                        </span>
                      </div>
                    )}
                    {/* Duration */}
                    {video.duration && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[9px] text-stone-300 font-bold uppercase tracking-wider">
                        <Clock size={10} /> {video.duration}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h3 className="font-serif text-lg font-bold text-[#1A1A1A] mb-2 leading-snug group-hover:text-[#C9973A] transition-colors">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-stone-500 text-sm leading-relaxed mb-4">{video.description}</p>
                    )}
                    {video.hook && (
                      <blockquote className="border-l-2 border-[#C9973A] pl-3 text-stone-600 text-xs italic leading-relaxed">
                        "{video.hook}"
                      </blockquote>
                    )}
                    {/* Watch button */}
                    <div className={`mt-4 pt-4 border-t border-stone-100 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      hasVideo ? 'text-[#C9973A]' : 'text-stone-300'
                    }`}>
                      <Play size={12} />
                      {hasVideo ? 'Watch Now' : 'Coming Soon'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="bg-[#1A1A1A] py-20 px-6 text-center">
        <p className="text-stone-400 text-[10px] uppercase tracking-[0.4em] font-bold mb-4">Stay Updated</p>
        <h2 className="font-serif text-3xl md:text-4xl text-white font-bold mb-6">More Videos Coming</h2>
        <p className="text-stone-500 max-w-xl mx-auto mb-8 leading-relaxed">
          Follow Chef Bruno on social media for new video announcements and behind-the-scenes content.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="https://tiktok.com/@shimirwabruno"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#C9973A] hover:bg-[#b08432] text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            Follow on TikTok
          </a>
          <a
            href="/contact"
            className="border border-stone-600 hover:border-stone-400 text-stone-400 hover:text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default Videos;