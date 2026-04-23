// FILE: src/pages/Videos.tsx
import React, { useState, useEffect } from 'react';
import { Play, Users, Target, ChevronRight, Film } from 'lucide-react';

interface Video {
  id: number;
  title: string;
  description: string;
  hook: string;
  body: string;
  cta: string;
  audience: string;
  goal: string;
  category: 'Brand' | 'Tutorial' | 'Education' | 'Business' | 'Inspiration';
  duration: string;
}

const videos: Video[] = [
  { id: 1, title: 'The Culinary Renaissance', description: 'An exploration of how digital tools are reshaping the culinary arts.', hook: 'The tools of the kitchen have never been more accessible.', body: 'Discuss the shift from traditional to modern gastronomy.', cta: 'Join the Chef Bruno community.', audience: 'Aspiring chefs', goal: 'Brand awareness and inspiration', category: 'Brand', duration: '8–12 min' },
  { id: 2, title: 'Mastering the Perfect Sear', description: 'Practical tips for achieving the perfect crust on any protein.', hook: 'The sear is where the flavor lives.', body: '3 steps to a perfect crust.', cta: 'Download our cooking guide.', audience: 'Home cooks', goal: 'Establish authority in culinary techniques', category: 'Tutorial', duration: '5–8 min' },
  { id: 3, title: 'AI in the Kitchen', description: 'How to integrate AI into your recipe development without losing the human touch.', hook: 'AI is not replacing the chef — it is augmenting the palate.', body: 'Show real-world examples of AI-assisted recipe creation.', cta: 'Sign up for our culinary workshop.', audience: 'Professional chefs', goal: 'Promote training programs', category: 'Education', duration: '10–15 min' },
  { id: 4, title: 'The Architecture of a Dish', description: 'Breaking down the elements of world-class plate presentation.', hook: 'A dish is more than just food — it is a visual experience.', body: 'Discuss balance, color, and texture.', cta: 'Get a plating audit.', audience: 'Culinary students', goal: 'Lead generation for consulting', category: 'Tutorial', duration: '6–10 min' },
  { id: 5, title: 'Food Styling in 60 Seconds', description: 'How to capture attention and deliver value in short-form food video.', hook: 'You have 3 seconds to make them hungry.', body: 'The lighting-angle-action framework.', cta: 'Follow for more tips.', audience: 'Food bloggers', goal: 'Engagement and growth', category: 'Tutorial', duration: '1–3 min' },
  { id: 6, title: 'The Future of Culinary Education', description: 'Why self-directed digital learning is the new culinary school.', hook: 'The kitchen is now everywhere.', body: 'The rise of digital culinary certifications.', cta: 'Explore our courses.', audience: 'Lifelong learners', goal: 'Course sales', category: 'Education', duration: '8–12 min' },
  { id: 7, title: 'Minimalism on the Plate', description: 'Why less is almost always more in modern plating.', hook: 'Clutter is the death of flavor clarity.', body: 'Principles of negative space and focus.', cta: 'View our portfolio.', audience: 'Restaurant owners', goal: 'Showcase culinary philosophy', category: 'Inspiration', duration: '5–7 min' },
  { id: 8, title: 'Building a Culinary Legacy', description: 'How to create recipes and content that last longer than a food trend.', hook: 'Do not just chase viral recipes — build foundations.', body: 'Evergreen culinary strategies.', cta: 'Read our latest book.', audience: 'Food creators', goal: 'Book sales', category: 'Business', duration: '10–14 min' },
  { id: 9, title: 'The Ethics of Sourcing', description: 'Navigating the responsibility of a modern chef in the global food system.', hook: 'With great flavor comes great responsibility.', body: 'Sustainability vs. Convenience.', cta: 'Join the discussion.', audience: 'Conscious consumers', goal: 'Community building', category: 'Inspiration', duration: '8–11 min' },
  { id: 10, title: 'From Recipe to Restaurant', description: 'A step-by-step guide to launching your first culinary concept.', hook: 'Stop dreaming and start cooking.', body: 'The pop-up approach.', cta: 'Start your journey today.', audience: 'Food entrepreneurs', goal: 'Conversion to training', category: 'Business', duration: '12–18 min' },
];

const categoryColors: Record<Video['category'], string> = {
  Brand:       'bg-amber-600/20 text-amber-400 border-amber-600/40',
  Tutorial:    'bg-blue-600/20 text-blue-400 border-blue-600/40',
  Education:   'bg-emerald-600/20 text-emerald-400 border-emerald-600/40',
  Business:    'bg-purple-600/20 text-purple-400 border-purple-600/40',
  Inspiration: 'bg-rose-600/20 text-rose-400 border-rose-600/40',
};

