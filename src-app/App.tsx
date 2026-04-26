// FILE: src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';

// Pages
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import CulinaryAcademy from './pages/CulinaryAcademy';
import Events from './pages/Events';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import BookNow from './pages/BookNow';
import Videos from './pages/Videos';
import Books from './pages/Books';
import Blog from './pages/Blog';
import Classes from './pages/Classes';
import ClassRoom from './pages/ClassRoom';
import NotFound from './pages/NotFound';

// Admin
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRooms from './pages/admin/AdminRooms';
import AdminEvents from './pages/admin/AdminEvents';
import AdminAcademy from './pages/admin/AdminAcademy';
import AdminServices from './pages/admin/AdminServices';
import AdminSettings from './pages/admin/AdminSettings';
import AdminMediaHelp from './pages/admin/AdminMediaHelp';
import AdminBookings from './pages/admin/AdminBookings';
import AdminMessages from './pages/admin/AdminMessages';
import AdminClasses from './pages/admin/AdminClasses';
import AdminBlog from './pages/admin/AdminBlog';
import AdminBooks from './pages/admin/AdminBooks';
import AdminVideos from './pages/admin/AdminVideos';

// Detect Capacitor (native Android/iOS) or narrow mobile web
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

  const isAdminPage  = location.pathname.startsWith('/admin');
  const isClassRoom  = location.pathname.startsWith('/classes/');
  const hideChrome   = isAdminPage || isClassRoom;

  // On mobile app: no Navbar, no Footer — just BottomNav
  // On web:        Navbar + Footer as before
  const showNavbar    = !hideChrome && !isMobile;
  const showFooter    = !hideChrome && !isMobile;
  const showBottomNav = !hideChrome && isMobile;

  // On mobile, pages need bottom padding so content clears the tab bar
  const mainClass = showBottomNav ? 'flex-grow pb-16' : 'flex-grow';

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {showNavbar && <Navbar />}
      <main className={mainClass}>
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/rooms"       element={<Rooms />} />
          <Route path="/academy"     element={<CulinaryAcademy />} />
          <Route path="/events"      element={<Events />} />
          <Route path="/services"    element={<Services />} />
          <Route path="/about"       element={<About />} />
          <Route path="/contact"     element={<Contact />} />
          <Route path="/book"        element={<BookNow />} />
          <Route path="/videos"      element={<Videos />} />
          <Route path="/books"       element={<Books />} />
          <Route path="/blog"        element={<Blog />} />
          <Route path="/classes"     element={<Classes />} />
          <Route path="/classes/:id" element={<ClassRoom />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard"  element={<AdminDashboard />} />
            <Route path="bookings"   element={<AdminBookings />} />
            <Route path="messages"   element={<AdminMessages />} />
            <Route path="rooms"      element={<AdminRooms />} />
            <Route path="events"     element={<AdminEvents />} />
            <Route path="academy"    element={<AdminAcademy />} />
            <Route path="services"   element={<AdminServices />} />
            <Route path="classes"    element={<AdminClasses />} />
            <Route path="blog"       element={<AdminBlog />} />
            <Route path="books"      element={<AdminBooks />} />
            <Route path="videos"     element={<AdminVideos />} />
            <Route path="settings"   element={<AdminSettings />} />
            <Route path="media-help" element={<AdminMediaHelp />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {showFooter    && <Footer />}
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