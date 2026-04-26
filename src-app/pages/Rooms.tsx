// FILE: src/pages/Rooms.tsx
import React, { useEffect } from 'react';
import RoomCard from '../components/RoomCard';
import { useRooms } from '../hooks/useRooms';
import { motion } from 'motion/react';
import { Wine, Sparkles, Coffee, ShieldCheck, Flower2, BookOpen } from 'lucide-react';

const Rooms = () => {
  const { rooms, loading } = useRooms();

  useEffect(() => {
    document.title = 'Luxury Accommodations | Chef Bruno';
  }, []);

  const amenities = [
    { icon: <ShieldCheck />, title: '24/7 Professional Kitchen Access', desc: 'Full access to our high-end equipment for all guests.' },
    { icon: <Flower2 />, title: 'Organic Herb Garden', desc: 'Pluck fresh ingredients for your meals directly from our site.' },
    { icon: <Coffee />, title: 'Private Dining Experiences', desc: 'Curated in-room dining prepared by our academy students.' },
    { icon: <Sparkles />, title: 'Luxury Spa and Wellness Center', desc: 'Relax and rejuvenate with our targeted wellness treatments.' },
    { icon: <BookOpen />, title: 'Culinary Library', desc: 'Access to rare cookbooks and gastronomy research papers.' },
    { icon: <Wine />, title: 'Complimentary Wine Tasting', desc: 'Evening sessions featuring the best local and international selections.' },
  ];

  return (
    <div className="pt-20 bg-stone-50 min-h-screen">
      {/* Header Section */}
      <section className="py-24 px-4 md:px-8 bg-stone-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <span className="text-amber-500 text-xs font-bold uppercase tracking-[0.4em] mb-4 block">Our Collections</span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8">
              Luxury Accommodations
            </h1>
            <p className="text-xl text-stone-400 font-light max-w-2xl mx-auto">
              Experience the pinnacle of comfort and style. Each space is designed to inspire your culinary soul.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-24 px-4 md:px-8 bg-white border-t border-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-serif font-bold text-stone-900 mb-4">Hotel Amenities</h2>
            <div className="w-16 h-1 bg-amber-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {amenities.map((amenity, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start p-6 rounded-lg hover:bg-stone-50 transition-colors group"
              >
                <div className="w-14 h-14 rounded-sm bg-stone-900 flex items-center justify-center text-amber-500 mb-6 shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-lg">
                  {React.cloneElement(amenity.icon as React.ReactElement, { size: 28 })}
                </div>
                <div className="ml-6">
                  <h4 className="text-lg font-bold text-stone-900 mb-2 font-serif group-hover:text-amber-600 transition-colors uppercase tracking-tight">{amenity.title}</h4>
                  <p className="text-sm text-stone-500 font-light leading-relaxed">{amenity.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Rooms;
