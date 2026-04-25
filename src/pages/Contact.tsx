// FILE: src/pages/Contact.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { MapPin, Phone, Mail, Instagram, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';


interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

// 🔑 Replace these with your actual EmailJS credentials
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>();

  useEffect(() => {
    document.title = 'Get In Touch | Chef Bruno';
  }, []);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // Save to Firestore
      await addDoc(collection(db, 'messages'), {
        ...data,
        createdAt: serverTimestamp(),
      });

      // Send email to admin Gmail
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name: data.name,
          email: data.email,
          message: data.message,
        },
        EMAILJS_PUBLIC_KEY
      );

      setIsSubmitted(true);
      reset();
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-20 bg-stone-50 min-h-screen">
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 h-full">
            {/* Left Side: Contact Info */}
            <div className="w-full lg:w-1/3 bg-stone-900 p-10 md:p-16 rounded-sm text-white flex flex-col justify-between relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full -translate-y-16 translate-x-16"></div>
               
               <div>
                  <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Get In Touch</h1>
                  <p className="text-stone-400 font-light text-lg mb-12">
                    We are here to assist you with your booking or inquiries.
                  </p>

                  <ul className="space-y-10">
                     <li className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center shrink-0">
                           <MapPin size={24} className="text-amber-500" />
                        </div>
                        <div>
                           <h5 className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Location</h5>
                           <p className="text-sm font-medium leading-relaxed">Rwanda, West Province, Rubavu District</p>
                        </div>
                     </li>
                     <li className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center shrink-0">
                           <Phone size={24} className="text-amber-500" />
                        </div>
                        <div>
                           <h5 className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Call Us</h5>
                           <p className="text-sm font-medium">+250 790 167 349</p>
                           <p className="text-sm font-medium">+250 722 717 174</p>
                        </div>
                     </li>
                     <li className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center shrink-0">
                           <Mail size={24} className="text-amber-500" />
                        </div>
                        <div>
                           <h5 className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Email Address</h5>
                           <p className="text-sm font-medium">shimirwabruno1@gmail.com</p>
                        </div>
                     </li>
                  </ul>
               </div>

               <div className="mt-16 pt-10 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <h5 className="text-[8px] font-bold uppercase tracking-[0.4em] text-stone-600 mb-4">Follow Bruno</h5>
                    <div className="flex gap-4">
                       <a href="#" className="w-10 h-10 bg-white/5 flex items-center justify-center rounded-full hover:bg-amber-600 transition-colors">
                          <Instagram size={18} />
                       </a>
                       <a href="#" className="w-10 h-10 bg-white/5 flex items-center justify-center rounded-full hover:bg-amber-600 transition-colors">
                          <span className="text-[10px] font-bold">Tik</span>
                       </a>
                    </div>
                  </div>
               </div>
            </div>

            {/* Right Side: Contact Form */}
            <div className="flex-grow bg-white p-10 md:p-16 shadow-2xl rounded-sm">
               <h3 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-10 pb-6 border-b border-stone-100">
                  Send Us A Message
               </h3>

               <AnimatePresence mode="wait">
                 {isSubmitted ? (
                   <motion.div
                     key="success"
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     className="py-16 text-center"
                   >
                     <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                     </div>
                     <h4 className="text-2xl font-serif font-bold text-stone-900 mb-3">Message Received!</h4>
                     <p className="text-stone-500 max-w-sm mx-auto">
                        Thank you for reaching out. A member of our reservation team will get back to you shortly.
                     </p>
                     <button
                       onClick={() => setIsSubmitted(false)}
                       className="mt-10 text-xs font-bold uppercase tracking-widest text-amber-600 hover:text-amber-700 transition-colors"
                     >
                       Send Another Message
                     </button>
                   </motion.div>
                 ) : (
                   <motion.form
                     key="form"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onSubmit={handleSubmit(onSubmit)}
                     className="space-y-8"
                   >
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Full Name</label>
                         <input
                           {...register('name', { required: 'Please enter your name' })}
                           className={`w-full px-6 py-4 bg-stone-50 border rounded-sm outline-none transition-all ${
                             errors.name ? 'border-red-500 focus:bg-red-50/20' : 'border-stone-200 focus:border-stone-900 focus:bg-white'
                           }`}
                           placeholder="John Doe"
                         />
                         {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider ml-1">{errors.name.message}</p>}
                       </div>
                       <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Email Address</label>
                         <input
                           {...register('email', { 
                             required: 'Please enter your email',
                             pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                           })}
                           className={`w-full px-6 py-4 bg-stone-50 border rounded-sm outline-none transition-all ${
                             errors.email ? 'border-red-500 focus:bg-red-50/20' : 'border-stone-200 focus:border-stone-900 focus:bg-white'
                           }`}
                           placeholder="john@example.com"
                         />
                         {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider ml-1">{errors.email.message}</p>}
                       </div>
                     </div>

                     <div className="space-y-3">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block ml-1">Your Message</label>
                       <textarea
                         {...register('message', { required: 'Please enter your message' })}
                         rows={6}
                         className={`w-full px-6 py-4 bg-stone-50 border rounded-sm outline-none transition-all resize-none ${
                           errors.message ? 'border-red-500 focus:bg-red-50/20' : 'border-stone-200 focus:border-stone-900 focus:bg-white'
                         }`}
                         placeholder="How can we help you?"
                       ></textarea>
                       {errors.message && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider ml-1">{errors.message.message}</p>}
                     </div>

                     <button
                       type="submit"
                       disabled={isSubmitting}
                       className="w-full bg-stone-900 text-white py-5 rounded-sm flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-[0.3em] hover:bg-stone-800 transition-all shadow-xl group overflow-hidden relative"
                     >
                        <span className="relative z-10 flex items-center">
                           {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Send size={18} className="mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                           {isSubmitting ? 'Sending...' : 'Send Message'}
                        </span>
                     </button>
                   </motion.form>
                 )}
               </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;