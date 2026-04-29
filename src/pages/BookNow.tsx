// FILE: src/pages/BookNow.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRooms } from '../hooks/useRooms';
import { Calendar as CalendarIcon, Hotel, Check, Info, Loader2, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import emailjs from '@emailjs/browser';

interface BookingFormData {
  checkIn: string;
  checkOut: string;
  roomType: string;
  guestName: string;
  email: string;
  phone: string;
}

const BookNow = () => {
  const { rooms } = useRooms();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const preSelectedRoom = queryParams.get('room') || '';

  useEffect(() => {
    document.title = 'Book Your Stay | Chef Bruno';
  }, []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BookingFormData>({
    defaultValues: { roomType: preSelectedRoom }
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      // 1. Save to Firestore
      await addDoc(collection(db, 'bookings'), {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // 2. Send email notification to admin
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_BOOKINGS,
        {
          guest_name: data.guestName,
          guest_email: data.email,
          guest_phone: data.phone,
          room_type: data.roomType,
          check_in: data.checkIn,
          check_out: data.checkOut,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setIsBooked(true);
      reset();
      setTimeout(() => setIsBooked(false), 8000);
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to process booking. Please contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-20 bg-stone-50 min-h-screen">
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-600/10 rounded-full mb-6"
            >
              <Hotel size={14} className="text-amber-600" />
              <span className="text-amber-600 text-[10px] font-bold uppercase tracking-[0.3em]">Reservation Request</span>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 mb-6">Book Your Experience</h1>
            <p className="text-stone-500 font-light text-xl max-w-2xl mx-auto">
              Reserve your sanctuary at the heart of our culinary world. Let us prepare for your arrival.
            </p>
          </div>

          <div className="bg-white rounded-sm shadow-[0_30px_100px_-20px_rgba(0,0,0,0.15)] border border-stone-100 overflow-hidden lg:flex">
            {/* Left: Policy */}
            <div className="w-full lg:w-1/3 bg-stone-900 p-10 md:p-12 text-white">
              <h4 className="text-2xl font-serif font-bold mb-8 flex items-center">
                <Info size={20} className="text-amber-500 mr-3" />
                Booking Policy
              </h4>
              <ul className="space-y-8">
                <li className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                  <p className="text-sm text-stone-400 font-light italic leading-relaxed">
                    All online bookings are initially 'Pending'. Our team will contact you via email within 24 hours to confirm your reservation.
                  </p>
                </li>
                <li className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                  <p className="text-sm text-stone-400 font-light italic leading-relaxed">
                    Check-in is at 2:00 PM and Check-out is at 11:00 AM.
                  </p>
                </li>
                <li className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                  <p className="text-sm text-stone-400 font-light italic leading-relaxed">
                    For group bookings or academy cohorts, please contact us directly via the contact form.
                  </p>
                </li>
              </ul>
              <div className="mt-16 text-center">
                <p className="text-stone-600 text-[10px] font-bold uppercase tracking-widest mb-4">Direct Support</p>
                <p className="text-amber-500 text-lg font-serif">+250 790 167 349</p>
              </div>
            </div>

            {/* Right: Form */}
            <div className="flex-grow p-10 md:p-16">
              <AnimatePresence mode="wait">
                {isBooked ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-12 text-center"
                  >
                    <div className="w-24 h-24 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                      <Check size={48} strokeWidth={3} />
                    </div>
                    <h4 className="text-3xl font-serif font-bold text-stone-900 mb-4">Request Sent Successfully</h4>
                    <p className="text-stone-500 leading-relaxed max-w-sm mx-auto mb-10 text-lg font-light">
                      Your reservation request has been logged and our team has been notified. We will reach out within 24 hours.
                    </p>
                    <button
                      onClick={() => setIsBooked(false)}
                      className="px-12 py-4 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all rounded-sm"
                    >
                      New Booking
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
                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 block ml-1">Check-In Date</label>
                        <div className="relative">
                          <CalendarIcon size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                          <input
                            type="date"
                            {...register('checkIn', { required: 'Required' })}
                            className="w-full pl-14 pr-6 py-4 bg-stone-50 border border-stone-200 outline-none focus:border-stone-900 rounded-sm text-sm"
                          />
                        </div>
                        {errors.checkIn && <p className="text-red-500 text-xs ml-1">{errors.checkIn.message}</p>}
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 block ml-1">Check-Out Date</label>
                        <div className="relative">
                          <CalendarIcon size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                          <input
                            type="date"
                            {...register('checkOut', { required: 'Required' })}
                            className="w-full pl-14 pr-6 py-4 bg-stone-50 border border-stone-200 outline-none focus:border-stone-900 rounded-sm text-sm"
                          />
                        </div>
                        {errors.checkOut && <p className="text-red-500 text-xs ml-1">{errors.checkOut.message}</p>}
                      </div>
                    </div>

                    {/* Room */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 block ml-1">Select Your Room</label>
                      <select
                        {...register('roomType', { required: 'Please select a room' })}
                        className="w-full px-6 py-4 bg-stone-50 border border-stone-200 outline-none focus:border-stone-900 rounded-sm text-sm appearance-none"
                      >
                        <option value="">Select an Accommodation</option>
                        {rooms.map(room => (
                          <option key={room.id} value={room.name}>
                            {room.name} — RWF {room.price.toLocaleString()}/night
                          </option>
                        ))}
                      </select>
                      {errors.roomType && <p className="text-red-500 text-xs ml-1">{errors.roomType.message}</p>}
                    </div>

                    {/* Guest Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-stone-100">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 block ml-1">Your Name</label>
                        <input
                          {...register('guestName', { required: 'Required' })}
                          className="w-full px-6 py-4 bg-stone-50 border border-stone-200 outline-none focus:border-stone-900 rounded-sm text-sm"
                          placeholder="Full Name"
                        />
                        {errors.guestName && <p className="text-red-500 text-xs ml-1">{errors.guestName.message}</p>}
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 block ml-1">Contact Email</label>
                        <input
                          {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                          className="w-full px-6 py-4 bg-stone-50 border border-stone-200 outline-none focus:border-stone-900 rounded-sm text-sm"
                          placeholder="Email Address"
                        />
                        {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>}
                      </div>
                    </div>

                    {/* Phone Number — new field */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 block ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                        <input
                          {...register('phone', {
                            required: 'Phone number is required',
                            pattern: {
                              value: /^[+\d\s\-()]{7,20}$/,
                              message: 'Enter a valid phone number'
                            }
                          })}
                          className="w-full pl-14 pr-6 py-4 bg-stone-50 border border-stone-200 outline-none focus:border-stone-900 rounded-sm text-sm"
                          placeholder="+250 7XX XXX XXX"
                          type="tel"
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-xs ml-1">{errors.phone.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-5 bg-stone-900 text-white font-bold text-xs uppercase tracking-[0.4em] hover:bg-stone-800 transition-all rounded-sm flex items-center justify-center gap-3 mt-10 active:scale-95"
                    >
                      {isSubmitting
                        ? <><Loader2 size={18} className="animate-spin" /> Sending...</>
                        : <><Hotel size={18} /> Check Availability</>
                      }
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

export default BookNow;