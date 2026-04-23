// FILE: src/components/RoomCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bed, Users, Square } from 'lucide-react';
import { Room } from '../types';

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="group bg-white p-4 shadow-sm border-l-4 border-stone-200 hover:border-[#C9973A] transition-all duration-300 flex flex-col md:flex-row gap-6 h-full"
    >
      <div className="w-full md:w-32 lg:w-40 aspect-square overflow-hidden shrink-0 bg-stone-100">
        {room.imageUrl ? (
          <img 
            src={room.imageUrl} 
            alt={room.name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-400 to-stone-300" />
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif font-bold text-[#1A1A1A] transition-colors group-hover:text-[#C9973A]">
            {room.name}
          </h3>
          <span className="text-[#C9973A] font-bold whitespace-nowrap text-sm ml-4">
            RWF {room.price.toLocaleString()}
          </span>
        </div>
        <p className="text-[11px] text-stone-500 font-light leading-relaxed line-clamp-2 mb-4">
          {room.description}
        </p>
        <Link
          to={`/book?room=${encodeURIComponent(room.name)}`}
          className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C9973A] hover:text-[#1A1A1A] transition-colors mt-auto inline-flex items-center"
        >
          Reserve Now →
        </Link>
      </div>
    </motion.div>
  );
};

export default RoomCard;
