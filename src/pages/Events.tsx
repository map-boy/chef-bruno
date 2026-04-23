// FILE: src/pages/Events.tsx
import React, { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import { useEvents } from '../hooks/useEvents';
import { motion, AnimatePresence } from 'motion/react';
import { Filter } from 'lucide-react';

const Events = () => {
  const { events, loading } = useEvents();
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    document.title = 'Upcoming Events | Chef Bruno';
  }, []);

  const filters = ['All', 'Hospitality', 'Culinary', 'Private', 'Other'];

  const filteredEvents = activeFilter === 'All' 
    ? events 
    : events.filter(e => e.category === activeFilter);

  return (
    <div className="pt-20 bg-stone-50 min-h-screen">
      {/* Header */}
      <section className="py-24 px-4 md:px-8 bg-stone-100 border-b border-stone-200">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 inline-block"
          >
            <div className="px-4 py-1 bg-amber-600/10 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-600/20 mb-8">
              Calendar of Excellence
            </div>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 mb-8">
            Upcoming Events
          </h1>
          <p className="text-xl text-stone-500 font-light max-w-2xl mx-auto">
            Discover exclusive experiences, masterclasses, and networking opportunities at the heart of Rwanda.
          </p>
        </div>
      </section>

      {/* Filter & Grid */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
            <div className="flex items-center text-xs font-bold text-stone-400 uppercase tracking-widest">
              <Filter size={16} className="mr-3 text-amber-600" />
              Filter by Category
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-8 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${
                    activeFilter === filter 
                      ? 'bg-amber-600 text-white shadow-lg' 
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32 bg-white rounded-lg border-2 border-dashed border-stone-200"
              >
                <div className="text-stone-300 mb-6 flex justify-center">
                  <Filter size={64} strokeWidth={1} />
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">No events found</h3>
                <p className="text-stone-500 text-sm">We don't have any {activeFilter.toLowerCase()} events scheduled at the moment.</p>
              </motion.div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
              >
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default Events;
