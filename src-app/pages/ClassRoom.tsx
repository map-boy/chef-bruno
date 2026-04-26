// FILE: src/pages/ClassRoom.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Loader2, ArrowLeft, Lock } from 'lucide-react';
import DailyIframe from '@daily-co/daily-js';

const ClassRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cls, setCls] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const frameRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'classes', id), snap => {
      if (snap.exists()) setCls({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const handleJoin = async () => {
    if (!name.trim() || !cls?.roomUrl) return;
    setJoining(true);
    try {
      if (frameRef.current) {
        frameRef.current.destroy();
        frameRef.current = null;
      }
      const frame = DailyIframe.createFrame(containerRef.current!, {
        iframeStyle: {
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          border: 'none',
          borderRadius: '12px',
        },
        showLeaveButton: true,
        showFullscreenButton: true,
      });
      frameRef.current = frame;
      frame.on('left-meeting', () => {
        setJoined(false);
        frame.destroy();
        frameRef.current = null;
      });
      await frame.join({ url: cls.roomUrl, userName: name });
      setJoined(true);
    } catch (err) {
      console.error(err);
      alert('Failed to join. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        frameRef.current.destroy();
        frameRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="animate-spin text-amber-600" size={48} />
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <p className="text-stone-500 mb-4">Class not found.</p>
          <button onClick={() => navigate('/classes')} className="text-amber-600 font-bold">← Back to Classes</button>
        </div>
      </div>
    );
  }

  if (cls.status === 'ended') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 pt-20">
        <div className="text-center">
          <p className="text-stone-500 text-lg mb-4">This class has ended.</p>
          <button onClick={() => navigate('/classes')} className="text-amber-600 font-bold">← Browse Classes</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-stone-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/classes')}
            className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} /> Back to Classes
          </button>
          {cls.status === 'live' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-full">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-white text-[10px] font-bold uppercase tracking-widest">Live Now</span>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-serif font-bold text-white mb-2">{cls.title}</h1>
        <p className="text-stone-400 mb-8">{cls.date} at {cls.time} · {cls.duration} min</p>

        {/* Video Container */}
        <div className="relative bg-stone-800 rounded-2xl overflow-hidden" style={{ paddingBottom: joined ? '0' : undefined, height: joined ? '600px' : undefined }}>
          <div ref={containerRef} className="absolute inset-0" />

          {!joined && (
            <div className="relative z-10 flex flex-col items-center justify-center py-24 px-4">
              {cls.status !== 'live' ? (
                <div className="text-center">
                  <Lock size={48} className="text-stone-500 mx-auto mb-4" />
                  <p className="text-stone-300 text-xl font-serif mb-2">Class Not Started Yet</p>
                  <p className="text-stone-500 text-sm">This class is scheduled for {cls.date} at {cls.time}.</p>
                  <p className="text-stone-500 text-sm mt-1">The join button will appear when the admin goes live.</p>
                </div>
              ) : (
                <div className="bg-stone-700 rounded-2xl p-8 w-full max-w-md text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <h2 className="text-white text-2xl font-serif font-bold mb-2">Ready to Join?</h2>
                  <p className="text-stone-400 text-sm mb-6">Enter your name to join the live class</p>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 bg-stone-600 text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 placeholder-stone-400 mb-4"
                  />
                  <button
                    onClick={handleJoin}
                    disabled={joining || !name.trim()}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  >
                    {joining ? <><Loader2 size={16} className="animate-spin" /> Joining...</> : 'Join Class Now'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Class Info Below */}
        {!joined && (
          <div className="mt-8 bg-stone-800 rounded-2xl p-6">
            <h3 className="text-white font-serif font-bold text-xl mb-3">About This Class</h3>
            <p className="text-stone-400 leading-relaxed">{cls.description}</p>
            <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-stone-700">
              <div>
                <p className="text-stone-500 text-[10px] uppercase tracking-widest font-bold mb-1">Price</p>
                <p className="text-amber-400 font-bold">{cls.price === 0 ? 'Free' : `RWF ${Number(cls.price).toLocaleString()}`}</p>
              </div>
              <div>
                <p className="text-stone-500 text-[10px] uppercase tracking-widest font-bold mb-1">Duration</p>
                <p className="text-white font-bold">{cls.duration} minutes</p>
              </div>
              <div>
                <p className="text-stone-500 text-[10px] uppercase tracking-widest font-bold mb-1">Max Students</p>
                <p className="text-white font-bold">{cls.maxStudents}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassRoom;