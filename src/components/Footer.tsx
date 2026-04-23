// FILE: src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Film, BookOpen, PenLine } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A1A1A] text-stone-400">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-stone-900 border border-amber-600/30 flex items-center justify-center rounded-sm">
              <span className="text-[#C9973A] text-xl font-serif font-bold italic">B</span>
            </div>
            <div>
              <p className="text-white font-serif font-bold text-lg leading-none">CHEF BRUNO</p>
              <p className="text-[8px] uppercase tracking-[0.4em] text-stone-600 mt-1">Hotel & Culinary Center</p>
            </div>
          </div>
          <p className="text-stone-500 text-sm leading-relaxed max-w-sm mb-6">
            A luxury destination where world-class gastronomy meets exceptional hospitality.
            Premium accommodations, professional culinary training, and immersive sensory experiences.
          </p>
          <div className="flex items-center gap-5">
            <a href="https://tiktok.com/@shimirwabruno" target="_blank" rel="noopener noreferrer"
              className="text-[9px] font-bold uppercase tracking-[0.3em] text-stone-500 hover:text-[#C9973A] transition-colors">
              TikTok @Shimirwa Bruno
            </a>
            <span className="w-px h-4 bg-stone-700" />
            <a href="https://instagram.com/shimirwabruno" target="_blank" rel="noopener noreferrer"
              className="text-[9px] font-bold uppercase tracking-[0.3em] text-stone-500 hover:text-[#C9973A] transition-colors">
              IG @Shimirwa Bruno
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-stone-600 mb-6">Quick Links</p>
          <ul className="space-y-3">
            {[
              { label: 'Luxury Rooms',     path: '/rooms' },
              { label: 'Culinary Academy', path: '/academy' },
              { label: 'Our Services',     path: '/services' },
              { label: 'Our Story',        path: '/about' },
              { label: 'Contact Us',       path: '/contact' },
              { label: 'Book Your Stay',   path: '/book' },
            ].map(link => (
              <li key={link.path}>
                <Link to={link.path} className="text-sm text-stone-500 hover:text-[#C9973A] transition-colors flex items-center gap-2 group">
                  <span className="w-0 h-px bg-[#C9973A] group-hover:w-3 transition-all duration-300" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-stone-600 mt-8 mb-4">Content</p>
          <ul className="space-y-3">
            {[
              { label: 'Video Series', path: '/videos', icon: <Film size={11} /> },
              { label: 'Books',        path: '/books',  icon: <BookOpen size={11} /> },
              { label: 'Blog',         path: '/blog',   icon: <PenLine size={11} /> },
            ].map(link => (
              <li key={link.path}>
                <Link to={link.path} className="text-sm text-stone-500 hover:text-[#C9973A] transition-colors flex items-center gap-2 group">
                  <span className="text-stone-600 group-hover:text-[#C9973A] transition-colors">{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-stone-600 mb-6">Contact</p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <MapPin size={14} className="text-[#C9973A] shrink-0 mt-0.5" />
              <span className="text-sm text-stone-500 leading-relaxed">Rwanda, West Province<br />Rubavu District</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={14} className="text-[#C9973A] shrink-0" />
              <a href="tel:+250790167349" className="text-sm text-stone-500 hover:text-[#C9973A] transition-colors">+250 790 167 349</a>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={14} className="text-[#C9973A] shrink-0" />
              <a href="tel:+250722717174" className="text-sm text-stone-500 hover:text-[#C9973A] transition-colors">+250 722 717 174</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={14} className="text-[#C9973A] shrink-0" />
              <a href="mailto:shimirwabruno1@gmail.com" className="text-sm text-stone-500 hover:text-[#C9973A] transition-colors break-all">
                shimirwabruno1@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[9px] uppercase tracking-[0.4em] text-stone-700">
            © {currentYear} Chef Bruno Hotel & Culinary Center. All Rights Reserved.
          </p>
          <p className="text-[9px] uppercase tracking-[0.4em] text-stone-700">Excellence in Hospitality Management</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;