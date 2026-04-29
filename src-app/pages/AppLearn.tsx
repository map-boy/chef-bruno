// PATH: src-app/pages/AppLearn.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAcademy } from '../hooks/useAcademy';
import {
  BookOpen, Video, PenLine, BookMarked, GraduationCap,
  ChevronRight, Clock, ArrowRight, Loader2, Star, Lock, Users, Calendar,
  Play, X, ExternalLink
} from 'lucide-react';

type Tab = 'academy' | 'classes' | 'videos' | 'blog' | 'books';

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'academy',  label: 'Academy',  icon: GraduationCap },
  { id: 'classes',  label: 'Classes',  icon: Video },
  { id: 'videos',   label: 'Videos',   icon: BookOpen },
  { id: 'blog',     label: 'Blog',     icon: PenLine },
  { id: 'books',    label: 'Books',    icon: BookMarked },
];

// ── HELPERS ──────────────────────────────────────────────────────────────────
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  // youtu.be/ID
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short) return `https://www.youtube.com/embed/${short[1]}?autoplay=1`;
  // youtube.com/watch?v=ID
  const watch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}?autoplay=1`;
  // youtube.com/shorts/ID or /embed/ID
  const path = url.match(/youtube\.com\/(?:shorts|embed)\/([a-zA-Z0-9_-]{11})/);
  if (path) return `https://www.youtube.com/embed/${path[1]}?autoplay=1`;
  return null;
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

