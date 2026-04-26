// FILE: src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-center px-6">
      <p className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Error 404</p>
      <h1 className="text-8xl md:text-9xl font-serif font-bold text-white mb-6">404</h1>
      <p className="text-stone-400 text-lg mb-10 max-w-md">
        This page doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-10 py-4 bg-amber-600 text-stone-900 font-bold text-[10px] uppercase tracking-widest hover:bg-amber-500 transition-all"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;