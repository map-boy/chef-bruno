// FILE: src/pages/Services.tsx
import React, { useState, useEffect } from 'react';
import ServiceCard from '../components/ServiceCard';
import { useServices } from '../hooks/useServices';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, Star, Check } from 'lucide-react';

const Services = () => {
  const { services, loading } = useServices();
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    document.title = 'Professional Services | Chef Bruno';
  }, []);

  const filters = ['All', 'Catering', 'Nutrition', 'Mobile Food', 'Shopping', 'Market', 'Tutorial', 'Other'];

  const filteredServices = activeFilter === 'All' 
    ? services 
    : services.filter(s => s.category === activeFilter);

  return (
    <div className="pt-20 bg-stone-50 min-h-screen">
      {/* Header */}
      <section className="py-24 px-4 md:px-8 bg-stone-900 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-600/10 border border-amber-600/30 rounded-full mb-8">
              <Star size={14} className="text-amber-500" fill="currentColor" />
              <span className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.3em]">Quality Assured</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8">
              Professional Services
            </h1>
            <p className="text-xl text-stone-400 font-light leading-relaxed max-w-2xl mx-auto">
              Bespoke culinary and hospitality solutions tailored to your unique needs, from high-stakes catering to personal coaching.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Dynamic Filter */}
          <div className="bg-white p-4 rounded-xl shadow-[0_10px_40px_-20px_rgba(0,0,0,0.1)] border border-stone-100 flex flex-wrap justify-center gap-2 mb-20 sticky top-24 z-30 opacity-95 backdrop-blur-md">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-6 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center ${
                  activeFilter === f 
                    ? 'bg-stone-900 text-white shadow-lg' 
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                {activeFilter === f && <Check size={12} className="mr-2 text-amber-500" />}
                {f}
              </button>
            ))}
          </div>

          {/* Grid */}
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-4 md:px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="relative">
              <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden relative shadow-2xl">
                 <img 
                   src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1000" 
                   alt="Plating" 
                   className="w-full h-full object-cover"
                 />
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-600 rounded-2xl flex flex-col items-center justify-center p-6 text-white text-center shadow-xl hidden md:flex">
                 <span className="text-5xl font-serif font-bold mb-2">15+</span>
                 <span className="text-[10px] font-bold uppercase tracking-widest">Years of Experience</span>
              </div>
           </div>
           
           <div>
              <span className="text-amber-600 text-xs font-bold uppercase tracking-[0.5em] mb-4 block">The Chef Bruno Standard</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-8 leading-tight">
                Crafting Culinary Excellence for Every Occasion
              </h2>
              <div className="space-y-8">
                 {[
                   { title: 'Rigorous Sourcing', desc: 'We only use the freshest, most sustainable ingredients from Rubavu and beyond.' },
                   { title: 'Bespoke Menus', desc: 'Every service is customized to your tastes, dietary needs, and event theme.' },
                   { title: 'Technical Mastery', desc: 'Our team uses precision cooking and modern plating to wow your guests.' }
                 ].map((item, idx) => (
                   <div key={idx} className="flex gap-6">
                      <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center shrink-0">
                         <Check size={20} className="text-amber-500" />
                      </div>
                      <div>
                         <h4 className="text-lg font-bold text-stone-900 mb-1 font-serif uppercase tracking-tight">{item.title}</h4>
                         <p className="text-stone-500 text-sm font-light leading-relaxed">{item.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
