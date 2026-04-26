// FILE: src/pages/admin/AdminRooms.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useRooms } from '../../hooks/useRooms';
import { Plus, Edit2, Trash2, X, Check, Search, Filter } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';
import { Room } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

const AdminRooms = () => {
  const { rooms, loading } = useRooms();
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Partial<Room>>();

  const imageUrl = watch('imageUrl');

  const openForm = (room?: Room) => {
    if (room) {
      setActiveRoom(room);
      reset(room);
    } else {
      setActiveRoom(null);
      reset({ name: '', price: 0, description: '', imageUrl: '' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: Partial<Room>) => {
    try {
      if (activeRoom) {
        await updateDoc(doc(db, 'rooms', activeRoom.id), {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'rooms'), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      setIsModalOpen(false);
      reset();
    } catch (err) {
      console.error(err);
      alert('Action failed. See console.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this room? This action is irreversible.')) {
      try {
        await deleteDoc(doc(db, 'rooms', id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
         <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Room Management</h1>
            <p className="text-stone-500 text-sm">Configure luxury accommodations and pricing.</p>
         </div>
         <button
           onClick={() => openForm()}
           className="px-6 py-4 bg-stone-900 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-stone-800 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
         >
            <Plus size={18} className="text-amber-500" />
            Add New Room
         </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                     <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-400">Room Details</th>
                     <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-400">Price</th>
                     <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-400">Description</th>
                     <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-500 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100">
                  {loading ? (
                    <tr><td colSpan={4} className="p-20 text-center text-stone-400">Loading rooms...</td></tr>
                  ) : rooms.length === 0 ? (
                    <tr><td colSpan={4} className="p-20 text-center text-stone-400">No rooms configured.</td></tr>
                  ) : rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-amber-50/20 transition-colors group">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-16 h-16 rounded-lg bg-stone-100 overflow-hidden shrink-0 shadow-inner">
                                {room.imageUrl ? <img src={room.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-stone-200" />}
                             </div>
                             <span className="font-serif font-bold text-stone-900 text-lg">{room.name}</span>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex flex-col">
                             <span className="text-stone-900 font-bold">RWF {room.price.toLocaleString()}</span>
                             <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mt-1">Per Night</span>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <p className="text-xs text-stone-500 line-clamp-2 max-w-xs leading-relaxed">{room.description}</p>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button 
                               onClick={() => openForm(room)}
                               className="p-2.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                             >
                                <Edit2 size={18} />
                             </button>
                             <button 
                               onClick={() => handleDelete(room.id)}
                               className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                             >
                                <Trash2 size={18} />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
             />
             <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
             >
                <div className="p-8 border-b border-stone-100 flex items-center justify-between shrink-0">
                   <h2 className="text-2xl font-serif font-bold text-stone-900">
                      {activeRoom ? 'Edit Room Configuration' : 'Create New Room'}
                   </h2>
                   <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-50 rounded-full transition-colors">
                      <X size={24} className="text-stone-400" />
                   </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                   <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Room Photo</label>
                         <ImageUploader 
                           folder="rooms"
                           currentImage={imageUrl}
                           onUpload={(url) => setValue('imageUrl', url)}
                         />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Room Name</label>
                            <input
                              {...register('name', { required: 'Room name is required' })}
                              className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-stone-900 transition-all font-bold text-sm tracking-tight"
                              placeholder="e.g. Master Chef Suite"
                            />
                            {errors.name && <p className="text-red-500 text-[10px] font-bold">{errors.name.message}</p>}
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Price per Night (RWF)</label>
                            <input
                              type="number"
                              {...register('price', { required: 'Price is required', min: 0 })}
                              className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-stone-900 transition-all font-bold text-sm tracking-tight"
                              placeholder="0"
                            />
                            {errors.price && <p className="text-red-500 text-[10px] font-bold">{errors.price.message}</p>}
                         </div>
                      </div>

                      <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Full Description</label>
                         <textarea
                           {...register('description', { required: 'Description is required' })}
                           rows={5}
                           className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-stone-900 transition-all text-sm font-light leading-relaxed"
                           placeholder="Describe the amenities, view, and unique features..."
                         ></textarea>
                         {errors.description && <p className="text-red-500 text-[10px] font-bold">{errors.description.message}</p>}
                      </div>

                      <div className="pt-8 border-t border-stone-100 flex gap-4">
                         <button
                           type="button"
                           onClick={() => setIsModalOpen(false)}
                           className="flex-grow py-4 border border-stone-200 text-stone-500 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-stone-50 transition-all"
                         >
                           Cancel
                         </button>
                         <button
                           type="submit"
                           className="flex-[2] py-4 bg-stone-900 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-stone-800 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                         >
                            <Check size={18} className="text-amber-500" />
                            {activeRoom ? 'Update Configuration' : 'Save New Room'}
                         </button>
                      </div>
                   </form>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminRooms;
