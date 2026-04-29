// PATH: src-app/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';

// App Pages
import AppHome from './pages/AppHome';
import AppRooms from './pages/AppRooms';
import AppLearn from './pages/AppLearn';
import AppLive from './pages/AppLive';
import AppEvents from './pages/AppEvents';
import AppBook from './pages/AppBook';

const isNativeApp = (): boolean => {
  return !!(window as any).Capacitor?.isNativePlatform?.() ||
    document.URL.startsWith('capacitor://') ||
    document.URL.startsWith('ionic://');
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const AppContent = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(isNativeApp() || window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const showBottomNav = isMobile;
  const mainClass = showBottomNav ? 'flex-grow pb-[62px]' : 'flex-grow';

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF6EF]">
      <ScrollToTop />
      <main className={mainClass}>
        <Routes>
          <Route path="/"        element={<AppHome />} />
          <Route path="/rooms"   element={<AppRooms />} />
          <Route path="/learn"   element={<AppLearn />} />
          <Route path="/live"    element={<AppLive />} />
          <Route path="/events"  element={<AppEvents />} />
          <Route path="/book"    element={<AppBook />} />
          <Route path="*"        element={<AppHome />} />
        </Routes>
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}