// FILE: src/components/AcademyModuleCard.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, CheckCircle2, ChevronDown } from 'lucide-react';
import { AcademyModule } from '../types';

interface AcademyModuleCardProps {
  module: AcademyModule;
}

const AcademyModuleCard: React.FC<AcademyModuleCardProps> = ({ module }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white border-l-4 border-[#C9973A] shadow-sm rounded-none overflow-hidden group transition-all duration-300 p-8"
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-6 mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1 block">Module {module.moduleNumber.toString().padStart(2, '0')}</span>
            <h3 className="text-xl font-serif font-bold text-[#1A1A1A] group-hover:text-[#C9973A] transition-colors">
              {module.title}
            </h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-full transition-all ${
              isExpanded ? 'bg-[#C9973A] text-white' : 'bg-stone-50 text-stone-400 hover:text-[#C9973A]'
            }`}
          >
            <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        <p className="text-xs text-stone-500 leading-snug italic mb-4">
          Outcome: {module.outcome}
        </p>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-6 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {module.lessons.map((lesson, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center p-3 rounded-sm bg-stone-50 border border-stone-200/50"
                    >
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-stone-400 text-[10px] font-bold mr-3 shrink-0 border border-stone-100">
                        {idx + 1}
                      </div>
                      <span className="text-xs font-semibold text-stone-700 tracking-tight">{lesson}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </motion.div>
  );
};

export default AcademyModuleCard;
