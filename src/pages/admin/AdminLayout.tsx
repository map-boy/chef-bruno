// FILE: src/pages/admin/AdminLayout.tsx
import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { auth, ADMIN_EMAILS } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  LayoutDashboard,
  Bed, 
  Calendar, 
  BookOpen, 
  Utensils, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Loader2,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

const menuItems = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
  { name: 'Rooms', icon: <Bed size={20} />, path: '/admin/rooms' },
  { name: 'Events', icon: <Calendar size={20} />, path: '/admin/events' },
  { name: 'Academy', icon: <BookOpen size={20} />, path: '/admin/academy' },
  { name: 'Services', icon: <Utensils size={20} />, path: '/admin/services' },
  { name: 'Global Settings', icon: <Settings size={20} />, path: '/admin/settings' },
  { name: 'Media Help', icon: <HelpCircle size={20} />, path: '/admin/media-help' },
];

const AdminLayout = () => {
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || !ADMIN_EMAILS.includes(user.email!)) {
        navigate('/admin/login');
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-600" size={48} />
      </div>
    );
  }

  const currentUser = auth.currentUser;
  const isOwner = currentUser?.email === 'shimirwabruno1@gmail.com';

  return (
    <div className="min-h-screen bg-stone-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`bg-stone-900 border-r border-stone-800 transition-all duration-300 z-50 fixed lg:static inset-y-0 left-0 ${
          isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 lg:w-20 -translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-stone-800 flex items-center justify-between">
            <Link to="/" className="flex flex-col whitespace-nowrap overflow-hidden">
              <span className="text-xl font-serif font-bold text-white leading-none">Management</span>
              <span className="text-[9px] uppercase tracking-widest text-amber-500 font-bold mt-1">Chef Bruno Panel</span>
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-stone-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-grow py-8 px-3 overflow-y-auto">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all group ${
                      isActive 
                        ? 'bg-amber-600 text-stone-900 shadow-lg' 
                        : 'text-stone-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className={isActive ? 'text-stone-900' : 'text-amber-500 group-hover:scale-110 transition-transform'}>
                      {item.icon}
                    </span>
                    {isSidebarOpen && (
                      <span className="text-sm font-bold uppercase tracking-widest grow">
                        {item.name}
                      </span>
                    )}
                    {isSidebarOpen && isActive && <ChevronRight size={14} />}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="p-6 border-t border-stone-800">
             <button
               onClick={() => signOut(auth)}
               className="w-full flex items-center gap-4 px-4 py-3.5 rounded-lg text-stone-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-xs uppercase tracking-widest"
             >
                <LogOut size={20} className="text-red-500" />
                {isSidebarOpen && <span>Sign Out</span>}
             </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-stone-200 px-6 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-stone-500 hover:bg-stone-50 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
              <h2 className="text-xl font-serif font-bold text-stone-900 hidden md:block">
                 {menuItems.find(i => i.path === location.pathname)?.name || 'Admin'}
              </h2>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-stone-900 leading-none">
                  {currentUser?.displayName || 'Admin'}
                </p>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mt-1">
                  {isOwner ? 'Owner' : 'Developer'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-stone-900 border-2 border-stone-100 flex items-center justify-center text-amber-500 font-bold overflow-hidden shadow-inner">
                {currentUser?.photoURL 
                  ? <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  : <span className="text-sm font-bold">{currentUser?.displayName?.[0] || 'A'}</span>
                }
              </div>
           </div>
        </header>

        <div className="flex-grow overflow-y-auto p-6 md:p-10 bg-stone-50 pb-24">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;