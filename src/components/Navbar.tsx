import React from 'react';
import { Wand2, Images, Sparkles, ShieldCheck, Heart, Layers } from 'lucide-react';
import { StatsData } from '../types';

interface NavbarProps {
  activeTab: 'studio' | 'gallery' | 'inspiration' | 'zeroCost';
  setActiveTab: (tab: 'studio' | 'gallery' | 'inspiration' | 'zeroCost') => void;
  galleryCount: number;
  stats: StatsData | null;
  onOpenZeroCostModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  galleryCount,
  stats,
  onOpenZeroCostModal
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#090a10]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('studio')}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-600/25 group-hover:scale-105 transition-transform duration-200">
            ✦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                ImagineAI
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                $0.00
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Free High-Res Generative Art Studio</p>
          </div>
        </div>

        {/* Navigation Tabs - Segmented clean control */}
        <nav className="flex items-center gap-1 p-1 bg-[#121522] border border-white/[0.08] rounded-xl overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap ${
              activeTab === 'studio'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Images className="w-3.5 h-3.5" />
            <span>My Images & Gallery</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'gallery' ? 'bg-purple-700 text-purple-100' : 'bg-white/10 text-slate-300'}`}>
              {galleryCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('inspiration')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap ${
              activeTab === 'inspiration'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Inspiration</span>
          </button>

          <button
            onClick={() => setActiveTab('zeroCost')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap ${
              activeTab === 'zeroCost'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-white/[0.04]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Zero-Cost Model</span>
          </button>
        </nav>

        {/* Right Info & Live Stats */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-slate-400">
          {stats && (
            <div className="flex items-center gap-3 py-1 px-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>{stats.totalCreations} creations</span>
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/20" />
                <span>{stats.totalLikes} likes</span>
              </span>
            </div>
          )}

          <button
            onClick={onOpenZeroCostModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 transition cursor-pointer"
            title="Read about how ImagineAI guarantees 100% free image generation with no billing"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>$0.00 Guaranteed</span>
          </button>
        </div>

      </div>
    </header>
  );
};
