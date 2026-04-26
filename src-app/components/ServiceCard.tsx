// FILE: src/components/ServiceCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Utensils, Info } from 'lucide-react';
import { Service } from '../types';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative h-80 overflow-hidden bg-stone-900 border border-stone-800"
    >
      <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700">
        {service.imageUrl ? (
          <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover grayscale transition-transform duration-1000 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-stone-800" />
        )}
      </div>

      <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent">
        <span className="text-[#C9973A] text-[9px] font-bold uppercase tracking-[0.3em] mb-2 block">
          {service.category}
        </span>
        <h3 className="text-2xl font-serif text-white mb-3 leading-tight group-hover:text-[#C9973A] transition-colors">
          {service.title}
        </h3>
        <p className="text-stone-300 text-[11px] font-light leading-relaxed line-clamp-2 mb-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
          {service.description}
        </p>
        <Link
          to="/contact"
          className="w-fit text-[9px] font-bold uppercase tracking-[0.4em] text-white border-b border-white/30 pb-1 hover:border-[#C9973A] hover:text-[#C9973A] transition-all"
        >
          Inquire Now
        </Link>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
