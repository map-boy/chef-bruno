// FILE: src/pages/admin/AdminLogin.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, ADMIN_EMAILS } from '../../firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { Hotel, ShieldAlert, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (ADMIN_EMAILS.includes(user.email!)) {
          navigate('/admin/dashboard');
        } else {
          setError('Access Denied: You are not authorized to view this panel.');
          signOut(auth);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error(err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
         <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-600 rounded-full blur-[100px]"></div>
         <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-600 rounded-full blur-[100px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-stone-900 border border-amber-600/30 rounded-2xl mb-8 shadow-2xl">
             <Hotel className="text-amber-500" size={40} />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 tracking-tight">Management Suite</h1>
          <p className="text-stone-500 text-sm font-medium uppercase tracking-[0.3em]">Authorized Access Only</p>
        </div>

        <div className="bg-stone-900 p-10 rounded-xl border border-white/5 shadow-2xl backdrop-blur-md">
           {error && (
             <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-4 text-red-200 text-sm">
                <ShieldAlert className="shrink-0 text-red-500" size={20} />
                <p>{error}</p>
             </div>
           )}

           <button
             onClick={handleLogin}
             disabled={loading}
             className="w-full h-16 bg-white hover:bg-stone-100 text-stone-900 flex items-center justify-center gap-4 rounded-lg font-bold text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50"
           >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                  Sign In with Google
                </>
              )}
           </button>

           <div className="mt-10 pt-10 border-t border-white/5 text-center">
              <p className="text-stone-600 text-[10px] font-bold uppercase tracking-widest leading-loose">
                System Security v4.5.1<br/>
                Chef Bruno Hotel & Culinary Center
              </p>
           </div>
        </div>

        <div className="mt-12 text-center">
           <a href="/" className="text-amber-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
             ← Return to Main Website
           </a>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;