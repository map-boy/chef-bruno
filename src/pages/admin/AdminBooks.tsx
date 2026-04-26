// FILE: src/pages/admin/AdminBooks.tsx
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import {
  collection, onSnapshot, query, orderBy,
  addDoc, deleteDoc, doc, serverTimestamp, updateDoc
} from 'firebase/firestore';
import { BookOpen, Plus, Trash2, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const THEMES = [
  { label: 'Gold', bgGradient: 'from-amber-950 to-stone-950', accentColor: '#C9973A', badgeColor: 'bg-amber-600/20 text-amber-400 border-amber-600/40' },
  { label: 'Red',  bgGradient: 'from-red-950 to-stone-950',   accentColor: '#7C2D2D', badgeColor: 'bg-red-600/20 text-red-400 border-red-600/40' },
  { label: 'Green',bgGradient: 'from-emerald-950 to-stone-950',accentColor: '#1A6B4A',badgeColor: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/40' },
];

interface BookForm {
  title: string;
  subtitle: string;
  audience: string;
  purpose: string;
  theme: string;
  chapters: string; // comma-separated chapter titles
}

const empty: BookForm = { title: '', subtitle: '', audience: '', purpose: '', theme: 'Gold', chapters: '' };

const AdminBooks = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<BookForm>(empty);

  useEffect(() => {
    const q = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setBooks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (b: any) => {
    setEditing(b.id);
    setForm({
      title: b.title, subtitle: b.subtitle, audience: b.audience,
      purpose: b.purpose, theme: b.theme || 'Gold',
      chapters: (b.chapters || []).map((c: any) => c.title).join('\n')
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const chapters = form.chapters.split('\n').filter(Boolean).map((title, i) => ({ number: i + 1, title: title.trim() }));
      const theme = THEMES.find(t => t.label === form.theme) || THEMES[0];
      const payload = {
        title: form.title, subtitle: form.subtitle,
        audience: form.audience, purpose: form.purpose,
        theme: form.theme, chapters,
        accentColor: theme.accentColor,
        bgGradient: theme.bgGradient,
        badgeColor: theme.badgeColor,
      };
      if (editing) {
        await updateDoc(doc(db, 'books', editing), { ...payload, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'books'), { ...payload, createdAt: serverTimestamp() });
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this book?')) await deleteDoc(doc(db, 'books', id));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Books</h1>
          <p className="text-stone-500 text-sm">Manage Chef Bruno's publications.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all">
          <Plus size={16} /> New Book
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-stone-100">
                <h2 className="text-xl font-serif font-bold text-stone-900">{editing ? 'Edit Book' : 'New Book'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-stone-100 rounded-lg"><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Title</label>
                    <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900" placeholder="Book title" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Subtitle</label>
                    <input required value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900" placeholder="A Guide to..." />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Target Audience</label>
                  <input required value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900" placeholder="Who is this book for?" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Purpose</label>
                  <input required value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900" placeholder="What does this book achieve?" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Chapters (one per line)</label>
                  <textarea required rows={5} value={form.chapters} onChange={e => setForm({ ...form, chapters: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-900 resize-none"
                    placeholder={"Chapter One Title\nChapter Two Title\nChapter Three Title"} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Cover Theme</label>
                  <div className="flex gap-3">
                    {THEMES.map(t => (
                      <button key={t.label} type="button" onClick={() => setForm({ ...form, theme: t.label })}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${form.theme === t.label ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 text-stone-600 hover:bg-stone-50'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-3 border border-stone-200 rounded-lg text-sm font-bold text-stone-500 hover:bg-stone-50">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-3 bg-stone-900 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-50">
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Book'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-stone-400 py-20">Loading books...</p>
        ) : books.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-stone-200">
            <BookOpen size={40} className="text-stone-300 mx-auto mb-4" />
            <p className="text-stone-400">No books yet. Add your first publication.</p>
          </div>
        ) : books.map((b, idx) => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
            className="bg-white rounded-xl border border-stone-200 p-5 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-serif font-bold text-stone-900 text-base">{b.title}</h3>
              <p className="text-stone-500 text-sm">{b.subtitle}</p>
              <p className="text-stone-400 text-xs mt-1">{(b.chapters || []).length} chapters · {b.theme} theme</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => openEdit(b)} className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest border border-stone-200 rounded-lg hover:bg-stone-50 transition-all">Edit</button>
              <button onClick={() => handleDelete(b.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-stone-200 transition-all">
                <Trash2 size={15} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminBooks;