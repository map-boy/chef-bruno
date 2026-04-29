// PATH: src-app/components/BottomNav.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bed, BookOpen, Video, CalendarDays } from 'lucide-react';

const tabs = [
  { name: 'Home',    path: '/',        icon: Home },
  { name: 'Rooms',   path: '/rooms',   icon: Bed },
  { name: 'Learn',   path: '/learn',   icon: BookOpen },
  { name: 'Live',    path: '/live',    icon: Video },
  { name: 'Events',  path: '/events',  icon: CalendarDays },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A1A] border-t border-white/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch h-[62px]">
        {tabs.map(({ name, path, icon: Icon }) => {
          const isActive = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className="flex-1 flex flex-col items-center justify-center gap-[3px] transition-all active:scale-90"
            >
              <div className={`w-10 h-6 flex items-center justify-center rounded-full transition-all duration-200 ${
                isActive ? 'bg-[#C9973A]/15' : ''
              }`}>
                <Icon
                  size={20}
                  className={isActive ? 'text-[#C9973A]' : 'text-stone-500'}
                  strokeWidth={isActive ? 2.4 : 1.7}
                />
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-widest leading-none ${
                isActive ? 'text-[#C9973A]' : 'text-stone-600'
              }`}>
                {name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;