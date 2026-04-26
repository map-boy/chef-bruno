// FILE: src/pages/admin/AdminBlog.tsx
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import {
  collection, onSnapshot, query, orderBy,
  addDoc, deleteDoc, doc, serverTimestamp, updateDoc
} from 'firebase/firestore';
import { PenLine, Plus, Trash2, X, Loader2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = ['Branding', 'Techniques', 'Business', 'Innovation', 'Mindset', 'Ethics'];

interface PostForm {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  featured: boolean;
}

const empty: PostForm = { title: '', excerpt: '', category: 'Branding', readTime: '5 min read', featured: false };

const AdminBlog = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<PostForm>(empty);

  useEffect(() => {
    const q = query(collection(db, 'blog'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (p: any) => {
    setEditing(p.id);
    setForm({ title: p.title, excerpt: p.excerpt, category: p.category, readTime: p.readTime, featured: p.featured || false });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateDoc(doc(db, 'blog', editing), { ...form, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'blog'), { ...form, createdAt: serverTimestamp() });
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this post?')) await deleteDoc(doc(db, 'blog', id));
  };

  const categoryColors: Record<string, string> = {
    Branding: 'bg-amber-100 text-amber-700', Techniques: 'bg-blue-100 text-blue-700',
    Business: 'bg-emerald-100 text-emerald-700', Innovation: 'bg-purple-100 text-purple-700',
    Mindset: 'bg-rose-100 text-rose-700', Ethics: 'bg-stone-100 text-stone-600',
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Blog Posts</h1>
          <p className="text-stone-500 text-sm">Create and manage blog articles.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all">
          <Plus size={16} /> New Post
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-stone-100">
                <h2 className="text-xl font-serif font-bold text-stone-900">{editing ? 'Edit Post' : 'New Post'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-stone-100 rounded-lg"><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Title</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900"
                    placeholder="Article title" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Excerpt</label>
                  <textarea required rows={4} value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900 resize-none"
                    placeholder="Short description of the article" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Read Time</label>
                    <input value={form.readTime} onChange={e => setForm({ ...form, readTime: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900"
                      placeholder="5 min read" />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 accent-amber-600" />
                  <span className="text-sm font-bold text-stone-700">Mark as Featured</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-3 border border-stone-200 rounded-lg text-sm font-bold text-stone-500 hover:bg-stone-50">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-3 bg-stone-900 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-50">
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Post'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-stone-400 py-20">Loading posts...</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-stone-200">
            <PenLine size={40} className="text-stone-300 mx-auto mb-4" />
            <p className="text-stone-400">No posts yet. Create your first article.</p>
          </div>
        ) : posts.map((p, idx) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
            className="bg-white rounded-xl border border-stone-200 p-5 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${categoryColors[p.category] || 'bg-stone-100 text-stone-600'}`}>{p.category}</span>
                {p.featured && <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600"><Star size={10} /> Featured</span>}
                <span className="text-[10px] text-stone-400">{p.readTime}</span>
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-base mb-1">{p.title}</h3>
              <p className="text-stone-500 text-sm line-clamp-2">{p.excerpt}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => openEdit(p)} className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest border border-stone-200 rounded-lg hover:bg-stone-50 transition-all">Edit</button>
              <button onClick={() => handleDelete(p.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-stone-200 transition-all">
                <Trash2 size={15} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminBlog;