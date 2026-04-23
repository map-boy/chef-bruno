// FILE: src/pages/admin/AdminMediaHelp.tsx
import React from 'react';
import { motion } from 'motion/react';
import { Upload, ImageIcon, CheckCircle, Save, MousePointer2 } from 'lucide-react';

const AdminMediaHelp = () => {
  const steps = [
    {
      title: "Open Selector",
      icon: <MousePointer2 className="text-amber-500" />,
      desc: "Click the 'Click to Upload Image' dashed box or the 'Upload' icon on any form. This opens your device's native file explorer."
    },
    {
      title: "Select Your Image",
      icon: <ImageIcon className="text-amber-500" />,
      desc: "Choose the photo you want to use. We suggest high-resolution JPEGs or PNGs under 5MB for the best loading performance."
    },
    {
      title: "Secure Upload",
      icon: <Upload className="text-amber-500" />,
      desc: "Wait for the upload progress bar to finish. The system is securely saving your file to our encrypted storage cloud."
    },
    {
      title: "Apply Changes",
      icon: <Save className="text-amber-500" />,
      desc: "Once you see the image preview, click the 'Save' or 'Create' button at the bottom of the form to publish it to the live website."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-stone-900 p-12 md:p-20 rounded-3xl text-white relative overflow-hidden shadow-2xl mb-12">
         {/* Background pattern */}
         <div className="absolute inset-0 opacity-5">
            <div className="grid grid-cols-10 h-full">
               {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} className="border border-white/20"></div>
               ))}
            </div>
         </div>

         <div className="relative z-10">
            <span className="text-amber-500 text-xs font-bold uppercase tracking-[0.4em] mb-6 block">User Documentation</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-10 leading-tight">
               How to Manage Your Website's Media
            </h1>
            <p className="text-stone-400 text-lg font-light leading-relaxed max-w-2xl">
               Our visual system is designed for ease and performance. Follow these simple steps to keep your hotel and academy photos looking professional.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-10 rounded-2xl border border-stone-200 shadow-sm flex flex-col group"
            >
               <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center mb-8 shadow-inner group-hover:bg-amber-600 transition-colors">
                  {React.cloneElement(step.icon as React.ReactElement, { size: 28, className: 'group-hover:text-white transition-colors' })}
               </div>
               <h3 className="text-xl font-bold font-serif text-stone-900 mb-4">{idx + 1}. {step.title}</h3>
               <p className="text-stone-500 text-sm font-light leading-relaxed grow">{step.desc}</p>
            </motion.div>
         ))}
      </div>

      <div className="mt-16 bg-white p-10 rounded-2xl border border-amber-600/30 border-2 shadow-sm text-center">
         <h4 className="text-xl font-serif font-bold text-stone-900 mb-4 flex items-center justify-center gap-3">
            <CheckCircle className="text-emerald-500" />
            Media Optimization Tips
         </h4>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Aspect Ratio</p>
               <p className="text-sm font-bold text-stone-900">4:3 for Rooms<br/>16:9 for Events</p>
            </div>
            <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">File Size</p>
               <p className="text-sm font-bold text-stone-900">Under 2MB is ideal<br/>for mobile users</p>
            </div>
            <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Contrast</p>
               <p className="text-sm font-bold text-stone-900">Ensure text readability<br/>over hero images</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminMediaHelp;
