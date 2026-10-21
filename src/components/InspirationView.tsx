import React, { useState } from 'react';
import { Sparkles, Wand2, Copy, Check, ArrowRight } from 'lucide-react';
import { INSPIRATION_LIBRARY, InspirationPrompt } from '../data/prompts';

interface InspirationViewProps {
  onUsePrompt: (prompt: string, style: string, aspectRatio: string) => void;
}

export const InspirationView: React.FC<InspirationViewProps> = ({ onUsePrompt }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['all', ...Array.from(new Set(INSPIRATION_LIBRARY.map((i) => i.category)))];

  const filteredPrompts =
    selectedCategory === 'all'
      ? INSPIRATION_LIBRARY
      : INSPIRATION_LIBRARY.filter((i) => i.category === selectedCategory);

  const handleCopy = (item: InspirationPrompt, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.prompt);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Curated Creative Library</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
            Prompt Inspiration & Ideas
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Need an imaginative spark? Explore our collection of master-crafted prompt blueprints.
            Click any idea to automatically load it into the Studio with optimal style and aspect ratio presets.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-6 custom-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm font-semibold'
                    : 'bg-[#121522] text-slate-400 hover:text-white border border-white/[0.05]'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrompts.map((item) => (
          <div
            key={item.id}
            onClick={() => onUsePrompt(item.prompt, item.style, item.aspectRatio)}
            className="group glass-card p-5 rounded-2xl cursor-pointer hover:border-purple-500/50 hover:bg-[#141726] transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wide">
                  {item.category}
                </span>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 capitalize">
                  <span>{item.style}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>{item.aspectRatio}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                {item.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed font-sans bg-[#0d0f18]/60 p-3 rounded-xl border border-white/[0.04]">
                "{item.prompt}"
              </p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
              <button
                onClick={(e) => handleCopy(item, e)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
              >
                {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === item.id ? 'Copied' : 'Copy Prompt'}</span>
              </button>

              <button
                onClick={() => onUsePrompt(item.prompt, item.style, item.aspectRatio)}
                className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all"
              >
                <span>Use in Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
