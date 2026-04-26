// FILE: src/pages/admin/AdminEvents.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useEvents } from '../../hooks/useEvents';
import { Plus, Edit2, Trash2, X, Check, Calendar } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';
import { Event } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

const AdminEvents = () => {
  const { events, loading } = useEvents();
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Partial<Event>>();

  const imageUrl = watch('imageUrl');

  const openForm = (event?: Event) => {
    if (event) {
      setActiveEvent(event);
      reset(event);
    } else {
      setActiveEvent(null);
      reset({ title: '', date: '', category: 'Culinary', description: '', imageUrl: '' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: Partial<Event>) => {
    try {
      if (activeEvent) {
        await updateDoc(doc(db, 'events', activeEvent.id), {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'events'), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      setIsModalOpen(false);
      reset();
    } catch (err) {
      console.error(err);
      alert('Action failed.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this event?')) {
      try {
        await deleteDoc(doc(db, 'events', id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
         <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Events Calendar</h1>
            <p className="text-stone-500 text-sm">Post upcoming culinary and hospitality experiences.</p>
         </div>
         <button
           onClick={() => openForm()}
           className="px-6 py-4 bg-stone-900 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-stone-800 transition-all shadow-xl flex items-center justify-center gap-3"
         >
            <Plus size={18} className="text-amber-500" />
            Add Event
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {loading ? (
           <p className="col-span-full py-20 text-center text-stone-400">Loading events...</p>
         ) : events.length === 0 ? (
           <p className="col-span-full py-20 text-center text-stone-400">No events scheduled.</p>
         ) : events.map((event) => (
           <motion.div
             key={event.id}
             layout
             className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex flex-col"
           >
              <div className="aspect-video relative overflow-hidden bg-stone-100">
                 {event.imageUrl ? <img src={event.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Calendar size={32} className="text-stone-300" /></div>}
                 <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-widest text-stone-900">
                       {event.category}
                    </span>
                 </div>
              </div>
              <div className="p-6 flex-grow">
                 <p className="text-amber-600 text-[10px] font-bold uppercase tracking-widest mb-2">
                    {new Date(event.date).toLocaleDateString()}
                 </p>
                 <h3 className="text-xl font-serif font-bold text-stone-900 mb-3">{event.title}</h3>
                 <p className="text-xs text-stone-500 line-clamp-3 mb-6 leading-relaxed font-light">{event.description}</p>
                 
                 <div className="flex items-center justify-end gap-2 mt-auto pt-4 border-t border-stone-50">
                    <button onClick={() => openForm(event)} className="p-2 text-stone-400 hover:text-amber-600 transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(event.id)} className="p-2 text-stone-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                 </div>
              </div>
           </motion.div>
         ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                   <h2 className="text-xl font-serif font-bold">{activeEvent ? 'Edit Event' : 'New Event'}</h2>
                   <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-50 rounded-full"><X size={24} className="text-stone-400" /></button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar">
                   <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <ImageUploader folder="events" currentImage={imageUrl} onUpload={(url) => setValue('imageUrl', url)} />
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Event Title</label>
                         <input {...register('title', { required: true })} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-lg outline-none text-sm font-bold" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Date</label>
                            <input type="date" {...register('date', { required: true })} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-lg outline-none text-sm" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Category</label>
                            <select {...register('category', { required: true })} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-lg outline-none text-sm">
                               <option value="Hospitality">Hospitality</option>
                               <option value="Culinary">Culinary</option>
                               <option value="Private">Private</option>
                               <option value="Other">Other</option>
                            </select>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Description</label>
                         <textarea {...register('description', { required: true })} rows={4} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-lg outline-none text-sm font-light leading-relaxed"></textarea>
                      </div>
                      <button type="submit" className="w-full py-4 bg-stone-900 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-stone-800 transition-all">
                        {activeEvent ? 'Update' : 'Create'} Event
                      </button>
                   </form>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminEvents;
