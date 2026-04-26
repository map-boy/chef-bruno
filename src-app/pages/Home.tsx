// FILE: src/pages/Home.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import SectionPreview from '../components/SectionPreview';
import RoomCard from '../components/RoomCard';
import ServiceCard from '../components/ServiceCard';
import EventCard from '../components/EventCard';
import { useRooms } from '../hooks/useRooms';
import { useServices } from '../hooks/useServices';
import { useEvents } from '../hooks/useEvents';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { motion } from 'motion/react';

const Home = () => {
  const { rooms } = useRooms();
  const { services } = useServices();
  const { events } = useEvents();
  const { settings } = useSiteSettings();

  useEffect(() => {
    document.title = `${settings.brandName} | Home`;
  }, [settings.brandName]);

  return (
    <div className="bg-stone-50">
      <HeroSection
        title={settings.brandName}
        subtitle={settings.tagline}
        imageUrl={settings.heroImageUrl}
      />

      {/* Featured Rooms - fixed layout */}
      <section className="py-24 px-4 md:px-8 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center mb-6">
                <div className="w-10 h-px bg-[#C9973A] mr-4"></div>
                <span className="text-[#C9973A] text-[10px] font-bold uppercase tracking-[0.4em]">Discovery</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-[#1A1A1A] mb-4 border-b border-stone-200 pb-4">
                Luxury Suites
              </h2>
              <p className="text-lg text-stone-600 font-light">
                Experience true sanctuary with modern comfort and classical culinary aesthetics.
              </p>
            </div>
            <Link
              to="/rooms"
              className="group flex items-center text-stone-900 font-bold uppercase tracking-widest text-xs border-b-2 border-amber-600 pb-2 hover:border-amber-500 transition-all shrink-0"
            >
              View All
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="space-y-6">
            {rooms.slice(0, 3).map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      </section>

      {/* Culinary Academy Teaser */}
      <section className="py-24 bg-stone-900 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl"
          >
            <span className="text-amber-500 text-xs font-bold uppercase tracking-[0.4em] mb-4 block">BCCP Certification</span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8">
              Chef Bruno Certified Culinary Professional
            </h2>
            <p className="text-lg text-stone-400 font-light leading-relaxed mb-12">
              Join our intensive culinary academy and master the science of taste, advanced techniques, and the business of gastronomy. Your journey to kitchen mastery begins here.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/academy" className="px-10 py-5 bg-amber-600 text-stone-900 font-bold text-sm uppercase tracking-widest rounded-sm hover:bg-amber-500 transition-all">
                Explore The Program
              </Link>
              <Link to="/about" className="px-10 py-5 border border-white/20 text-white font-bold text-sm uppercase tracking-widest rounded-sm hover:bg-white hover:text-stone-950 transition-all">
                The Chef's Story
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Professional Services */}
      <SectionPreview
        title="Expert Solutions"
        subtitle="From high-end catering to nutritional coaching, we bring excellence to every plate."
        viewAllLink="/services"
        bgWhite={false}
      >
        {services.slice(0, 3).map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </SectionPreview>

      {/* Upcoming Events */}
      <SectionPreview
        title="Exclusive Experiences"
        subtitle="Be part of our curated events, from local food galas to hospitality summits."
        viewAllLink="/events"
      >
        {events.slice(0, 3).map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </SectionPreview>

      {/* Contact CTA */}
      <section className="py-24 px-4 bg-amber-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-6">Plan Your Visit</h2>
          <p className="text-lg text-stone-600 mb-10">Have questions about our academy or room availability? Our team is ready to assist you.</p>
          <Link
            to="/contact"
            className="inline-block px-12 py-5 bg-stone-900 text-white font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-stone-800 transition-all shadow-lg"
          >
            Contact Reservation Desk
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;