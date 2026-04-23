// FILE: src/components/SectionPreview.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface SectionPreviewProps {
  title: string;
  subtitle: string;
  viewAllLink: string;
  children: React.ReactNode;
  bgWhite?: boolean;
}

const SectionPreview: React.FC<SectionPreviewProps> = ({
  title,
  subtitle,
  viewAllLink,
  children,
  bgWhite = true
}) => {
  return (
    <section className={`py-24 px-4 md:px-8 ${bgWhite ? 'bg-stone-50' : 'bg-stone-100'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center mb-6"
            >
              <div className="w-10 h-px bg-[#C9973A] mr-4"></div>
              <span className="text-[#C9973A] text-[10px] font-bold uppercase tracking-[0.4em]">Discovery</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-serif text-[#1A1A1A] mb-4 border-b border-stone-200 pb-4"
            >
              {title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-stone-600 font-light"
            >
              {subtitle}
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link 
              to={viewAllLink}
              className="group flex items-center text-stone-900 font-bold uppercase tracking-widest text-xs border-b-2 border-amber-600 pb-2 hover:border-amber-500 transition-all"
            >
              View All 
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={14} />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {children}
        </div>
      </div>
    </section>
  );
};

export default SectionPreview;
