// PATH: src-app/pages/AppEvents.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEvents } from '../hooks/useEvents';
import { CalendarDays, Tag, Loader2, ChevronDown, ChevronUp, MapPin } from 'lucide-react';

const categoryColors: Record<string, { bg: string; text: string }> = {
  Hospitality: { bg: 'bg-blue-100',   text: 'text-blue-700' },
  Culinary:    { bg: 'bg-amber-100',   text: 'text-amber-700' },
  Private:     { bg: 'bg-purple-100',  text: 'text-purple-700' },
  Other:       { bg: 'bg-stone-100',   text: 'text-stone-600' },
};

const FILTERS = ['All', 'Hospitality', 'Culinary', 'Private', 'Other'];

const AppEvents: React.FC = () => {
  const { events, loading } = useEvents();
  const [filter, setFilter]     = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { document.title = 'Events | Chef Bruno'; }, []);

  const now = new Date();

  const filtered = (filter === 'All' ? events : events.filter(e => e.category === filter));
  const upcoming = filtered.filter(e => new Date(e.date) >= now);
  const past     = filtered.filter(e => new Date(e.date) <  now);

  const EventCard = ({ event, idx }: { event: any; idx: number }) => {
    const isOpen = expanded === event.id;
    const d = new Date(event.date);
    const c = categoryColors[event.category] || categoryColors.Other;
    const isPast = d < now;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className={`bg-white rounded-2xl overflow-hidden border shadow-sm ${isPast ? 'opacity-60' : 'border-stone-100'}`}
      >
        {event.imageUrl && !isPast && (
          <div className="h-36 relative overflow-hidden">
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}
        <div className="p-4">
          {/* Date + Category row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="text-center">
                <p className="text-[#C9973A] text-[9px] font-bold uppercase tracking-widest leading-none">
                  {d.toLocaleString('en-US', { month: 'short' }).toUpperCase()}
                </p>
                <p className="text-[#1A1A1A] text-xl font-serif font-bold leading-none">{d.getDate()}</p>
                <p className="text-stone-400 text-[9px]">{d.getFullYear()}</p>
              </div>
              <div className="w-px h-10 bg-stone-100 mx-1" />
              <div>
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>
                  {event.category}
                </span>
                {isPast && <span className="ml-2 text-[9px] font-bold uppercase tracking-widest text-stone-300">Past</span>}
              </div>
            </div>
            <button
              onClick={() => setExpanded(isOpen ? null : event.id)}
              className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center active:scale-90 transition-transform"
            >
              {isOpen ? <ChevronUp size={15} className="text-stone-500" /> : <ChevronDown size={15} className="text-stone-500" />}
            </button>
          </div>

          <h3 className="font-serif font-bold text-[#1A1A1A] text-base leading-snug">{event.title}</h3>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <p className="text-stone-500 text-sm leading-relaxed mt-3">{event.description}</p>
                <div className="flex items-center gap-1.5 mt-3 text-stone-400 text-[11px]">
                  <MapPin size={11} className="text-[#C9973A]" />
                  Rwanda, Rubavu District
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF6EF]">

      {/* Header */}
      <div className="bg-[#1A1A1A] pt-12 pb-4 px-5">
        <div className="flex items-center gap-2 mb-1">
          <CalendarDays size={14} className="text-[#C9973A]" />
          <span className="text-[#C9973A] text-[10px] font-bold uppercase tracking-[0.35em]">Calendar of Excellence</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-white">Events</h1>
        <p className="text-stone-400 text-sm mt-1">Exclusive experiences at Chef Bruno.</p>
      </div>

      {/* Filter tabs */}
      <div className="bg-[#1A1A1A] border-b border-white/5 sticky top-0 z-20">
        <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                filter === f
                  ? 'bg-[#C9973A] text-[#1A1A1A] border-[#C9973A]'
                  : 'text-stone-500 border-white/10 bg-transparent'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-5 pb-4 space-y-5">

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#C9973A]" size={32} />
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
            <CalendarDays size={44} className="text-stone-300 mx-auto mb-4" strokeWidth={1.4} />
            <p className="text-stone-500 font-serif text-lg font-bold">No Events Yet</p>
            <p className="text-stone-400 text-sm mt-2">Upcoming events will appear here.</p>
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9973A] mb-3 flex items-center gap-2">
              <span className="w-5 h-px bg-[#C9973A]" /> Upcoming
            </p>
            <div className="space-y-3">
              {upcoming.map((event, idx) => <EventCard key={event.id} event={event} idx={idx} />)}
            </div>
          </div>
        )}

        {!loading && filtered.length === 0 && events.length > 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
            <Tag size={32} className="text-stone-300 mx-auto mb-3" />
            <p className="text-stone-400 font-serif">No {filter} events found.</p>
          </div>
        )}

        {/* Past */}
        {past.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-2">
              <span className="w-5 h-px bg-stone-300" /> Past Events
            </p>
            <div className="space-y-3">
              {past.map((event, idx) => <EventCard key={event.id} event={event} idx={idx} />)}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AppEvents;