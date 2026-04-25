// FILE: src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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

// Admin
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminRooms from './pages/admin/AdminRooms';
import AdminEvents from './pages/admin/AdminEvents';
import AdminAcademy from './pages/admin/AdminAcademy';
import AdminServices from './pages/admin/AdminServices';
import AdminSettings from './pages/admin/AdminSettings';
import AdminMediaHelp from './pages/admin/AdminMediaHelp';
import AdminDashboard from './pages/admin/AdminDashboard';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const AppContent = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {!isAdminPage && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/rooms"    element={<Rooms />} />
          <Route path="/academy"  element={<CulinaryAcademy />} />
          <Route path="/events"   element={<Events />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about"    element={<About />} />
          <Route path="/contact"  element={<Contact />} />
          <Route path="/book"     element={<BookNow />} />
          <Route path="/videos"   element={<Videos />} />
          <Route path="/books"    element={<Books />} />
          <Route path="/blog"     element={<Blog />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard"  element={<AdminDashboard />} />
            <Route path="rooms"      element={<AdminRooms />} />
            <Route path="events"     element={<AdminEvents />} />
            <Route path="academy"    element={<AdminAcademy />} />
            <Route path="services"   element={<AdminServices />} />
            <Route path="settings"   element={<AdminSettings />} />
            <Route path="media-help" element={<AdminMediaHelp />} />
          </Route>
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
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