// PATH: src-app/pages/AppBook.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRooms } from '../hooks/useRooms';
import emailjs from '@emailjs/browser';
import {
  Bed, Calendar, User, CheckCircle2, ChevronLeft,
  ChevronRight, Loader2, Hotel
} from 'lucide-react';

type BookingForm = {
  guestName: string;
  email: string;
  phone: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  specialRequests: string;
};

const STEPS = ['Room', 'Dates', 'Guest Info'];

const AppBook: React.FC = () => {
  const [searchParams]  = useSearchParams();
  const { rooms }       = useRooms();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<BookingForm>({
    defaultValues: {
      roomType: searchParams.get('room') || '',
      guests: '1',
    }
  });

  useEffect(() => {
    document.title = 'Book a Room | Chef Bruno';
    const preRoom = searchParams.get('room');
    if (preRoom) { setValue('roomType', preRoom); setStep(1); }
  }, []);

  const selectedRoom = watch('roomType');
  const checkIn      = watch('checkIn');
  const checkOut     = watch('checkOut');

  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  })();

  const roomPrice = rooms.find(r => r.name === selectedRoom)?.price || 0;
  const total     = roomPrice * nights;

  const onSubmit = async (data: BookingForm) => {
    try {
      await addDoc(collection(db, 'bookings'), {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_BOOKINGS || import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            guestName: data.guestName,
            email: data.email,
            phone: data.phone,
            roomType: data.roomType,
            checkIn: data.checkIn,
            checkOut: data.checkOut,
            guests: data.guests,
            specialRequests: data.specialRequests || 'None',
            total: `RWF ${total.toLocaleString()}`,
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
      } catch (_) { /* email failure is non-blocking */ }
      setDone(true);
    } catch (err) {
      console.error(err);
    }
  };

  const canNextStep = () => {
    if (step === 0) return !!selectedRoom;
    if (step === 1) return !!checkIn && !!checkOut && nights > 0;
    return true;
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-3">Reservation Sent!</h2>
          <p className="text-stone-500 text-sm leading-relaxed max-w-xs mx-auto">
            Thank you! Our team will confirm your booking at <strong>{watch('email')}</strong> shortly.
          </p>
          <button onClick={() => { setDone(false); setStep(0); }}
            className="mt-8 px-8 py-3.5 bg-[#1A1A1A] text-white font-bold text-[11px] uppercase tracking-widest rounded-xl active:scale-95 transition-transform">
            Book Another Room
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6EF] flex flex-col">

      {/* Header */}
      <div className="bg-[#1A1A1A] pt-12 pb-6 px-5">
        <div className="flex items-center gap-2 mb-1">
          <Hotel size={14} className="text-[#C9973A]" />
          <span className="text-[#C9973A] text-[10px] font-bold uppercase tracking-[0.35em]">Reservation</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-white">Book a Room</h1>

        {/* Step indicators */}
        <div className="flex items-center gap-3 mt-4">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  i < step ? 'bg-[#C9973A] text-[#1A1A1A]' :
                  i === step ? 'bg-white text-[#1A1A1A]' :
                  'bg-white/20 text-white/40'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${i === step ? 'text-white' : 'text-white/40'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-[#C9973A]' : 'bg-white/20'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-4 pt-5 pb-28">
        <AnimatePresence mode="wait">

          {/* ── STEP 0: Choose Room ── */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Select your room</p>
              {rooms.map(room => (
                <button key={room.id} onClick={() => setValue('roomType', room.name)}
                  className={`w-full text-left rounded-2xl overflow-hidden border-2 transition-all active:scale-[0.98] ${
                    selectedRoom === room.name ? 'border-[#C9973A] shadow-md' : 'border-stone-100 bg-white'
                  }`}>
                  <div className="flex items-stretch">
                    <div className="w-24 shrink-0 relative">
                      {room.imageUrl ? (
                        <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-stone-700 to-stone-900 min-h-[80px]" />
                      )}
                    </div>
                    <div className={`flex-1 p-4 ${selectedRoom === room.name ? 'bg-[#C9973A]/5' : 'bg-white'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-serif font-bold text-[#1A1A1A] text-sm">{room.name}</p>
                        {selectedRoom === room.name && (
                          <div className="w-5 h-5 rounded-full bg-[#C9973A] flex items-center justify-center shrink-0">
                            <span className="text-white text-[10px] font-bold">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-stone-400 text-[11px] mt-0.5 line-clamp-2">{room.description}</p>
                      <p className="text-[#C9973A] font-bold text-sm mt-2">RWF {room.price.toLocaleString()}<span className="text-stone-400 font-normal text-[11px]">/night</span></p>
                    </div>
                  </div>
                </button>
              ))}
              <input type="hidden" {...register('roomType', { required: true })} />
            </motion.div>
          )}

          {/* ── STEP 1: Dates ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Choose your dates</p>

              <div className="bg-white rounded-2xl p-5 border border-stone-100 space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Check-In</label>
                  <input type="date" min={new Date().toISOString().split('T')[0]}
                    {...register('checkIn', { required: true })}
                    className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#C9973A] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Check-Out</label>
                  <input type="date" min={checkIn || new Date().toISOString().split('T')[0]}
                    {...register('checkOut', { required: true })}
                    className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#C9973A] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Number of Guests</label>
                  <select {...register('guests')}
                    className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#C9973A] transition-colors">
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
              </div>

              {nights > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1A1A1A] rounded-2xl px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[#C9973A] text-[10px] font-bold uppercase tracking-widest">Summary</p>
                      <p className="text-white font-serif font-bold text-lg">{selectedRoom}</p>
                    </div>
                    <Bed size={24} className="text-[#C9973A]" strokeWidth={1.5} />
                  </div>
                  <div className="border-t border-white/10 pt-3 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-400">RWF {roomPrice.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}</span>
                      <span className="text-white font-bold">RWF {total.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── STEP 2: Guest Info ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Your details</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-stone-100 space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Full Name</label>
                    <input {...register('guestName', { required: 'Required' })} placeholder="Your full name"
                      className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#C9973A] transition-colors" />
                    {errors.guestName && <p className="text-red-500 text-[10px] mt-1">{errors.guestName.message}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Email Address</label>
                    <input type="email" {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} placeholder="you@example.com"
                      className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#C9973A] transition-colors" />
                    {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Phone Number</label>
                    <input type="tel" {...register('phone')} placeholder="+250 7xx xxx xxx"
                      className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#C9973A] transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-2">Special Requests <span className="font-normal normal-case">(optional)</span></label>
                    <textarea rows={3} {...register('specialRequests')} placeholder="Any special requests or dietary needs..."
                      className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#C9973A] transition-colors resize-none" />
                  </div>
                </div>

                {/* Final summary */}
                <div className="bg-[#1A1A1A] rounded-2xl px-5 py-4">
                  <p className="text-[#C9973A] text-[10px] font-bold uppercase tracking-widest mb-3">Booking Summary</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-stone-400">Room</span><span className="text-white font-bold">{selectedRoom}</span></div>
                    <div className="flex justify-between"><span className="text-stone-400">Check-in</span><span className="text-white">{checkIn}</span></div>
                    <div className="flex justify-between"><span className="text-stone-400">Check-out</span><span className="text-white">{checkOut}</span></div>
                    <div className="flex justify-between"><span className="text-stone-400">Nights</span><span className="text-white">{nights}</span></div>
                    <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                      <span className="text-stone-400 font-bold">Estimated Total</span>
                      <span className="text-[#C9973A] font-bold">RWF {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="w-full py-4 bg-[#C9973A] text-[#1A1A1A] font-bold text-[11px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60">
                  {isSubmitting
                    ? <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                    : <><Hotel size={16} /> Confirm Reservation</>
                  }
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Bottom Nav Buttons */}
      {step < 2 && (
        <div className="fixed bottom-[62px] left-0 right-0 bg-white border-t border-stone-100 px-4 py-4 flex gap-3"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-5 py-3.5 border border-stone-200 rounded-xl text-stone-600 font-bold text-[11px] uppercase tracking-widest active:scale-95 transition-transform">
              <ChevronLeft size={15} /> Back
            </button>
          )}
          <button onClick={() => setStep(s => s + 1)} disabled={!canNextStep()}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#1A1A1A] text-white font-bold text-[11px] uppercase tracking-widest rounded-xl active:scale-95 transition-transform disabled:opacity-40">
            {step === 1 ? 'Enter Details' : 'Choose Dates'} <ChevronRight size={15} />
          </button>
        </div>
      )}

    </div>
  );
};

export default AppBook;