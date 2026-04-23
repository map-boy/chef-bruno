// FILE: src/pages/About.tsx
import React, { useEffect } from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { motion } from 'motion/react';
import { Target, Compass, Sparkles } from 'lucide-react';

const About = () => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    document.title = 'Our Story | Chef Bruno';
  }, []);

  return (
    <div className="pt-20 bg-stone-50 min-h-screen pb-24">
      {/* Visual Header */}
      <section className="h-[60vh] relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-stone-900">
           <img 
             src={settings.aboutImageUrl || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=2000"} 
             alt="Our Story" 
             className="w-full h-full object-cover opacity-50"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-transparent to-stone-900/40"></div>
        </div>
        <div className="relative z-10 text-center">
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="px-6 py-2 bg-amber-600 shadow-xl inline-block rounded-sm mb-6"
           >
              <span className="text-stone-900 text-xs font-bold uppercase tracking-[0.4em]">Establishment 2010</span>
           </motion.div>
           <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white drop-shadow-lg">
             Our Story
           </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-20 relative z-20">
         <div className="bg-white p-8 md:p-20 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] rounded-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
               {/* Left Side: Badge & Label */}
               <div className="lg:col-span-4">
                  <div className="sticky top-32">
                     <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 rounded-sm mb-8">
                        <Sparkles size={16} className="text-amber-500" />
                        <span className="text-amber-500 text-[10px] font-bold uppercase tracking-widest leading-none">15+ Years of Excellence</span>
                     </div>
                     <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 leading-tight">
                        Crafting Unforgettable Culinary and Hospitality Experiences
                     </h2>
                     <div className="w-16 h-1 bg-amber-600 mt-8 rounded-full"></div>
                  </div>
               </div>

               {/* Right Side: Text Body */}
               <div className="lg:col-span-8 space-y-10">
                  <div className="text-xl text-stone-600 font-light leading-relaxed">
                     Chef Bruno Hotel & Culinary Center is a luxury destination where world-class gastronomy meets exceptional hospitality. We offer premium accommodations, professional culinary training, and an immersive sensory experience for food enthusiasts and travelers alike.
                  </div>
                  <div className="text-stone-500 leading-relaxed text-base">
                     Chef Bruno began with a simple vision: to merge the precision of world-class culinary arts with the warmth of luxury hospitality. Today, we stand as a beacon of excellence in the heart of Rubavu, Rwanda. Our commitment to innovation, safety, and delicious flavors has made us a leader in the culinary workspace.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-stone-100">
                     <motion.div
                       initial={{ opacity: 0, x: -20 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       viewport={{ once: true }}
                       className="p-8 bg-stone-50 rounded-sm border-l-4 border-amber-600"
                     >
                        <Target className="text-amber-600 mb-6" size={40} />
                        <h4 className="text-xl font-serif font-bold text-stone-900 mb-4 uppercase tracking-tight">Our Vision</h4>
                        <p className="text-sm text-stone-600 leading-relaxed font-light">
                           {settings.vision}
                        </p>
                     </motion.div>
                     <motion.div
                       initial={{ opacity: 0, x: 20 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       viewport={{ once: true }}
                       className="p-8 bg-stone-900 rounded-sm"
                     >
                        <Compass className="text-amber-500 mb-6" size={40} />
                        <h4 className="text-xl font-serif font-bold text-white mb-4 uppercase tracking-tight">Our Mission</h4>
                        <p className="text-sm text-stone-400 leading-relaxed font-light">
                           {settings.mission}
                        </p>
                     </motion.div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Values Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { title: 'Quality', desc: 'Sourcing only the finest ingredients and providing top-tier service.' },
            { title: 'Innovation', desc: 'Constantly pushing the boundaries of traditional culinary arts.' },
            { title: 'Integrity', desc: 'Professionalism and honesty in every interaction.' }
          ].map((val, i) => (
             <div key={i}>
                <h5 className="text-amber-600 text-xs font-bold uppercase tracking-[0.4em] mb-4">{val.title}</h5>
                <p className="text-stone-500 text-sm font-light leading-relaxed max-w-xs mx-auto">{val.desc}</p>
             </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
