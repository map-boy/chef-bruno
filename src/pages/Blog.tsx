// FILE: src/pages/Blog.tsx
import React, { useState, useEffect } from 'react';
import { PenLine, Clock, ArrowRight, Tag } from 'lucide-react';

interface BlogPost {
  id: number; title: string; excerpt: string;
  category: 'Branding' | 'Techniques' | 'Business' | 'Innovation' | 'Mindset' | 'Ethics';
  readTime: string; featured?: boolean;
}

const posts: BlogPost[] = [
  { id: 1, title: 'Why Your Culinary Brand is Your Most Valuable Asset', excerpt: 'In a world saturated with food content, the chefs who build lasting brands outperform those who only master recipes. Here is why brand identity is the ultimate ingredient.', category: 'Branding', readTime: '6 min read', featured: true },
  { id: 2, title: 'The 5 Kitchen Tools Every Modern Chef Needs in 2024', excerpt: 'Beyond the knife and the pan — a curated list of tools that bridge classical technique with modern efficiency, from precision thermometers to AI-assisted recipe databases.', category: 'Techniques', readTime: '4 min read' },
  { id: 3, title: 'How to Build a Food Blog That People Actually Read', excerpt: 'Most food blogs die within six months. The ones that survive share three non-obvious traits. We break them down with real examples from Chef Bruno\'s content journey.', category: 'Branding', readTime: '8 min read', featured: true },
  { id: 4, title: 'The Death of the Traditional Restaurant and the Rise of Ghost Kitchens', excerpt: 'Cloud kitchens are reshaping the hospitality landscape globally — and Rwanda is no exception. What this means for culinary entrepreneurs in East Africa.', category: 'Business', readTime: '7 min read' },
  { id: 5, title: 'Mastering Minimalist Plating: A Case Study', excerpt: 'Through the lens of three signature dishes, we explore how restraint, negative space, and a singular focal point can transform a meal into an experience.', category: 'Techniques', readTime: '5 min read' },
  { id: 6, title: 'The Psychology of Color in Food Branding', excerpt: 'Why amber triggers appetite while blue suppresses it. A deep dive into how chromatic choices in your restaurant, packaging, and content shape how guests feel before the first bite.', category: 'Branding', readTime: '6 min read' },
  { id: 7, title: 'How to Stay Creative in the Kitchen When You Are Feeling Burnt Out', excerpt: 'Burnout is endemic among culinary professionals. These evidence-based strategies — from constraint-based cooking to cross-discipline inspiration — can reignite your creative fire.', category: 'Mindset', readTime: '5 min read' },
  { id: 8, title: 'The Future of Lab-Grown Meat and What It Means for Chefs', excerpt: 'Cultured protein is no longer science fiction. We examine the ethical, culinary, and business implications for professional kitchens navigating this seismic shift.', category: 'Innovation', readTime: '9 min read' },
  { id: 9, title: 'Five Lessons from World-Class Culinary Storytellers', excerpt: 'What the masters of culinary narrative teach us about turning a meal into a story that guests carry home.', category: 'Mindset', readTime: '7 min read' },
  { id: 10, title: 'Why Consistency is More Important Than Complexity at First', excerpt: 'The impulse to innovate early is understandable but costly. Building deep consistency in your foundational dishes creates the reputation that allows complexity to shine later.', category: 'Business', readTime: '4 min read' },
  { id: 11, title: 'Navigating Culinary Ethics in the Age of Industrial Food', excerpt: 'From farm-to-table sourcing to portion ethics and food waste, a practical framework for chefs who want to align their kitchen practices with their values.', category: 'Ethics', readTime: '8 min read' },
  { id: 12, title: 'How to Turn Your Signature Dish Into a Profitable Online Course', excerpt: 'The step-by-step methodology Chef Bruno uses to package culinary knowledge into structured digital learning — from scripting to pricing to platform selection.', category: 'Business', readTime: '10 min read' },
];

const categoryColors: Record<BlogPost['category'], string> = {
  Branding:   'bg-amber-100 text-amber-700',
  Techniques: 'bg-blue-100 text-blue-700',
  Business:   'bg-emerald-100 text-emerald-700',
  Innovation: 'bg-purple-100 text-purple-700',
  Mindset:    'bg-rose-100 text-rose-700',
  Ethics:     'bg-stone-100 text-stone-600',
};

const allCategories: Array<BlogPost['category'] | 'All'> = ['All', 'Branding', 'Techniques', 'Business', 'Innovation', 'Mindset', 'Ethics'];

const Blog: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<BlogPost['category'] | 'All'>('All');
  useEffect(() => { document.title = 'Blog | Chef Bruno Hotel & Culinary Center'; }, []);

  const filtered = activeFilter === 'All' ? posts : posts.filter(p => p.category === activeFilter);
  const filteredFeatured = filtered.filter(p => p.featured);
  const filteredRegular = filtered.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      {/* Hero */}
      <div className="bg-[#1A1A1A] pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600 rounded-full blur-[140px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 border border-amber-600/40 text-amber-500 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
            <PenLine size={12} /> Chef Bruno Journal
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            The <span className="text-[#C9973A]">Culinary</span> Blog
          </h1>
          <p className="text-stone-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Insights, strategies, and stories from the intersection of food, business, and culture — by Chef Bruno.
          </p>
          <div className="mt-8 flex items-center justify-center gap-6 text-stone-500 text-sm">
            <span className="flex items-center gap-2"><PenLine size={14} /> {posts.length} Articles</span>
            <span className="w-1 h-1 bg-stone-600 rounded-full" />
            <span>6 Categories</span>
            <span className="w-1 h-1 bg-stone-600 rounded-full" />
            <span>Coming Soon</span>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="sticky top-[64px] z-30 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-3 overflow-x-auto">
          {allCategories.map(cat => (
            <button key={cat} onClick={() => setActiveFilter(cat)}
              className={`shrink-0 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${activeFilter === cat ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-transparent text-stone-500 border-stone-300 hover:border-stone-400'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Featured */}
        {filteredFeatured.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-px bg-[#C9973A]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9973A]">Featured</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredFeatured.map(post => (
                <div key={post.id} className="bg-[#1A1A1A] rounded-xl p-8 relative overflow-hidden group cursor-pointer hover:bg-stone-900 transition-colors">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#C9973A] opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${categoryColors[post.category]}`}>{post.category}</span>
                      <span className="flex items-center gap-1 text-stone-500 text-[10px]"><Clock size={10} /> {post.readTime}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-white mb-4 leading-snug group-hover:text-[#C9973A] transition-colors">{post.title}</h3>
                    <p className="text-stone-400 text-sm leading-relaxed mb-6">{post.excerpt}</p>
                    <div className="flex items-center gap-2 text-[#C9973A] text-[10px] font-bold uppercase tracking-widest">
                      Read Article <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular */}
        {filteredRegular.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-px bg-stone-300" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">
                {activeFilter === 'All' ? 'All Articles' : activeFilter}
              </p>
            </div>
            <div className="grid gap-px bg-stone-200 rounded-xl overflow-hidden border border-stone-200">
              {filteredRegular.map((post, i) => (
                <div key={post.id} className="bg-white hover:bg-stone-50 transition-colors group cursor-pointer">
                  <div className="p-6 flex items-start gap-6">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 text-xs font-bold group-hover:bg-[#C9973A] group-hover:text-white transition-all">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${categoryColors[post.category]}`}>{post.category}</span>
                        <span className="flex items-center gap-1 text-stone-400 text-[10px]"><Clock size={10} /> {post.readTime}</span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#1A1A1A] mb-2 group-hover:text-[#C9973A] transition-colors leading-snug">{post.title}</h3>
                      <p className="text-stone-500 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                    </div>
                    <div className="shrink-0 w-8 h-8 flex items-center justify-center text-stone-300 group-hover:text-[#C9973A] transition-colors mt-1">
                      <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Tag size={40} className="text-stone-300 mx-auto mb-4" />
            <p className="text-stone-400 text-lg font-serif">No articles in this category yet.</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-[#1A1A1A] py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[#C9973A] text-[10px] uppercase tracking-[0.4em] font-bold mb-4">Stay Sharp</p>
          <h2 className="font-serif text-3xl md:text-4xl text-white font-bold mb-4">Articles Launching Soon</h2>
          <p className="text-stone-500 mb-8 leading-relaxed">
            Our blog is currently being written and curated. Each article will be crafted with the same attention to detail Chef Bruno brings to every dish.
          </p>
          <a href="/contact" className="inline-flex items-center gap-3 bg-[#C9973A] hover:bg-[#b08432] text-white px-10 py-4 text-[10px] font-bold uppercase tracking-widest transition-all">
            Notify Me <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Blog;