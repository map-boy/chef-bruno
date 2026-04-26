// FILE: src/components/HeroSection.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  imageUrl?: string;
  ctaText1?: string;
  ctaLink1?: string;
  ctaText2?: string;
  ctaLink2?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  imageUrl,
  ctaText1 = 'Book Your Stay',
  ctaLink1 = '/book',
  ctaText2 = 'Explore Academy',
  ctaLink2 = '/academy'
}) => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background with Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{ 
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
          background: !imageUrl ? 'linear-gradient(to bottom right, #1c1917, #451a03)' : undefined
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <span className="text-[#C9973A] font-bold tracking-[0.4em] uppercase text-[10px] mb-6 block drop-shadow-sm">
            Rwanda • Rubavu District
          </span>
          <h1 className="text-6xl md:text-8xl font-serif font-light text-white leading-[1.05] mb-8">
            Excellence in <br/><span className="italic">Hospitality</span> <br/>Management
          </h1>
          <p className="text-xl text-stone-300 font-light max-w-lg leading-relaxed mb-12">
            Experience luxury accommodations and world-class culinary training under the guidance of Chef Bruno.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex flex-wrap items-center gap-6"
        >
          <Link
            to={ctaLink1}
            className="px-10 py-4 bg-[#C9973A] text-[#1A1A1A] font-bold text-[10px] uppercase tracking-[0.25em] rounded-none hover:bg-white transition-all shadow-xl active:scale-95"
          >
            {ctaText1}
          </Link>
          <Link
            to={ctaLink2}
            className="px-10 py-4 border border-[#C9973A] text-[#C9973A] font-bold text-[10px] uppercase tracking-[0.25em] rounded-none hover:bg-[#C9973A] hover:text-white transition-all backdrop-blur-sm active:scale-95"
          >
            {ctaText2}
          </Link>
        </motion.div>
      </div>

      {/* Decorative radial pattern overlay (as per Design HTML) */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none z-0" 
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C9973A 1px, transparent 0)', backgroundSize: '32px 32px' }}
      ></div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-50"
      >
        <span className="text-[10px] uppercase tracking-widest text-white mb-2 font-bold">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white to-transparent"></div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
