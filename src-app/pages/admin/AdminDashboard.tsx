// FILE: src/pages/admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Bed, Calendar, Utensils, BookOpen, MessageSquare, Hotel, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useRooms } from '../../hooks/useRooms';
import { useEvents } from '../../hooks/useEvents';
import { useServices } from '../../hooks/useServices';
import { useAcademy } from '../../hooks/useAcademy';

const AdminDashboard = () => {
  const { rooms } = useRooms();
  const { events } = useEvents();
  const { services } = useServices();
  const { modules } = useAcademy();

  const [bookings, setBookings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingBookings(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingMessages(false);
    });
    return () => unsub();
  }, []);

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  const stats = [
    { label: 'Rooms', value: rooms.length, icon: <Bed size={20} />, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Events', value: events.length, icon: <Calendar size={20} />, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Services', value: services.length, icon: <Utensils size={20} />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Academy Modules', value: modules.length, icon: <BookOpen size={20} />, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Total Bookings', value: bookings.length, icon: <Hotel size={20} />, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Messages', value: messages.length, icon: <MessageSquare size={20} />, color: 'text-stone-500', bg: 'bg-stone-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Dashboard</h1>
        <p className="text-stone-500 text-sm">Live overview of your site data.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-4 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-3xl font-serif font-bold text-stone-900">{stat.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Booking Status */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center gap-3">
          <Hotel size={22} className="text-amber-500" />
          <h2 className="text-xl font-serif font-bold text-stone-900">Booking Status</h2>
        </div>
        <div className="grid grid-cols-3 divide-x divide-stone-100">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock size={16} className="text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Pending</span>
            </div>
            <p className="text-4xl font-serif font-bold text-amber-500">{pendingBookings.length}</p>
          </div>
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle size={16} className="text-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Confirmed</span>
            </div>
            <p className="text-4xl font-serif font-bold text-emerald-500">{confirmedBookings.length}</p>
          </div>
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <XCircle size={16} className="text-red-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Cancelled</span>
            </div>
            <p className="text-4xl font-serif font-bold text-red-500">{cancelledBookings.length}</p>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hotel size={22} className="text-amber-500" />
            <h2 className="text-xl font-serif font-bold text-stone-900">Recent Bookings</h2>
          </div>
          {pendingBookings.length > 0 && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
              {pendingBookings.length} Pending
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          {loadingBookings ? (
            <p className="p-8 text-center text-stone-400">Loading...</p>
          ) : bookings.length === 0 ? (
            <p className="p-8 text-center text-stone-400">No bookings yet.</p>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Guest</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Room</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Check In</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Check Out</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {bookings.slice(0, 10).map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-stone-900 text-sm">{b.guestName}</p>
                      <p className="text-xs text-stone-400">{b.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">{b.roomType}</td>
                    <td className="px-6 py-4 text-sm text-stone-600">{b.checkIn}</td>
                    <td className="px-6 py-4 text-sm text-stone-600">{b.checkOut}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                        b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent Messages */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center gap-3">
          <MessageSquare size={22} className="text-amber-500" />
          <h2 className="text-xl font-serif font-bold text-stone-900">Recent Messages</h2>
        </div>
        <div className="divide-y divide-stone-100">
          {loadingMessages ? (
            <p className="p-8 text-center text-stone-400">Loading...</p>
          ) : messages.length === 0 ? (
            <p className="p-8 text-center text-stone-400">No messages yet.</p>
          ) : messages.slice(0, 5).map((m) => (
            <div key={m.id} className="p-6 hover:bg-stone-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-stone-900 text-sm">{m.name}</p>
                  <p className="text-xs text-stone-400 mb-2">{m.email}</p>
                  <p className="text-sm text-stone-600 leading-relaxed">{m.message}</p>
                </div>
                <span className="text-[10px] text-stone-400 whitespace-nowrap shrink-0">
                  {m.createdAt?.toDate?.()?.toLocaleDateString() || '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;