// ── VIDEO PLAYER MODAL ────────────────────────────────────────────────────────
const VideoModal: React.FC<{ video: any; onClose: () => void }> = ({ video, onClose }) => {
  const embedUrl = video.videoUrl ? getYouTubeEmbedUrl(video.videoUrl) : null;
  const isDirect = video.videoUrl ? isDirectVideo(video.videoUrl) : false;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/90 z-50 flex flex-col"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Close bar */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={e => e.stopPropagation()}>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight line-clamp-1">{video.title}</p>
            {video.category && (
              <p className="text-stone-400 text-[10px] uppercase tracking-widest mt-0.5">{video.category}</p>
            )}
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center ml-3 shrink-0 active:scale-90 transition-transform">
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* Player */}
        <div className="flex-1 flex items-center justify-center px-0" onClick={e => e.stopPropagation()}>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full"
              style={{ aspectRatio: '16/9' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          ) : isDirect ? (
            <video
              src={video.videoUrl}
              controls
              autoPlay
              className="w-full"
              style={{ aspectRatio: '16/9', maxHeight: '60vh' }}
            />
          ) : (
            <div className="text-center px-8">
              <Video size={48} className="text-stone-500 mx-auto mb-4" />
              <p className="text-stone-400 text-sm mb-4">This video format cannot be played inline.</p>
              <a href={video.videoUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#C9973A] text-[#1A1A1A] font-bold text-[11px] uppercase tracking-widest rounded-xl">
                <ExternalLink size={14} /> Open Video
              </a>
            </div>
          )}
        </div>

        {/* Description */}
        {video.description && (
          <div className="px-5 py-4 shrink-0" onClick={e => e.stopPropagation()}>
            <p className="text-stone-300 text-sm leading-relaxed line-clamp-3">{video.description}</p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// ── ACADEMY TAB ───────────────────────────────────────────────────────────────
const AcademyTab: React.FC = () => {
  const { modules, loading } = useAcademy();
  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#C9973A]" size={28} /></div>;
  return (
    <div className="space-y-3 px-4 pt-4 pb-4">
      <div className="bg-[#7C2D2D] rounded-2xl px-5 py-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Star size={14} className="text-amber-300" />
          <span className="text-amber-300 text-[10px] font-bold uppercase tracking-widest">BCCP Certified</span>
        </div>
        <p className="text-white font-serif font-bold text-lg leading-snug">Culinary Mastery Certification</p>
        <p className="text-stone-300 text-xs mt-1 leading-relaxed">5-module professional program by Chef Bruno</p>
      </div>
      {modules.map((mod, idx) => (
        <motion.div key={mod.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
          className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
          <div className="flex items-stretch">
            <div className="w-14 bg-[#1A1A1A] flex flex-col items-center justify-center shrink-0 py-4">
              <span className="text-[#C9973A] text-[9px] font-bold uppercase tracking-wider">MOD</span>
              <span className="text-white text-2xl font-serif font-bold leading-none">{mod.moduleNumber}</span>
            </div>
            <div className="flex-1 px-4 py-4">
              <p className="font-bold text-[#1A1A1A] text-sm">{mod.title}</p>
              <p className="text-stone-400 text-[11px] mt-1 leading-relaxed line-clamp-2">{mod.outcome}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {mod.lessons.slice(0, 2).map((l: string) => (
                  <span key={l} className="bg-stone-100 text-stone-500 text-[9px] font-bold px-2 py-0.5 rounded-full">{l}</span>
                ))}
                {mod.lessons.length > 2 && (
                  <span className="bg-stone-100 text-stone-500 text-[9px] font-bold px-2 py-0.5 rounded-full">+{mod.lessons.length - 2} more</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      <Link to="/book" className="block w-full py-4 bg-[#1A1A1A] text-white text-center font-bold text-[11px] uppercase tracking-widest rounded-xl mt-4 active:scale-95 transition-transform">
        Apply for Enrollment
      </Link>
    </div>
  );
};

// ── CLASSES TAB ───────────────────────────────────────────────────────────────
const ClassesTab: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const q = query(collection(db, 'classes'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#C9973A]" size={28} /></div>;
  if (classes.length === 0) return (
    <div className="text-center py-20 px-4">
      <Video size={40} className="text-stone-300 mx-auto mb-3" />
      <p className="text-stone-400 font-serif text-lg">No classes scheduled yet</p>
    </div>
  );

  const statusStyle: Record<string, { label: string; dot: string; bg: string; text: string }> = {
    live:      { label: 'Live Now',  dot: 'bg-emerald-400 animate-pulse', bg: 'bg-emerald-100', text: 'text-emerald-700' },
    scheduled: { label: 'Upcoming',  dot: 'bg-amber-400',                  bg: 'bg-amber-100',   text: 'text-amber-700' },
    ended:     { label: 'Ended',     dot: 'bg-stone-400',                  bg: 'bg-stone-100',   text: 'text-stone-500' },
  };

  return (
    <div className="px-4 pt-4 pb-4 space-y-3">
      {classes.map((cls, idx) => {
        const s = statusStyle[cls.status] || statusStyle.scheduled;
        const isLive = cls.status === 'live';
        const isEnded = cls.status === 'ended';
        return (
          <motion.div key={cls.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
            className={`bg-white rounded-2xl overflow-hidden border shadow-sm ${isLive ? 'border-emerald-300' : 'border-stone-100'}`}>
            {isLive && (
              <div className="bg-emerald-600 px-4 py-1.5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-white text-[10px] font-bold uppercase tracking-widest">Class is Live — Join Now</span>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-[#1A1A1A] font-serif text-base leading-snug flex-1">{cls.title}</h3>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0 ${s.bg}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${s.text}`}>{s.label}</span>
                </div>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed line-clamp-2 mb-3">{cls.description}</p>
              <div className="flex flex-wrap gap-3 text-[11px] text-stone-400 mb-4">
                <span className="flex items-center gap-1"><Calendar size={11} />{cls.date} · {cls.time}</span>
                <span className="flex items-center gap-1"><Clock size={11} />{cls.duration} min</span>
                <span className="flex items-center gap-1"><Users size={11} />Max {cls.maxStudents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold font-serif text-[#1A1A1A] text-base">
                  {cls.price === 0 ? <span className="text-emerald-600">Free</span> : `RWF ${Number(cls.price).toLocaleString()}`}
                </span>
                {isEnded ? (
                  <span className="px-4 py-2 bg-stone-100 text-stone-400 rounded-xl text-[10px] font-bold uppercase tracking-widest">Ended</span>
                ) : isLive ? (
                  <Link to={`/classes/${cls.id}`}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform">
                    Join Now
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 px-4 py-2 bg-stone-100 text-stone-500 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                    <Lock size={11} /> Scheduled
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ── VIDEOS TAB ────────────────────────────────────────────────────────────────
const VideosTab: React.FC = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const catColor: Record<string, string> = {
    Brand: 'bg-amber-100 text-amber-700', Tutorial: 'bg-blue-100 text-blue-700',
    Education: 'bg-emerald-100 text-emerald-700', Business: 'bg-purple-100 text-purple-700',
    Inspiration: 'bg-rose-100 text-rose-700',
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#C9973A]" size={28} /></div>;
  if (videos.length === 0) return (
    <div className="text-center py-20 px-4">
      <Video size={40} className="text-stone-300 mx-auto mb-3" />
      <p className="text-stone-400 font-serif text-lg">Video series coming soon</p>
    </div>
  );

  return (
    <>
      {playing && <VideoModal video={playing} onClose={() => setPlaying(null)} />}
      <div className="px-4 pt-4 pb-4 space-y-3">
        {videos.map((v, idx) => {
          const hasVideo = !!v.videoUrl;
          return (
            <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              onClick={() => hasVideo && setPlaying(v)}
              className={`bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm ${hasVideo ? 'active:scale-[0.98] transition-transform cursor-pointer' : ''}`}>
              <div className="flex items-stretch">
                {/* Thumbnail / Play button */}
                <div className={`w-24 shrink-0 flex items-center justify-center relative ${hasVideo ? 'bg-[#1A1A1A]' : 'bg-stone-100'}`}>
                  {hasVideo ? (
                    <div className="w-10 h-10 rounded-full bg-[#C9973A] flex items-center justify-center">
                      <Play size={16} className="text-[#1A1A1A] ml-0.5" fill="currentColor" />
                    </div>
                  ) : (
                    <Video size={24} className="text-stone-300" />
                  )}
                  {!hasVideo && (
                    <div className="absolute bottom-2 left-0 right-0 text-center">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-stone-400">Soon</span>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${catColor[v.category] || 'bg-stone-100 text-stone-600'}`}>{v.category}</span>
                    {v.duration && <span className="text-stone-400 text-[10px]">{v.duration}</span>}
                  </div>
                  <h3 className="font-serif font-bold text-[#1A1A1A] text-sm mb-1 leading-snug">{v.title}</h3>
                  <p className="text-stone-400 text-[11px] leading-relaxed line-clamp-2">{v.description}</p>
                  {v.hook && <p className="text-[#C9973A] text-[10px] italic mt-1.5 line-clamp-1">"{v.hook}"</p>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
};

// ── BLOG TAB ──────────────────────────────────────────────────────────────────
const BlogTab: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const q = query(collection(db, 'blog'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const catColor: Record<string, string> = {
    Branding: 'bg-amber-100 text-amber-700', Techniques: 'bg-blue-100 text-blue-700',
    Business: 'bg-emerald-100 text-emerald-700', Innovation: 'bg-purple-100 text-purple-700',
    Mindset: 'bg-rose-100 text-rose-700', Ethics: 'bg-stone-100 text-stone-600',
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#C9973A]" size={28} /></div>;
  if (posts.length === 0) return (
    <div className="text-center py-20 px-4">
      <PenLine size={40} className="text-stone-300 mx-auto mb-3" />
      <p className="text-stone-400 font-serif text-lg">Articles coming soon</p>
    </div>
  );

  const featured = posts.filter(p => p.featured);
  const regular  = posts.filter(p => !p.featured);

  return (
    <div className="px-4 pt-4 pb-4 space-y-3">
      {featured.map((post, idx) => (
        <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
          className="bg-[#1A1A1A] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${catColor[post.category] || 'bg-stone-100 text-stone-600'}`}>{post.category}</span>
            <span className="flex items-center gap-1 text-stone-500 text-[10px]"><Clock size={10} />{post.readTime}</span>
          </div>
          <h3 className="font-serif text-xl font-bold text-white mb-2 leading-snug">{post.title}</h3>
          <p className="text-stone-400 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
          <div className="flex items-center gap-1 text-[#C9973A] text-[10px] font-bold uppercase tracking-widest mt-4">
            Read Article <ArrowRight size={11} />
          </div>
        </motion.div>
      ))}
      {regular.length > 0 && (
        <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 divide-y divide-stone-100">
          {regular.map((post, i) => (
            <div key={post.id} className="p-4 flex items-start gap-4 active:bg-stone-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 text-[10px] font-bold shrink-0">{String(i + 1).padStart(2, '0')}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${catColor[post.category] || 'bg-stone-100 text-stone-600'}`}>{post.category}</span>
                  <span className="text-stone-400 text-[10px] flex items-center gap-1"><Clock size={9} />{post.readTime}</span>
                </div>
                <h3 className="font-serif text-sm font-bold text-[#1A1A1A] leading-snug line-clamp-2">{post.title}</h3>
              </div>
              <ArrowRight size={14} className="text-stone-300 shrink-0 mt-1" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── BOOKS TAB ─────────────────────────────────────────────────────────────────
const BooksTab: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const q = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setBooks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#C9973A]" size={28} /></div>;
  if (books.length === 0) return (
    <div className="text-center py-20 px-4">
      <BookMarked size={40} className="text-stone-300 mx-auto mb-3" />
      <p className="text-stone-400 font-serif text-lg">Books coming soon</p>
    </div>
  );

  return (
    <div className="px-4 pt-4 pb-4 space-y-3">
      {books.map((book, idx) => (
        <motion.div key={book.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
          className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm flex">
          <div className={`w-20 shrink-0 bg-gradient-to-b ${book.bgGradient || 'from-stone-800 to-stone-950'} flex items-center justify-center`}>
            <BookMarked size={28} className="text-amber-400" strokeWidth={1.5} />
          </div>
          <div className="flex-1 p-4">
            {book.volume && <p className="text-[#C9973A] text-[9px] font-bold uppercase tracking-widest mb-1">Vol. {book.volume}</p>}
            <h3 className="font-serif font-bold text-[#1A1A1A] text-sm leading-snug">{book.title}</h3>
            {book.subtitle && <p className="text-stone-400 text-[11px] mt-0.5 line-clamp-1">{book.subtitle}</p>}
            {book.audience && <p className="text-stone-300 text-[10px] mt-2 uppercase tracking-wider font-bold">{book.audience}</p>}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const AppLearn: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('academy');

  useEffect(() => { document.title = 'Learn | Chef Bruno'; }, []);

  const tabContent: Record<Tab, React.ReactNode> = {
    academy: <AcademyTab />,
    classes: <ClassesTab />,
    videos:  <VideosTab />,
    blog:    <BlogTab />,
    books:   <BooksTab />,
  };

  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      {/* Header */}
      <div className="bg-[#1A1A1A] pt-12 pb-4 px-5">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={14} className="text-[#C9973A]" />
          <span className="text-[#C9973A] text-[10px] font-bold uppercase tracking-[0.35em]">Knowledge Hub</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-white">Learn</h1>
      </div>

      {/* Tab Bar */}
      <div className="bg-[#1A1A1A] border-b border-white/5 sticky top-0 z-20">
        <div className="flex gap-0 overflow-x-auto no-scrollbar px-4 pb-0">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-4 py-3 border-b-2 shrink-0 transition-all ${
                  isActive ? 'border-[#C9973A] text-[#C9973A]' : 'border-transparent text-stone-500'
                }`}>
                <Icon size={13} strokeWidth={isActive ? 2.2 : 1.7} />
                <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {tabContent[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AppLearn;