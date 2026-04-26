// FILE: src/components/BottomNav.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bed, BookOpen, CalendarDays, MoreHorizontal } from 'lucide-react';

const tabs = [
  { name: 'Home',    path: '/',        icon: Home },
  { name: 'Rooms',   path: '/rooms',   icon: Bed },
  { name: 'Academy', path: '/academy', icon: BookOpen },
  { name: 'Events',  path: '/events',  icon: CalendarDays },
  { name: 'More',    path: '/services',icon: MoreHorizontal },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 safe-bottom"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-stretch h-16">
        {tabs.map(({ name, path, icon: Icon }) => {
          const isActive = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path);
          return (
            <Link key={path} to={path}
              className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <div className={`p-1 rounded-lg transition-all ${isActive ? 'bg-amber-100' : ''}`}>
                <Icon
                  size={22}
                  className={isActive ? 'text-[#C9973A]' : 'text-stone-400'}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-widest ${
                isActive ? 'text-[#C9973A]' : 'text-stone-400'
              }`}>{name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;