// FILE: src/pages/CulinaryAcademy.tsx
import React, { useEffect } from 'react';
import AcademyModuleCard from '../components/AcademyModuleCard';
import { useAcademy } from '../hooks/useAcademy';
import { motion } from 'motion/react';
import { Award, GraduationCap, Users } from 'lucide-react';

const CulinaryAcademy = () => {
  const { modules, loading } = useAcademy();

  useEffect(() => {
    document.title = 'Culinary Academy | Chef Bruno';
  }, []);

  return (
    <div className="pt-20 bg-stone-50 min-h-screen">
      {/* Header Section */}
      <section className="py-24 px-4 md:px-8 bg-[#7C2D2D] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-amber-400 text-xs font-bold uppercase tracking-[0.4em] mb-4 block">Professional Training</span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
              Culinary Academy
            </h1>
            <p className="text-xl text-stone-200 font-light max-w-2xl mx-auto mb-10">
              Master the art of fine dining with Chef Bruno. Our comprehensive certification sets the gold standard in hospitality.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center text-white text-sm font-bold uppercase tracking-widest leading-none">
                <Award size={18} className="text-amber-400 mr-2" />
                BCCP Certified
              </div>
              <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center text-white text-sm font-bold uppercase tracking-widest leading-none">
                <Users size={18} className="text-amber-400 mr-2" />
                Limited Seats
              </div>
              <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center text-white text-sm font-bold uppercase tracking-widest leading-none">
                <GraduationCap size={18} className="text-amber-400 mr-2" />
                Expert Mentorship
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Program Details */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold uppercase tracking-[0.5em] text-amber-600 mb-4 italic">The Curriculum</h2>
            <h3 className="text-4xl font-serif font-bold text-stone-900">Culinary Mastery Certification</h3>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-12">
              {modules.map((module) => (
                <AcademyModuleCard key={module.id} module={module} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Enrollment CTA */}
      <section className="py-24 px-4 md:px-8 bg-stone-900 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-amber-600/10 skew-x-12 translate-x-20"></div>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between relative z-10 gap-12">
          <div className="max-w-2xl text-center lg:text-left">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Ready to Elevate Your Culinary Career?</h2>
            <p className="text-lg text-stone-400 font-light mb-8">
              Join the next cohort of Chef Bruno Academy. Enrollment is currently open for the upcoming semester.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="/contact" className="px-10 py-5 bg-amber-600 text-stone-900 font-bold text-sm uppercase tracking-widest rounded-sm hover:bg-amber-500 transition-all shadow-xl">
                Apply for Enrollment
              </a>
              <a href="/contact" className="px-10 py-5 border border-white/20 text-white font-bold text-sm uppercase tracking-widest rounded-sm hover:bg-white hover:text-stone-900 transition-all">
                Download Brochure
              </a>
            </div>
          </div>
          <div className="w-full lg:w-1/3 aspect-[4/5] bg-stone-800 rounded-sm overflow-hidden shadow-2xl relative">
             <img 
               src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000" 
               alt="Chef at work" 
               className="w-full h-full object-cover grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-700" 
             />
             <div className="absolute inset-0 border-[12px] border-white/5 pointer-events-none"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CulinaryAcademy;
