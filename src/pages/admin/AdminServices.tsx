// FILE: src/pages/admin/AdminServices.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useServices } from '../../hooks/useServices';
import { Plus, Edit2, Trash2, X, Check, Utensils } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';
import { Service } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

const AdminServices = () => {
  const { services, loading } = useServices();
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Partial<Service>>();

  const imageUrl = watch('imageUrl');

  const openForm = (service?: Service) => {
    if (service) {
      setActiveService(service);
      reset(service);
    } else {
      setActiveService(null);
      reset({ title: '', category: 'Catering', description: '', imageUrl: '' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: Partial<Service>) => {
    try {
      if (activeService) {
        await updateDoc(doc(db, 'services', activeService.id), {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'services'), {
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
    if (window.confirm('Delete this service?')) {
      try {
        await deleteDoc(doc(db, 'services', id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
         <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Professional Services</h1>
            <p className="text-stone-500 text-sm">Manage the culinary and hospitality offerings.</p>
         </div>
         <button onClick={() => openForm()} className="px-6 py-4 bg-stone-900 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-stone-800 transition-all shadow-xl flex items-center justify-center gap-3">
            <Plus size={18} className="text-amber-500" />
            Add Service
         </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                     <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-400">Service Info</th>
                     <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-400">Category</th>
                     <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-400 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100">
                  {loading ? (
                    <tr><td colSpan={3} className="p-16 text-center text-stone-400">Loading services...</td></tr>
                  ) : services.length === 0 ? (
                    <tr><td colSpan={3} className="p-16 text-center text-stone-400">No services found.</td></tr>
                  ) : services.map((service) => (
                    <tr key={service.id} className="hover:bg-amber-50/20 transition-colors">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden shadow-inner">
                                {service.imageUrl ? <img src={service.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Utensils size={20} className="text-stone-300" /></div>}
                             </div>
                             <span className="font-bold text-stone-900">{service.title}</span>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/50">
                             {service.category}
                          </span>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button onClick={() => openForm(service)} className="p-2 text-stone-400 hover:text-amber-600"><Edit2 size={18} /></button>
                             <button onClick={() => handleDelete(service.id)} className="p-2 text-stone-400 hover:text-red-500"><Trash2 size={18} /></button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-stone-100 flex items-center justify-between shrink-0">
                   <h2 className="text-xl font-serif font-bold">{activeService ? 'Edit Service' : 'New Service'}</h2>
                   <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-50 rounded-full"><X size={24} className="text-stone-400" /></button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar">
                   <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <ImageUploader folder="services" currentImage={imageUrl} onUpload={(url) => setValue('imageUrl', url)} />
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Service Title</label>
                         <input {...register('title', { required: true })} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-lg outline-none text-sm font-bold" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Category</label>
                         <select {...register('category', { required: true })} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-lg outline-none text-sm font-bold">
                            {['Catering', 'Nutrition', 'Mobile Food', 'Shopping', 'Market', 'Tutorial', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Description</label>
                         <textarea {...register('description', { required: true })} rows={4} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-lg outline-none text-sm font-light leading-relaxed"></textarea>
                      </div>
                      <button type="submit" className="w-full py-4 bg-stone-900 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-stone-800 transition-all shadow-xl">
                        {activeService ? 'Update' : 'Create'} Service
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

export default AdminServices;
