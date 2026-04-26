// FILE: src/pages/admin/AdminAcademy.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAcademy } from '../../hooks/useAcademy';
import { Plus, Edit2, Trash2, X, Check, BookOpen } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';
import { AcademyModule } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

const AdminAcademy = () => {
  const { modules, loading } = useAcademy();
  const [activeModule, setActiveModule] = useState<AcademyModule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Partial<AcademyModule>>();

  const imageUrl = watch('imageUrl');

  const openForm = (module?: AcademyModule) => {
    if (module) {
      setActiveModule(module);
      reset({
        ...module,
        lessons: module.lessons.join('\n') as any
      });
    } else {
      setActiveModule(null);
      reset({ moduleNumber: modules.length + 1, title: '', outcome: '', lessons: '' as any, imageUrl: '' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: any) => {
    const lessonsArray = typeof data.lessons === 'string' 
      ? data.lessons.split('\n').filter((l: string) => l.trim() !== '') 
      : data.lessons;

    const payload = {
      ...data,
      lessons: lessonsArray,
      moduleNumber: Number(data.moduleNumber)
    };

    try {
      if (activeModule) {
        await updateDoc(doc(db, 'academy', activeModule.id), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'academy'), {
          ...payload,
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
    if (window.confirm('Delete this academy module?')) {
      try {
        await deleteDoc(doc(db, 'academy', id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
         <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Culinary Academy Curriculum</h1>
            <p className="text-stone-500 text-sm">Manage the BCCP Certification modules and lessons.</p>
         </div>
         <button onClick={() => openForm()} className="px-6 py-4 bg-stone-900 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-stone-800 transition-all shadow-xl flex items-center justify-center gap-3">
            <Plus size={18} className="text-amber-500" />
            Add Module
         </button>
      </div>

      <div className="space-y-6">
         {loading ? (
            <p className="py-20 text-center text-stone-400">Loading curriculum...</p>
         ) : modules.length === 0 ? (
            <p className="py-20 text-center text-stone-400">No modules found.</p>
         ) : modules.map((module) => (
           <div key={module.id} className="bg-white p-6 rounded-xl border border-stone-200 flex flex-col md:flex-row items-center gap-8 group">
              <div className="w-20 h-20 bg-stone-900 rounded-lg flex flex-col items-center justify-center shrink-0">
                 <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest leading-none mb-1">M-</span>
                 <span className="text-3xl font-serif font-bold text-white leading-none">{module.moduleNumber.toString().padStart(2, '0')}</span>
              </div>
              <div className="grow">
                 <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">{module.title}</h3>
                 <p className="text-xs text-stone-500 font-light flex items-center gap-2">
                    <span className="text-emerald-500 font-bold uppercase tracking-wider">Outcome:</span> {module.outcome}
                 </p>
                 <p className="text-[10px] text-stone-400 font-bold mt-2 uppercase tracking-widest">{module.lessons.length} Lessons Configured</p>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => openForm(module)} className="p-3 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Edit2 size={20} /></button>
                 <button onClick={() => handleDelete(module.id)} className="p-3 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={20} /></button>
              </div>
           </div>
         ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-stone-100 flex items-center justify-between shrink-0">
                   <h2 className="text-xl font-serif font-bold">{activeModule ? 'Edit Module' : 'New Academy Module'}</h2>
                   <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-50 rounded-full"><X size={24} className="text-stone-400" /></button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar">
                   <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-3 gap-6">
                         <div className="col-span-1 space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Module #</label>
                            <input type="number" {...register('moduleNumber', { required: true })} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-lg outline-none text-sm font-bold" />
                         </div>
                         <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Module Title</label>
                            <input {...register('title', { required: true })} placeholder="e.g. Molecular Gastronomy" className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-lg outline-none text-sm font-bold" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Key Learning Outcome</label>
                         <input {...register('outcome', { required: true })} placeholder="e.g. Master modern plating techniques" className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-lg outline-none text-sm font-light" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Lessons (one per line)</label>
                         <textarea {...register('lessons', { required: true })} rows={6} placeholder="Lesson 1: Introduction&#10;Lesson 2: Advanced Equipment" className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-lg outline-none text-sm font-mono leading-relaxed"></textarea>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Module Banner Photo</label>
                         <ImageUploader folder="academy" currentImage={imageUrl} onUpload={(url) => setValue('imageUrl', url)} />
                      </div>
                      <button type="submit" className="w-full py-4 bg-stone-900 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-stone-800 transition-all shadow-xl">
                        {activeModule ? 'Update Module' : 'Create Module'}
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

export default AdminAcademy;
