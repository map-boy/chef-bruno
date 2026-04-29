// PATH: src-app/pages/AppLive.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import {
  Video, Clock, Users, Calendar, Lock,
  Wifi, WifiOff, Loader2, ChevronRight, Radio
} from 'lucide-react';

const AppLive: React.FC = () => {
  const [classes, setClasses]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    document.title = 'Live Sessions | Chef Bruno';
    const q = query(collection(db, 'classes'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const live      = classes.filter(c => c.status === 'live');
  const scheduled = classes.filter(c => c.status === 'scheduled');
  const ended     = classes.filter(c => c.status === 'ended');

  return (
    <div className="min-h-screen bg-[#FAF6EF]">

      {/* Header */}
      <div className="bg-[#1A1A1A] pt-12 pb-6 px-5 relative overflow-hidden">
        {/* Decorative pulse rings */}
        {live.length > 0 && (
          <div className="absolute right-4 top-10 opacity-20">
            <div className="w-24 h-24 rounded-full border border-emerald-400 animate-ping" />
          </div>
        )}
        <div className="flex items-center gap-2 mb-1 relative z-10">
          {live.length > 0 ? (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.35em]">Session Live Now</span>
            </>
          ) : (
            <>
              <Radio size={13} className="text-[#C9973A]" />
              <span className="text-[#C9973A] text-[10px] font-bold uppercase tracking-[0.35em]">Live Sessions</span>
            </>
          )}
        </div>
        <h1 className="font-serif text-3xl font-bold text-white relative z-10">Online Classes</h1>
        <p className="text-stone-400 text-sm mt-1 relative z-10">Learn directly from Chef Bruno in real-time.</p>
      </div>

      <div className="px-4 pt-5 pb-4 space-y-5">

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#C9973A]" size={32} />
          </div>
        )}

        {!loading && classes.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
            <Video size={44} className="text-stone-300 mx-auto mb-4" strokeWidth={1.4} />
            <p className="text-stone-500 font-serif text-lg font-bold">No Sessions Yet</p>
            <p className="text-stone-400 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
              Chef Bruno will publish live sessions here. Check back soon.
            </p>
          </div>
        )}

        {/* ── LIVE NOW ── */}
        {live.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Happening Now</p>
            </div>
            <div className="space-y-3">
              {live.map((cls, idx) => (
                <motion.div key={cls.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                  className="bg-emerald-600 rounded-2xl overflow-hidden shadow-lg shadow-emerald-200">
                  <div className="px-5 py-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Live</span>
                    </div>
                    <h3 className="font-serif font-bold text-white text-xl leading-snug mb-1">{cls.title}</h3>
                    <p className="text-emerald-100 text-sm leading-relaxed line-clamp-2 mb-4">{cls.description}</p>
                    <div className="flex flex-wrap gap-3 text-[11px] text-emerald-100 mb-5">
                      <span className="flex items-center gap-1"><Clock size={11} />{cls.duration} min</span>
                      <span className="flex items-center gap-1"><Users size={11} />Max {cls.maxStudents}</span>
                      <span className="flex items-center gap-1"><Wifi size={11} />Live Stream</span>
                    </div>
                    <Link to={`/classes/${cls.id}`}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-emerald-700 font-bold text-[11px] uppercase tracking-widest rounded-xl active:scale-95 transition-transform">
                      <Video size={15} /> Join Live Session
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── UPCOMING ── */}
        {scheduled.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Upcoming Sessions</p>
            <div className="space-y-2">
              {scheduled.map((cls, idx) => (
                <motion.div key={cls.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-[#1A1A1A] font-serif text-base leading-snug flex-1">{cls.title}</h3>
                    <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700">Upcoming</span>
                    </div>
                  </div>
                  <p className="text-stone-400 text-sm leading-relaxed line-clamp-2 mb-3">{cls.description}</p>
                  <div className="flex flex-wrap gap-3 text-[11px] text-stone-400 mb-3">
                    <span className="flex items-center gap-1"><Calendar size={11} />{cls.date} · {cls.time}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{cls.duration} min</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <span className="font-bold font-serif text-[#1A1A1A]">
                      {cls.price === 0 ? <span className="text-emerald-600">Free</span> : `RWF ${Number(cls.price).toLocaleString()}`}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 text-stone-400 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                      <Lock size={11} /> Not Started
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── PAST SESSIONS ── */}
        {ended.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Past Sessions</p>
            <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 divide-y divide-stone-100">
              {ended.map(cls => (
                <div key={cls.id} className="px-4 py-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                    <WifiOff size={15} className="text-stone-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-stone-400 text-sm line-clamp-1">{cls.title}</p>
                    <p className="text-stone-300 text-[11px]">{cls.date} · {cls.duration} min</p>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-stone-300 bg-stone-100 px-2.5 py-1 rounded-full shrink-0">Ended</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HOW IT WORKS ── */}
        <div className="bg-[#1A1A1A] rounded-2xl px-5 py-5">
          <p className="text-[#C9973A] text-[10px] font-bold uppercase tracking-widest mb-4">How It Works</p>
          <div className="space-y-4">
            {[
              { step: '01', text: 'Wait for a session to go Live — or check the upcoming schedule above.' },
              { step: '02', text: 'Tap "Join Live Session" when the class starts. Your camera and mic will be used.' },
              { step: '03', text: 'Interact directly with Chef Bruno and other students in real time.' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-4">
                <span className="text-[#C9973A] font-serif font-bold text-lg leading-none shrink-0">{step}</span>
                <p className="text-stone-400 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AppLive;