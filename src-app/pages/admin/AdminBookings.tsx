// FILE: src/pages/admin/AdminBookings.tsx
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import {
  collection, onSnapshot, query, orderBy,
  doc, updateDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore';
import { CheckCircle, XCircle, Trash2, Mail, Hotel, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

const statusColors: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'bookings', id), {
      status,
      updatedAt: serverTimestamp()
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this booking permanently?')) {
      await deleteDoc(doc(db, 'bookings', id));
    }
  };

  const handleConfirmAndEmail = async (b: any) => {
    await updateStatus(b.id, 'confirmed');
    const subject = encodeURIComponent(`Your Booking is Confirmed — Chef Bruno`);
    const body = encodeURIComponent(
`Dear ${b.guestName},

We are pleased to confirm your reservation at Chef Bruno Hotel & Culinary Center.

Booking Details:
Room: ${b.roomType}
Check In: ${b.checkIn} (from 2:00 PM)
Check Out: ${b.checkOut} (by 11:00 AM)

Our team will be ready to welcome you. Please contact us if you need any assistance before your arrival.

Warm regards,
Chef Bruno Hotel & Culinary Center
Rubavu District, Rwanda
+250 790 167 349`
    );
    window.open(`mailto:${b.email}?subject=${subject}&body=${body}`);
  };

  const handleCancelAndEmail = async (b: any) => {
    await updateStatus(b.id, 'cancelled');
    const subject = encodeURIComponent(`Booking Update — Chef Bruno`);
    const body = encodeURIComponent(
`Dear ${b.guestName},

We regret to inform you that your reservation request for ${b.roomType} (${b.checkIn} to ${b.checkOut}) could not be accommodated at this time.

We sincerely apologize for any inconvenience. Please contact us to discuss alternative dates.

Warm regards,
Chef Bruno Hotel & Culinary Center
+250 790 167 349`
    );
    window.open(`mailto:${b.email}?subject=${subject}&body=${body}`);
  };

  const filtered = activeFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status === activeFilter);

  const counts = {
    all:       bookings.length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Reservations</h1>
          <p className="text-stone-500 text-sm">Confirm or cancel guest booking requests.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'pending', 'confirmed', 'cancelled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${
                activeFilter === f
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
              }`}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      {counts.pending > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <p className="text-amber-700 text-sm font-bold">
            {counts.pending} booking{counts.pending > 1 ? 's' : ''} waiting.
            Clicking "Confirm & Email" updates the status and opens your email app with a pre-filled message to the guest.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-stone-400 py-20">Loading bookings...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-stone-200">
            <Hotel size={40} className="text-stone-300 mx-auto mb-4" />
            <p className="text-stone-400">No bookings found.</p>
          </div>
        ) : filtered.map((b, idx) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="bg-white rounded-xl border border-stone-200 shadow-sm p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-bold text-stone-900 text-lg font-serif">{b.guestName}</p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusColors[b.status] || statusColors.pending}`}>
                    {b.status || 'pending'}
                  </span>
                </div>
                <a href={`mailto:${b.email}`} className="text-xs text-amber-600 hover:underline flex items-center gap-1 mb-3">
                  <Mail size={11} /> {b.email}
                </a>
                <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
                  <span className="flex items-center gap-1">
                    <Hotel size={13} className="text-stone-400" /> {b.roomType}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-stone-400" /> {b.checkIn} → {b.checkOut}
                  </span>
                  <span className="text-xs text-stone-400">
                    {b.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    }) || '—'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {b.status !== 'confirmed' && (
                  <button
                    onClick={() => handleConfirmAndEmail(b)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    <CheckCircle size={15} /> Confirm & Email
                  </button>
                )}
                {b.status !== 'cancelled' && (
                  <button
                    onClick={() => handleCancelAndEmail(b)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    <XCircle size={15} /> Cancel & Email
                  </button>
                )}
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-stone-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminBookings;