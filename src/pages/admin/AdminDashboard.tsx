// FILE: src/pages/admin/AdminDashboard.tsx
import React from 'react';
import { Database, HardDrive, Zap, Users, Calendar, Bed, BookOpen, Utensils } from 'lucide-react';
import { useRooms } from '../../hooks/useRooms';
import { useEvents } from '../../hooks/useEvents';
import { useServices } from '../../hooks/useServices';
import { useAcademy } from '../../hooks/useAcademy';

const AdminDashboard = () => {
  const { rooms } = useRooms();
  const { events } = useEvents();
  const { services } = useServices();
  const { modules } = useAcademy();

  const stats = [
    { label: 'Rooms', value: rooms.length, icon: <Bed size={20} />, color: 'amber' },
    { label: 'Events', value: events.length, icon: <Calendar size={20} />, color: 'blue' },
    { label: 'Services', value: services.length, icon: <Utensils size={20} />, color: 'emerald' },
    { label: 'Academy Modules', value: modules.length, icon: <BookOpen size={20} />, color: 'purple' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Dashboard</h1>
        <p className="text-stone-500 text-sm">System overview and Firebase usage.</p>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
            <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center mb-4 text-amber-600">
              {stat.icon}
            </div>
            <p className="text-3xl font-serif font-bold text-stone-900">{stat.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Firebase Spark Plan Info */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-stone-100">
          <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-3">
            <Database size={24} className="text-amber-500" />
            Firebase Spark Plan — Free Tier Limits
          </h2>
          <p className="text-stone-400 text-sm mt-2">You are currently on the <span className="font-bold text-amber-600">Spark (Free)</span> plan. Monitor usage below.</p>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: 'Firestore Reads', limit: '50,000 / day', icon: '📖' },
            { label: 'Firestore Writes', limit: '20,000 / day', icon: '✏️' },
            { label: 'Firestore Deletes', limit: '20,000 / day', icon: '🗑️' },
            { label: 'Storage', limit: '5 GB total', icon: '🗄️' },
            { label: 'Storage Downloads', limit: '1 GB / day', icon: '⬇️' },
            { label: 'Hosting', limit: '10 GB / month', icon: '🌐' },
          ].map((item) => (
            <div key={item.label} className="bg-stone-50 p-5 rounded-xl border border-stone-100">
              <p className="text-2xl mb-3">{item.icon}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">{item.label}</p>
              <p className="text-sm font-bold text-stone-900">{item.limit}</p>
            </div>
          ))}
        </div>

        <div className="p-8 bg-amber-50 border-t border-amber-100">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-2">⚠️ How to check real usage</p>
          <p className="text-sm text-amber-800">Go to <span className="font-bold">Firebase Console → Your Project → Usage & Billing</span> to see live read/write/storage numbers. You cannot see this in the app itself on Spark plan.</p>
        </div>
      </div>

      {/* Blaze Plan Advice */}
      <div className="bg-stone-900 rounded-2xl p-8 md:p-10 text-white">
        <div className="flex items-start gap-6">
          <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">
            <Zap size={28} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold mb-3">Should You Upgrade to Blaze?</h3>
            <div className="space-y-3 text-stone-400 text-sm font-light leading-relaxed">
              <p>✅ <span className="text-white font-medium">Stay on Spark if:</span> the site gets low traffic (under 1,000 visitors/day), images are small, and you rarely write to the database.</p>
              <p>⚡ <span className="text-amber-400 font-medium">Upgrade to Blaze if:</span> you want Cloud Functions (for auto-emails), more than 5GB storage, or the site grows significantly.</p>
              <p>💰 <span className="text-white font-medium">Blaze cost:</span> Pay-as-you-go — only pay for what you use above the free limits. For a small hotel site, it would likely cost <span className="text-amber-400 font-bold">$0–$5/month</span>.</p>
              <p>🔒 <span className="text-white font-medium">Safety tip:</span> Set a <span className="text-amber-400 font-bold">budget alert at $5</span> in Firebase Console → Billing so you never get surprised.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;