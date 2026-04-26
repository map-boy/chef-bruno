// FILE: src/components/EventCard.tsx
import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Tag } from 'lucide-react';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const categoryColors = {
    Hospitality: 'bg-blue-100 text-blue-700',
    Culinary: 'bg-amber-100 text-amber-700',
    Private: 'bg-purple-100 text-purple-700',
    Other: 'bg-stone-100 text-stone-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-white rounded-sm overflow-hidden flex flex-col h-full border border-stone-100 group shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center">
            <Calendar size={48} className="text-white/20" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm ${categoryColors[event.category]}`}>
            {event.category}
          </span>
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-center text-amber-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
          <Calendar size={14} className="mr-2" />
          {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        <h3 className="text-2xl font-serif font-bold text-stone-900 mb-4 group-hover:text-amber-600 transition-colors">
          {event.title}
        </h3>
        <p className="text-stone-600 text-sm font-light leading-relaxed mb-6 line-clamp-3">
          {event.description}
        </p>
        <button className="text-xs font-bold uppercase tracking-widest text-amber-600 hover:text-amber-700 transition-colors flex items-center group/btn">
          Learn More 
          <span className="ml-2 group-hover/btn:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </motion.div>
  );
};

export default EventCard;