const categories: Array<Video['category'] | 'All'> = ['All', 'Brand', 'Tutorial', 'Education', 'Business', 'Inspiration'];

const Videos: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<Video['category'] | 'All'>('All');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => { document.title = 'Video Content | Chef Bruno Hotel & Culinary Center'; }, []);

  const filtered = activeFilter === 'All' ? videos : videos.filter(v => v.category === activeFilter);

  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      {/* Hero */}
      <div className="bg-[#1A1A1A] pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-800 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 border border-amber-600/40 text-amber-500 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
            <Film size={12} /> Content Library
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Video Content <span className="text-[#C9973A]">Series</span>
          </h1>
          <p className="text-stone-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Explore our planned video series — from culinary techniques to building a food business.
            Crafted to inspire, educate, and transform aspiring chefs worldwide.
          </p>
          <div className="mt-8 flex items-center justify-center gap-6 text-stone-500 text-sm">
            <span className="flex items-center gap-2"><Film size={14} /> 10 Episodes Planned</span>
            <span className="w-1 h-1 bg-stone-600 rounded-full" />
            <span>5 Categories</span>
            <span className="w-1 h-1 bg-stone-600 rounded-full" />
            <span>Coming Soon</span>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="sticky top-[64px] z-30 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-3 overflow-x-auto">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveFilter(cat)}
              className={`shrink-0 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${activeFilter === cat ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-transparent text-stone-500 border-stone-300 hover:border-stone-400'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((video) => (
            <div key={video.id} className="bg-white rounded-xl overflow-hidden border border-stone-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-48 bg-gradient-to-br from-stone-800 to-stone-950 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_#C9973A,_transparent)]" />
                <div className="relative z-10 text-center px-6">
                  <div className="w-14 h-14 rounded-full bg-[#C9973A]/20 border-2 border-[#C9973A]/50 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Play size={22} className="text-[#C9973A] ml-1" />
                  </div>
                  <p className="text-stone-400 text-[9px] uppercase tracking-widest font-bold">Episode {video.id}</p>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${categoryColors[video.category]}`}>{video.category}</span>
                </div>
                <div className="absolute bottom-3 left-3 text-[9px] text-stone-400 font-bold uppercase tracking-wider">{video.duration}</div>
              </div>

              <div className="p-6">
                <h3 className="font-serif text-lg font-bold text-[#1A1A1A] mb-2 leading-snug group-hover:text-[#C9973A] transition-colors">{video.title}</h3>
                <p className="text-stone-500 text-sm mb-4 leading-relaxed">{video.description}</p>
                <blockquote className="border-l-2 border-[#C9973A] pl-3 mb-4 text-stone-600 text-xs italic leading-relaxed">"{video.hook}"</blockquote>
                <div className="flex items-center gap-4 text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-4">
                  <span className="flex items-center gap-1"><Users size={10} /> {video.audience}</span>
                  <span className="flex items-center gap-1"><Target size={10} /> {video.goal}</span>
                </div>
                <button onClick={() => setExpanded(expanded === video.id ? null : video.id)}
                  className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#C9973A] hover:text-amber-700 transition-colors pt-4 border-t border-stone-100">
                  {expanded === video.id ? 'Hide Details' : 'View Script Outline'}
                  <ChevronRight size={14} className={`transition-transform ${expanded === video.id ? 'rotate-90' : ''}`} />
                </button>
                {expanded === video.id && (
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="bg-stone-50 rounded-lg p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Script Body</p>
                      <p className="text-stone-700">{video.body}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Call to Action</p>
                      <p className="text-stone-700 font-medium">{video.cta}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#1A1A1A] py-20 px-6 text-center">
        <p className="text-stone-400 text-[10px] uppercase tracking-[0.4em] font-bold mb-4">Stay Updated</p>
        <h2 className="font-serif text-3xl md:text-4xl text-white font-bold mb-6">Be the First to Watch</h2>
        <p className="text-stone-500 max-w-xl mx-auto mb-8 leading-relaxed">
          Our video series is in production. Follow Chef Bruno on TikTok and Instagram for premiere announcements.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a href="https://tiktok.com/@shimirwabruno" target="_blank" rel="noopener noreferrer"
            className="bg-[#C9973A] hover:bg-[#b08432] text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest transition-all">
            Follow on TikTok
          </a>
          <a href="/contact" className="border border-stone-600 hover:border-stone-400 text-stone-400 hover:text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest transition-all">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default Videos;