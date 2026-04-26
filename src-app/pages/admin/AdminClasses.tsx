// FILE: src/pages/admin/AdminClasses.tsx
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import {
  collection, onSnapshot, query, orderBy,
  addDoc, deleteDoc, doc, serverTimestamp, updateDoc
} from 'firebase/firestore';
import { Video, Plus, Trash2, Users, Clock, Calendar, X, Loader2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClassForm {
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  price: string;
  maxStudents: string;
}

const CLOUD_FUNCTION_URL = 'https://us-central1-chef-bruno-a51bb.cloudfunctions.net/createDailyRoom';

const AdminClasses = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ClassForm>({
    title: '', description: '', date: '', time: '',
    duration: '60', price: '', maxStudents: '20'
  });

  useEffect(() => {
    const q = query(collection(db, 'classes'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const createDailyRoom = async (maxStudents: string) => {
    const res = await fetch(CLOUD_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxStudents })
    });
    if (!res.ok) throw new Error('Cloud Function failed');
    return await res.json(); // { roomName, roomUrl }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { roomName, roomUrl } = await createDailyRoom(form.maxStudents);
      await addDoc(collection(db, 'classes'), {
        ...form,
        price: parseFloat(form.price),
        maxStudents: parseInt(form.maxStudents),
        duration: parseInt(form.duration),
        roomName,
        roomUrl,
        status: 'scheduled',
        enrolledCount: 0,
        createdAt: serverTimestamp(),
      });
      setForm({ title: '', description: '', date: '', time: '', duration: '60', price: '', maxStudents: '20' });
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert('Failed to create class. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this class permanently?')) return;
    await deleteDoc(doc(db, 'classes', id));
  };

  const toggleStatus = async (id: string, current: string) => {
    const next = current === 'live' ? 'scheduled' : 'live';
    await updateDoc(doc(db, 'classes', id), { status: next });
  };

  const statusStyle: Record<string, string> = {
    scheduled: 'bg-amber-100 text-amber-700 border-amber-200',
    live:      'bg-emerald-100 text-emerald-700 border-emerald-200',
    ended:     'bg-stone-100 text-stone-500 border-stone-200',
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Online Classes</h1>
          <p className="text-stone-500 text-sm">Create and manage live culinary classes.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all"
        >
          <Plus size={16} /> New Class
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-stone-100">
                <h2 className="text-xl font-serif font-bold text-stone-900">Create New Class</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-stone-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Class Title</label>
                  <input
                    required
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900"
                    placeholder="e.g. Advanced French Pastry Techniques"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900 resize-none"
                    placeholder="What will students learn in this class?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Date</label>
                    <input
                      required type="date"
                      value={form.date}
                      onChange={e => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Time</label>
                    <input
                      required type="time"
                      value={form.time}
                      onChange={e => setForm({ ...form, time: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Duration (min)</label>
                    <input
                      required type="number"
                      value={form.duration}
                      onChange={e => setForm({ ...form, duration: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Price (RWF)</label>
                    <input
                      required type="number"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900"
                      placeholder="0 = Free"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Max Students</label>
                    <input
                      required type="number"
                      value={form.maxStudents}
                      onChange={e => setForm({ ...form, maxStudents: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 border border-stone-200 rounded-lg text-sm font-bold text-stone-500 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 py-3 bg-stone-900 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-50"
                  >
                    {creating ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : 'Create Class'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-stone-400 py-20">Loading classes...</p>
        ) : classes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-stone-200">
            <Video size={40} className="text-stone-300 mx-auto mb-4" />
            <p className="text-stone-400">No classes yet. Create your first class.</p>
          </div>
        ) : classes.map((cls, idx) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="bg-white rounded-xl border border-stone-200 shadow-sm p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-stone-900 text-lg font-serif">{cls.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusStyle[cls.status] || statusStyle.scheduled}`}>
                    {cls.status}
                  </span>
                </div>
                <p className="text-stone-500 text-sm mb-3">{cls.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-stone-400">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {cls.date} at {cls.time}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {cls.duration} min</span>
                  <span className="flex items-center gap-1"><Users size={12} /> Max {cls.maxStudents} students</span>
                  <span className="font-bold text-amber-600">{cls.price === 0 ? 'Free' : `RWF ${Number(cls.price).toLocaleString()}`}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={() => toggleStatus(cls.id, cls.status)}
                  className={`px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${
                    cls.status === 'live'
                      ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-400 hover:text-emerald-600'
                  }`}
                >
                  {cls.status === 'live' ? '🔴 Live Now' : 'Go Live'}
                </button>
                <a
                  href={cls.roomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-amber-100 transition-all"
                >
                  <ExternalLink size={13} /> Join as Host
                </a>
                <button
                  onClick={() => handleDelete(cls.id)}
                  className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-stone-200 transition-all"
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

export default AdminClasses;