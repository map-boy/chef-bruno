// FILE: src/pages/admin/AdminVideos.tsx
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import {
  collection, onSnapshot, query, orderBy,
  addDoc, deleteDoc, doc, serverTimestamp, updateDoc
} from 'firebase/firestore';
import { Film, Plus, Trash2, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = ['Brand', 'Tutorial', 'Education', 'Business', 'Inspiration'];

interface VideoForm {
  title: string;
  description: string;
  hook: string;
  body: string;
  cta: string;
  audience: string;
  goal: string;
  category: string;
  duration: string;
}

const empty: VideoForm = {
  title: '', description: '', hook: '', body: '', cta: '',
  audience: '', goal: '', category: 'Tutorial', duration: '5–8 min'
};

const AdminVideos = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<VideoForm>(empty);

  useEffect(() => {
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (v: any) => {
    setEditing(v.id);
    setForm({ title: v.title, description: v.description, hook: v.hook, body: v.body, cta: v.cta, audience: v.audience, goal: v.goal, category: v.category, duration: v.duration });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateDoc(doc(db, 'videos', editing), { ...form, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'videos'), { ...form, createdAt: serverTimestamp() });
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this video?')) await deleteDoc(doc(db, 'videos', id));
  };

  const categoryColors: Record<string, string> = {
    Brand: 'bg-amber-100 text-amber-700', Tutorial: 'bg-blue-100 text-blue-700',
    Education: 'bg-emerald-100 text-emerald-700', Business: 'bg-purple-100 text-purple-700',
    Inspiration: 'bg-rose-100 text-rose-700',
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Videos</h1>
          <p className="text-stone-500 text-sm">Manage the video content series.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all">
          <Plus size={16} /> New Video
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-stone-100">
                <h2 className="text-xl font-serif font-bold text-stone-900">{editing ? 'Edit Video' : 'New Video'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-stone-100 rounded-lg"><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Title</label>
                    <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900" placeholder="Video title" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Description</label>
                    <textarea required rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900 resize-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Duration</label>
                    <input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900" placeholder="5–8 min" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Target Audience</label>
                    <input value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900" placeholder="e.g. Home cooks" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Goal</label>
                    <input value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900" placeholder="e.g. Brand awareness" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Hook (opening line)</label>
                    <input value={form.hook} onChange={e => setForm({ ...form, hook: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900" placeholder="The hook that opens the video" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Script Body</label>
                    <textarea rows={2} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900 resize-none" placeholder="Main content of the video" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Call to Action</label>
                    <input value={form.cta} onChange={e => setForm({ ...form, cta: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900" placeholder="What viewers should do next" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-3 border border-stone-200 rounded-lg text-sm font-bold text-stone-500 hover:bg-stone-50">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-3 bg-stone-900 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-50">
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Video'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-stone-400 py-20">Loading videos...</p>
        ) : videos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-stone-200">
            <Film size={40} className="text-stone-300 mx-auto mb-4" />
            <p className="text-stone-400">No videos yet. Add your first episode.</p>
          </div>
        ) : videos.map((v, idx) => (
          <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
            className="bg-white rounded-xl border border-stone-200 p-5 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${categoryColors[v.category] || 'bg-stone-100 text-stone-600'}`}>{v.category}</span>
                <span className="text-[10px] text-stone-400">{v.duration}</span>
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-base mb-1">{v.title}</h3>
              <p className="text-stone-500 text-sm line-clamp-1">{v.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => openEdit(v)} className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest border border-stone-200 rounded-lg hover:bg-stone-50 transition-all">Edit</button>
              <button onClick={() => handleDelete(v.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-stone-200 transition-all">
                <Trash2 size={15} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminVideos;