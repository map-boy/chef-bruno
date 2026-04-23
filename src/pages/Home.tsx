// FILE: src/pages/Home.tsx
import React, { useEffect } from 'react';
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

      {/* Featured Rooms */}
      <SectionPreview
        title="Luxury Suites"
        subtitle="Experience true sanctuary with modern comfort and classical culinary aesthetics."
        viewAllLink="/rooms"
      >
        <div className="lg:col-span-3 space-y-6">
          {rooms.slice(0, 3).map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </SectionPreview>

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
              <a href="/academy" className="px-10 py-5 bg-amber-600 text-stone-900 font-bold text-sm uppercase tracking-widest rounded-sm hover:bg-amber-500 transition-all">
                Explore The Program
              </a>
              <a href="/about" className="px-10 py-5 border border-white/20 text-white font-bold text-sm uppercase tracking-widest rounded-sm hover:bg-white hover:text-stone-950 transition-all">
                The Chef's Story
              </a>
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

      {/* Newsletter/Contact CTA */}
      <section className="py-24 px-4 bg-amber-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-6">Plan Your Visit</h2>
          <p className="text-lg text-stone-600 mb-10">Have questions about our academy or room availability? Our team is ready to assist you.</p>
          <a
            href="/contact"
            className="inline-block px-12 py-5 bg-stone-900 text-white font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-stone-800 transition-all shadow-lg"
          >
            Contact Reservation Desk
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
