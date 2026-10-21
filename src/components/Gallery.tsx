import React, { useState, useMemo } from 'react';
import {
  Search,
  Heart,
  Maximize2,
  Download,
  Copy,
  Check,
  Trash2,
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { Creation } from '../types';

interface GalleryProps {
  creations: Creation[];
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenModal: (creation: Creation) => void;
  onRemix: (creation: Creation) => void;
}

const STYLE_FILTERS = [
  { id: 'all', label: 'All Styles' },
  { id: 'photorealistic', label: 'Photorealistic' },
  { id: 'anime', label: 'Anime' },
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'fantasy', label: 'Fantasy' },
  { id: 'minimal', label: 'Minimalist 3D' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'isometric', label: 'Isometric' }
];

export const Gallery: React.FC<GalleryProps> = ({
  creations,
  onLike,
  onDelete,
  onOpenModal,
  onRemix
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'likes'>('newest');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCreations = useMemo(() => {
    let list = [...creations];

    if (selectedStyle !== 'all') {
      list = list.filter((c) => c.style.toLowerCase() === selectedStyle.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.prompt.toLowerCase().includes(q) ||
          c.style.toLowerCase().includes(q) ||
          (c.enhancedPrompt && c.enhancedPrompt.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'likes') {
      list.sort((a, b) => b.likes - a.likes);
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [creations, selectedStyle, searchQuery, sortBy]);

  const handleCopyPrompt = (c: Creation, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(c.prompt);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (c: Creation, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = c.imageUrl;
    link.download = `imagineai-${c.id}.jpg`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 glass-panel rounded-2xl">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts by keyword, subject, style..."
            className="w-full bg-[#0d0f18] border border-white/[0.08] focus:border-purple-500/70 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort and Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Sort by:</span>
          </div>

          <div className="flex items-center p-0.5 bg-[#0d0f18] border border-white/[0.08] rounded-lg">
            <button
              onClick={() => setSortBy('newest')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                sortBy === 'newest'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setSortBy('likes')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                sortBy === 'likes'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Most Liked
            </button>
          </div>
        </div>

      </div>

      {/* Style Filters - Segmented Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {STYLE_FILTERS.map((f) => {
          const isSelected = selectedStyle === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedStyle(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/25 font-semibold'
                  : 'bg-[#121522] text-slate-400 hover:text-white border border-white/[0.05] hover:border-white/[0.12]'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Gallery Count Info */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-slate-200">{filteredCreations.length}</strong> creations
          {selectedStyle !== 'all' && ` in ${selectedStyle}`}
        </span>
        <span className="text-[11px] text-slate-500">
          Saved in persistent SQLite/JSON database
        </span>
      </div>

      {/* Empty State */}
      {filteredCreations.length === 0 && (
        <div className="text-center py-20 glass-panel rounded-2xl max-w-md mx-auto p-6">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4 border border-white/[0.08] text-2xl">
            🔍
          </div>
          <h3 className="text-base font-bold text-white mb-1">No creations found</h3>
          <p className="text-xs text-slate-400 mb-4">
            Try adjusting your search query or selecting "All Styles" to view all creations.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedStyle('all');
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Creations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredCreations.map((item) => (
          <div
            key={item.id}
            onClick={() => onOpenModal(item)}
            className="group glass-card rounded-2xl overflow-hidden cursor-pointer hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-950/20 transition-all duration-300 flex flex-col"
          >
            {/* Image Canvas with Aspect Framing */}
            <div className="relative aspect-square overflow-hidden bg-[#07080d]">
              <img
                src={item.imageUrl}
                alt={item.prompt}
                loading="lazy"
                style={{ imageRendering: 'auto' }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Top overlay actions */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLike(item.id);
                  }}
                  className="bg-black/70 hover:bg-black/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 text-white transition shadow-sm"
                  title="Like creation"
                >
                  <Heart className={`w-3.5 h-3.5 ${item.likes > 0 ? 'text-pink-500 fill-pink-500' : 'text-white'}`} />
                  <span>{item.likes}</span>
                </button>
              </div>

              {/* Bottom hover bar */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex items-center justify-between opacity-95 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => handleCopyPrompt(item, e)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1 transition"
                  title="Copy Prompt"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{copiedId === item.id ? 'Copied' : 'Prompt'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemix(item);
                    }}
                    className="p-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white text-[11px] font-medium transition"
                    title="Remix this prompt in Studio"
                  >
                    Remix
                  </button>
                  <button
                    onClick={(e) => handleDownload(item, e)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                    title="Download HD"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Information Card Body */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed mb-3">
                {item.prompt}
              </p>

              {/* Clean unboxed metadata strip (Frontend-Design Rule: NO static pill enclosures!) */}
              <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 capitalize">
                  <span>{item.style}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>{item.aspectRatio}</span>
                </div>
                <span>{formatTimeAgo(item.createdAt)}</span>
              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
