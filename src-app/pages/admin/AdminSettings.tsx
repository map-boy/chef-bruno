// FILE: src/pages/admin/AdminSettings.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { db } from '../../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { Save, Check, Loader2, Globe, Share2, Info } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';
import { SiteSettings } from '../../types';
import { motion } from 'motion/react';

const AdminSettings = () => {
  const { settings, loading: settingsLoading } = useSiteSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm<SiteSettings>();

  useEffect(() => {
    if (settings) {
      reset(settings);
    }
  }, [settings, reset]);

  const heroImageUrl = watch('heroImageUrl');
  const aboutImageUrl = watch('aboutImageUrl');

  const onSubmit = async (data: SiteSettings) => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'siteSettings', 'main'), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (settingsLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-600" size={48} /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex items-center justify-between gap-6 mb-12">
         <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Global Settings</h1>
            <p className="text-stone-500 text-sm">Update brand identity and core site content.</p>
         </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
         {/* Brand Identity */}
         <section className="bg-white p-8 md:p-10 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-8 flex items-center gap-3">
               <Globe size={24} className="text-amber-500" />
               Brand Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Brand Name</label>
                  <input {...register('brandName')} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-lg outline-none font-bold text-sm tracking-tight focus:border-stone-900 focus:bg-white transition-all" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Tagline</label>
                  <input {...register('tagline')} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-lg outline-none text-sm italic focus:border-stone-900 focus:bg-white transition-all" />
               </div>
               <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Location Address</label>
                  <input {...register('location')} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-lg outline-none text-sm focus:border-stone-900 focus:bg-white transition-all" />
               </div>
               <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Main Brand Description</label>
                  <textarea {...register('description')} rows={4} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-lg outline-none text-sm font-light leading-relaxed focus:border-stone-900 focus:bg-white transition-all"></textarea>
               </div>
            </div>
         </section>

         {/* Visuals */}
         <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
               <h3 className="text-lg font-serif font-bold text-stone-900 mb-6">Home Hero Banner</h3>
               <ImageUploader folder="settings" currentImage={heroImageUrl} onUpload={(url) => setValue('heroImageUrl', url)} />
               <p className="mt-4 text-[10px] text-stone-400 font-bold uppercase tracking-widest text-center">Suggested: 2000x1200px (Dark/Contrast)</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
               <h3 className="text-lg font-serif font-bold text-stone-900 mb-6">About Page Banner</h3>
               <ImageUploader folder="settings" currentImage={aboutImageUrl} onUpload={(url) => setValue('aboutImageUrl', url)} />
               <p className="mt-4 text-[10px] text-stone-400 font-bold uppercase tracking-widest text-center">Suggested: 1920x1080px (Atmospheric)</p>
            </div>
         </section>

         {/* Mission/Vision */}
         <section className="bg-white p-8 md:p-10 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-8 flex items-center gap-3">
               <Info size={24} className="text-amber-500" />
               Vision & Mission
            </h3>
            <div className="space-y-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Our Vision</label>
                  <textarea {...register('vision')} rows={3} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-lg outline-none text-sm font-light leading-relaxed focus:border-stone-900 focus:bg-white transition-all"></textarea>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Our Mission</label>
                  <textarea {...register('mission')} rows={3} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-lg outline-none text-sm font-light leading-relaxed focus:border-stone-900 focus:bg-white transition-all"></textarea>
               </div>
            </div>
         </section>

         {/* Social Links */}
         <section className="bg-white p-8 md:p-10 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-8 flex items-center gap-3">
               <Share2 size={24} className="text-amber-500" />
               Social Integration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">TikTok Handle</label>
                  <div className="relative">
                     <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-stone-400">@</span>
                     <input {...register('tiktokHandle')} className="w-full pl-10 pr-5 py-3.5 bg-stone-50 border border-stone-200 rounded-lg outline-none text-sm font-bold" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Instagram Handle</label>
                  <div className="relative">
                     <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-stone-400">@</span>
                     <input {...register('instagramHandle')} className="w-full pl-10 pr-5 py-3.5 bg-stone-50 border border-stone-200 rounded-lg outline-none text-sm font-bold" />
                  </div>
               </div>
            </div>
         </section>

         {/* Floating Save Button */}
         <div className="fixed bottom-10 right-10 z-[110]">
            <button
               type="submit"
               disabled={isSaving}
               className={`group flex items-center gap-4 px-10 py-5 rounded-full font-bold text-sm uppercase tracking-widest shadow-[0_20px_50px_rgba(201,151,58,0.4)] transition-all transform active:scale-95 ${
                 isSaved ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-stone-900 hover:bg-stone-900 hover:text-white'
               }`}
            >
               {isSaving ? <Loader2 className="animate-spin" size={20} /> : (isSaved ? <Check size={20} /> : <Save size={20} className="group-hover:scale-110 transition-transform" />)}
               {isSaving ? 'Updating...' : (isSaved ? 'Applied' : 'Save Changes')}
            </button>
         </div>
      </form>
    </div>
  );
};

export default AdminSettings;
