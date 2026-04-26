// FILE: src/pages/Classes.tsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Video, Clock, Users, Calendar, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const Classes = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Online Classes | Chef Bruno';
    const q = query(collection(db, 'classes'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const statusLabel: Record<string, { label: string; color: string }> = {
    scheduled: { label: 'Upcoming',  color: 'bg-amber-100 text-amber-700 border-amber-200' },
    live:      { label: '🔴 Live Now', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    ended:     { label: 'Ended',     color: 'bg-stone-100 text-stone-400 border-stone-200' },
  };

  return (
    <div className="pt-20 bg-stone-50 min-h-screen">
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-600/10 rounded-full mb-6"
            >
              <Video size={14} className="text-amber-600" />
              <span className="text-amber-600 text-[10px] font-bold uppercase tracking-[0.3em]">Live Culinary Classes</span>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 mb-6">Online Classes</h1>
            <p className="text-stone-500 font-light text-xl max-w-2xl mx-auto">
              Learn directly from Chef Bruno in real-time. Join a live session from anywhere in the world.
            </p>
          </div>

          {loading ? (
            <p className="text-center text-stone-400 py-20">Loading classes...</p>
          ) : classes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
              <Video size={48} className="text-stone-300 mx-auto mb-4" />
              <p className="text-stone-400 text-lg">No classes scheduled yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classes.map((cls, idx) => {
                const s = statusLabel[cls.status] || statusLabel.scheduled;
                const isLive = cls.status === 'live';
                const isEnded = cls.status === 'ended';
                return (
                  <motion.div
                    key={cls.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                      isLive ? 'border-emerald-300 shadow-emerald-100 shadow-lg' : 'border-stone-200'
                    }`}
                  >
                    {isLive && (
                      <div className="bg-emerald-600 px-6 py-2 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="text-white text-[10px] font-bold uppercase tracking-widest">Class is Live — Join Now</span>
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-bold text-stone-900 text-xl font-serif leading-tight">{cls.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shrink-0 ${s.color}`}>
                          {s.label}
                        </span>
                      </div>
                      <p className="text-stone-500 text-sm leading-relaxed mb-5">{cls.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-stone-400 mb-6">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {cls.date} at {cls.time}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {cls.duration} min</span>
                        <span className="flex items-center gap-1"><Users size={12} /> Max {cls.maxStudents}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold font-serif text-stone-900">
                          {cls.price === 0 ? <span className="text-emerald-600">Free</span> : `RWF ${Number(cls.price).toLocaleString()}`}
                        </span>
                        {isEnded ? (
                          <span className="px-5 py-2.5 bg-stone-100 text-stone-400 rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-not-allowed">
                            Class Ended
                          </span>
                        ) : isLive ? (
                          <Link
                            to={`/classes/${cls.id}`}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                          >
                            Join Class →
                          </Link>
                        ) : (
                          <Link
                            to={`/classes/${cls.id}`}
                            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                          >
                            View Details →
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Classes;