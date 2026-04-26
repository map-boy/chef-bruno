// FILE: src/pages/admin/AdminMessages.tsx
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Trash2, Mail, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

const AdminMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this message?')) {
      await deleteDoc(doc(db, 'messages', id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Contact Messages</h1>
        <p className="text-stone-500 text-sm">{messages.length} message{messages.length !== 1 ? 's' : ''} received.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-stone-400 py-20">Loading messages...</p>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-stone-200">
            <MessageSquare size={40} className="text-stone-300 mx-auto mb-4" />
            <p className="text-stone-400">No messages yet.</p>
          </div>
        ) : messages.map((m, idx) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-bold text-stone-900">{m.name}</p>
                  <span className="text-stone-300">·</span>
                  <span className="text-xs text-stone-400">
                    {m.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    }) || '—'}
                  </span>
                </div>
                <a
                  href={`mailto:${m.email}`}
                  className="text-xs text-amber-600 hover:underline flex items-center gap-1 mb-4"
                >
                  <Mail size={11} /> {m.email}
                </a>
                <p className="text-stone-600 text-sm leading-relaxed">{m.message}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`mailto:${m.email}?subject=Re: Your enquiry to Chef Bruno`}
                  className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                  title="Reply by email"
                >
                  <Mail size={18} />
                </a>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminMessages;