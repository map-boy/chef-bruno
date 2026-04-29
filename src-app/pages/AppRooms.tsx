
// PATH: src-app/pages/AppRooms.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useRooms } from '../hooks/useRooms';
import {
  Bed, ChevronLeft, Wine, Sparkles, Coffee,
  ShieldCheck, Flower2, BookOpen, ArrowRight, Loader2
} from 'lucide-react';

const amenities = [
  { icon: ShieldCheck, label: '24/7 Kitchen Access' },
  { icon: Flower2,     label: 'Herb Garden' },
  { icon: Coffee,      label: 'Private Dining' },
  { icon: Sparkles,    label: 'Spa & Wellness' },
  { icon: BookOpen,    label: 'Culinary Library' },
  { icon: Wine,        label: 'Wine Tasting' },
];

const AppRooms: React.FC = () => {
  const { rooms, loading } = useRooms();
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => { document.title = 'Rooms | Chef Bruno'; }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C9973A]" size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6EF]">

      {/* Header */}
      <div className="bg-[#1A1A1A] pt-12 pb-6 px-5">
        <div className="flex items-center gap-2 mb-1">
          <Bed size={14} className="text-[#C9973A]" />
          <span className="text-[#C9973A] text-[10px] font-bold uppercase tracking-[0.35em]">Our Collection</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-white">Luxury Rooms</h1>
        <p className="text-stone-400 text-sm mt-1">Premium stays designed for culinary souls.</p>
      </div>

      {/* Rooms List */}
      <div className="px-4 py-5 space-y-4">
        {rooms.map((room, idx) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
            onClick={() => setSelected(room)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="relative h-48">
              {room.imageUrl ? (
                <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-stone-700 to-stone-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 flex items-end justify-between">
                <div>
                  <p className="text-white font-serif font-bold text-lg leading-tight">{room.name}</p>
                </div>
                <div className="bg-[#C9973A] px-3 py-1.5 rounded-full shrink-0">
                  <span className="text-white text-[11px] font-bold">
                    RWF {room.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-4 py-4 flex items-center justify-between">
              <p className="text-stone-500 text-sm leading-relaxed line-clamp-2 flex-1 mr-3">{room.description}</p>
              <div className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0">
                <ArrowRight size={15} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Amenities */}
      <div className="px-4 pb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3 px-1">Included Amenities</p>
        <div className="grid grid-cols-3 gap-2">
          {amenities.map(({ icon: Icon, label }) => (
            <div key={label} className="bg-white rounded-xl px-3 py-3 flex flex-col items-center gap-2 border border-stone-100">
              <Icon size={18} className="text-[#C9973A]" strokeWidth={1.7} />
              <p className="text-[10px] font-bold text-stone-600 text-center leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Room Detail Bottom Sheet */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl overflow-hidden"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}
            >
              <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mt-3 mb-4" />
              <div className="relative h-52">
                {selected.imageUrl ? (
                  <img src={selected.imageUrl} alt={selected.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-stone-700 to-stone-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 left-3 w-9 h-9 bg-black/40 rounded-full flex items-center justify-center"
                >
                  <ChevronLeft size={20} className="text-white" />
                </button>
              </div>
              <div className="px-5 pt-5 pb-2">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">{selected.name}</h2>
                  <div className="bg-[#C9973A]/10 px-3 py-1.5 rounded-full">
                    <span className="text-[#C9973A] text-sm font-bold">RWF {selected.price.toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-stone-500 text-sm leading-relaxed mb-5">{selected.description}</p>
                <Link
                  to={`/book?room=${encodeURIComponent(selected.name)}`}
                  className="block w-full py-4 bg-[#1A1A1A] text-white text-center font-bold text-[11px] uppercase tracking-widest rounded-xl active:scale-95 transition-transform"
                >
                  Reserve This Room
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppRooms;