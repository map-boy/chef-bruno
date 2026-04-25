// FILE: src/components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronRight, ChevronDown } from 'lucide-react';
import { auth, ADMIN_EMAILS } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [contentOpen, setContentOpen] = useState(false);
  const location = useLocation();

  const isHomePage = location.pathname === '/';
  const isSolid = !isHomePage || isScrolled;

  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(false);
      return;
    }
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setContentOpen(false);
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home',     path: '/' },
    { name: 'Rooms',    path: '/rooms' },
    { name: 'Culinary', path: '/academy' },
    { name: 'Events',   path: '/events' },
    { name: 'Services', path: '/services' },
    { name: 'About',    path: '/about' },
    { name: 'Contact',  path: '/contact' },
  ];

  const contentLinks = [
    { name: 'Video Series', path: '/videos', badge: '10 Episodes' },
    { name: 'Books',        path: '/books',  badge: '3 Volumes' },
    { name: 'Blog',         path: '/blog',   badge: '12 Articles' },
  ];

  const handleLogout = async () => { await signOut(auth); };
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);
  const isContentActive = ['/videos', '/books', '/blog'].includes(location.pathname);

  return (
    <nav className={cn(
      'fixed top-0 left-0 w-full z-50 transition-all duration-300',
      isSolid ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A1A1A] flex items-center justify-center rounded-sm shrink-0 shadow-lg">
              <span className="text-[#C9973A] text-xl font-serif font-bold italic">B</span>
            </div>
            <div className="flex flex-col">
              <span className={cn(
                'text-xl font-serif font-bold tracking-tight transition-colors leading-none',
                isSolid ? 'text-stone-900' : 'text-white'
              )}>
                CHEF BRUNO
              </span>
              <span className={cn(
                'text-[8px] uppercase tracking-[0.4em] font-bold mt-1',
                isSolid ? 'text-stone-400' : 'text-stone-300'
              )}>
                Hospitality Excellence
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}
                className={cn(
                  'text-[10px] font-bold uppercase tracking-[0.25em] transition-all relative pb-1 group',
                  location.pathname === link.path
                    ? 'text-amber-600'
                    : (isSolid ? 'text-stone-600 hover:text-stone-900' : 'text-stone-200 hover:text-white')
                )}
              >
                {link.name}
                <span className={cn(
                  'absolute bottom-0 left-0 h-px bg-amber-600 transition-all duration-300',
                  location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                )} />
              </Link>
            ))}

            {/* Content Dropdown */}
            <div className="relative" onMouseLeave={() => setContentOpen(false)}>
              <button
                onMouseEnter={() => setContentOpen(true)}
                onClick={() => setContentOpen(!contentOpen)}
                className={cn(
                  'flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.25em] transition-all pb-1 relative group',
                  isContentActive
                    ? 'text-amber-600'
                    : (isSolid ? 'text-stone-600 hover:text-stone-900' : 'text-stone-200 hover:text-white')
                )}
              >
                Content
                <ChevronDown size={10} className={`transition-transform ${contentOpen ? 'rotate-180' : ''}`} />
                <span className={cn(
                  'absolute bottom-0 left-0 h-px bg-amber-600 transition-all duration-300',
                  isContentActive ? 'w-full' : 'w-0 group-hover:w-full'
                )} />
              </button>
              <AnimatePresence>
                {contentOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 bg-white rounded-xl shadow-2xl border border-stone-100 overflow-hidden"
                  >
                    {contentLinks.map(cl => (
                      <Link key={cl.path} to={cl.path}
                        className="flex items-center justify-between px-5 py-4 hover:bg-stone-50 group/item transition-colors border-b border-stone-50 last:border-0"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-700 group-hover/item:text-[#C9973A] transition-colors">
                          {cl.name}
                        </span>
                        <span className="text-[8px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                          {cl.badge}
                        </span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/book"
              className="bg-[#C9973A] hover:bg-[#b08432] text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95 shadow-md"
            >
              Book Now
            </Link>

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className={cn('p-2 rounded-full hover:bg-black/10 transition-colors', isSolid ? 'text-stone-700' : 'text-stone-100')}
                title="Admin Panel"
              >
                <User size={20} />
              </Link>
            )}

            {user ? (
              <button
                onClick={handleLogout}
                className={cn('p-2 rounded-full hover:bg-black/10 transition-colors', isSolid ? 'text-stone-700' : 'text-stone-100')}
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            ) : (
              <Link
                to="/admin/login"
                className={cn('p-2 rounded-full hover:bg-black/10 transition-colors', isSolid ? 'text-stone-700' : 'text-stone-100')}
                title="Admin Login"
              >
                <User size={20} />
              </Link>
            )}
          </div>

          {/* Mobile Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn('p-2', isSolid ? 'text-stone-900' : 'text-white')}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 w-full bg-stone-900 text-white shadow-2xl py-8 px-6 flex flex-col space-y-4 max-h-[85vh] overflow-y-auto"
          >
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}
                className={cn(
                  'text-xl font-medium flex justify-between items-center group py-2',
                  location.pathname === link.path ? 'text-amber-500' : 'text-stone-300 hover:text-white'
                )}
              >
                {link.name}
                <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}

            <div className="border-t border-white/10 pt-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-stone-500 mb-3">Content</p>
              {contentLinks.map(cl => (
                <Link key={cl.path} to={cl.path} onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center justify-between py-3 text-lg font-medium',
                    location.pathname === cl.path ? 'text-amber-500' : 'text-stone-300 hover:text-white'
                  )}
                >
                  {cl.name}
                  <span className="text-[9px] text-stone-500 bg-stone-800 px-2 py-0.5 rounded-full">{cl.badge}</span>
                </Link>
              ))}
            </div>

            <Link
              to="/book"
              onClick={() => setIsOpen(false)}
              className="bg-amber-600 text-white px-6 py-4 text-lg font-bold text-center active:scale-95 transition-transform mt-2"
            >
              Book Now
            </Link>

            <div className="pt-4 flex justify-center space-x-8 border-t border-white/10">
              {isAdmin && (
                <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-white">
                  Admin Panel
                </Link>
              )}
              {user
                ? <button onClick={() => { handleLogout(); setIsOpen(false); }} className="text-stone-400 hover:text-white">Logout</button>
                : <Link to="/admin/login" onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-white">Admin Login</Link>
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;