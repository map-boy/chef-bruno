// PATH: src-app/pages/AppHome.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useRooms } from '../hooks/useRooms';
import { useEvents } from '../hooks/useEvents';
import { useSiteSettings } from '../hooks/useSiteSettings';
import {
  Bed, Video, BookOpen, CalendarDays, ChevronRight,
  MapPin, Phone, Star, Sparkles, ArrowRight
} from 'lucide-react';

const QuickAction = ({ to, icon: Icon, label, color }: {
  to: string; icon: any; label: string; color: string;
}) => (
  <Link to={to} className="flex flex-col items-center gap-2 active:scale-90 transition-transform">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${color}`}>
      <Icon size={24} className="text-white" strokeWidth={1.8} />
    </div>
    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">{label}</span>
  </Link>
);

const AppHome: React.FC = () => {
  const { rooms, loading: roomsLoading } = useRooms();
  const { events, loading: eventsLoading } = useEvents();
  const { settings } = useSiteSettings();

  useEffect(() => { document.title = 'Chef Bruno'; }, []);

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAF6EF]">

      {/* ── HERO BANNER ── */}
      <div className="relative h-[52vw] min-h-[200px] max-h-[260px] overflow-hidden">
        {settings.heroImageUrl ? (
          <img src={settings.heroImageUrl} alt="Chef Bruno" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-900 via-[#1A1A1A] to-[#7C2D2D]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin size={11} className="text-[#C9973A]" />
            <span className="text-[#C9973A] text-[10px] font-bold uppercase tracking-[0.3em]">Rubavu, Rwanda</span>
          </div>
          <h1 className="text-white font-serif text-2xl font-bold leading-tight">
            Chef Bruno<br />
            <span className="text-[#C9973A] italic font-light text-xl">Hotel & Culinary Center</span>
          </h1>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="mx-4 -mt-5 bg-white rounded-2xl shadow-md px-5 py-5 z-10 relative">
        <div className="flex justify-around">
          <QuickAction to="/rooms"  icon={Bed}          label="Rooms"   color="bg-[#1A1A1A]" />
          <QuickAction to="/learn"  icon={BookOpen}      label="Learn"   color="bg-[#7C2D2D]" />
          <QuickAction to="/live"   icon={Video}         label="Live"    color="bg-emerald-600" />
          <QuickAction to="/events" icon={CalendarDays}  label="Events"  color="bg-[#C9973A]" />
        </div>
      </div>

      {/* ── BOOK NOW BANNER ── */}
      <div className="mx-4 mt-4">
        <Link to="/book" className="block bg-[#1A1A1A] rounded-2xl overflow-hidden active:scale-[0.98] transition-transform">
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-[#C9973A] text-[10px] font-bold uppercase tracking-widest mb-0.5">Limited Availability</p>
              <p className="text-white font-serif font-bold text-lg leading-tight">Reserve Your Room</p>
              <p className="text-stone-400 text-xs mt-0.5">Premium stays from RWF 120,000/night</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#C9973A] flex items-center justify-center shrink-0">
              <ArrowRight size={18} className="text-[#1A1A1A]" />
            </div>
          </div>
        </Link>
      </div>

      {/* ── ROOMS SECTION ── */}
      <div className="mt-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">Featured Rooms</h2>
          <Link to="/rooms" className="flex items-center gap-0.5 text-[#C9973A] text-[10px] font-bold uppercase tracking-widest">
            See All <ChevronRight size={13} />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {roomsLoading ? (
            [1, 2].map(i => (
              <div key={i} className="shrink-0 w-52 h-44 bg-stone-200 rounded-2xl animate-pulse" />
            ))
          ) : rooms.slice(0, 5).map((room, idx) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="shrink-0 w-52 rounded-2xl overflow-hidden bg-white shadow-sm active:scale-95 transition-transform"
            >
              <Link to={`/book?room=${encodeURIComponent(room.name)}`}>
                <div className="h-32 relative">
                  {room.imageUrl ? (
                    <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-stone-700 to-stone-900" />
                  )}
                  <div className="absolute bottom-2 right-2 bg-[#C9973A] px-2 py-0.5 rounded-full">
                    <span className="text-white text-[10px] font-bold">
                      RWF {room.price.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-bold text-[#1A1A1A] text-sm leading-tight line-clamp-1">{room.name}</p>
                  <p className="text-stone-400 text-[11px] mt-0.5 line-clamp-1">{room.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── ABOUT STRIP ── */}
      <div className="mx-4 mt-5 bg-[#7C2D2D] rounded-2xl px-5 py-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#C9973A]/20 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={15} className="text-[#C9973A]" />
          </div>
          <div>
            <p className="text-amber-300 text-[10px] font-bold uppercase tracking-widest mb-1">Est. 2010 · Rubavu</p>
            <p className="text-white text-sm font-light leading-relaxed line-clamp-3">{settings.description}</p>
          </div>
        </div>
      </div>

      {/* ── UPCOMING EVENTS ── */}
      <div className="mt-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">Upcoming Events</h2>
          <Link to="/events" className="flex items-center gap-0.5 text-[#C9973A] text-[10px] font-bold uppercase tracking-widest">
            See All <ChevronRight size={13} />
          </Link>
        </div>
        {eventsLoading ? (
          <div className="bg-stone-200 rounded-2xl h-24 animate-pulse" />
        ) : upcomingEvents.length === 0 ? (
          <div className="bg-white rounded-2xl px-5 py-6 text-center border border-stone-100">
            <p className="text-stone-400 text-sm">No upcoming events. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((event, idx) => {
              const d = new Date(event.date);
              const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
              const day   = d.getDate();
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="bg-white rounded-2xl px-4 py-4 flex items-center gap-4 border border-stone-100 active:bg-stone-50 transition-colors"
                >
                  <div className="w-12 shrink-0 text-center">
                    <p className="text-[#C9973A] text-[10px] font-bold uppercase tracking-widest">{month}</p>
                    <p className="text-[#1A1A1A] text-2xl font-serif font-bold leading-none">{day}</p>
                  </div>
                  <div className="w-px h-10 bg-stone-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1A1A1A] text-sm leading-tight line-clamp-1">{event.title}</p>
                    <p className="text-stone-400 text-[11px] mt-0.5 line-clamp-1">{event.description}</p>
                  </div>
                  <ChevronRight size={16} className="text-stone-300 shrink-0" />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CONTACT STRIP ── */}
      <div className="mx-4 mt-5 mb-4 bg-white rounded-2xl px-5 py-4 border border-stone-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Contact Us</p>
        <div className="space-y-2">
          <a href="tel:+250790167349" className="flex items-center gap-3 active:opacity-70">
            <div className="w-8 h-8 rounded-full bg-[#C9973A]/10 flex items-center justify-center">
              <Phone size={14} className="text-[#C9973A]" />
            </div>
            <span className="text-sm font-bold text-[#1A1A1A]">+250 790 167 349</span>
          </a>
          <a href="tel:+250722717174" className="flex items-center gap-3 active:opacity-70">
            <div className="w-8 h-8 rounded-full bg-[#C9973A]/10 flex items-center justify-center">
              <Phone size={14} className="text-[#C9973A]" />
            </div>
            <span className="text-sm font-bold text-[#1A1A1A]">+250 722 717 174</span>
          </a>
        </div>
      </div>

    </div>
  );
};

export default AppHome;