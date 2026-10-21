import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Studio } from './components/Studio';
import { Gallery } from './components/Gallery';
import { InspirationView } from './components/InspirationView';
import { ZeroCostGuide } from './components/ZeroCostGuide';
import { ImageModal } from './components/ImageModal';
import { ZeroCostModal } from './components/ZeroCostModal';
import { Creation, StatsData } from './types';
import { Sparkles, Heart, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'gallery' | 'inspiration' | 'zeroCost'>('studio');
  const [creations, setCreations] = useState<Creation[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [selectedCreation, setSelectedCreation] = useState<Creation | null>(null);
  const [isZeroCostModalOpen, setIsZeroCostModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);

  // Studio form prefill state (for remix / inspiration)
  const [studioPrompt, setStudioPrompt] = useState<string>('');
  const [studioStyle, setStudioStyle] = useState<string>('photorealistic');
  const [studioRatio, setStudioRatio] = useState<string>('1:1');

  // Load creations and stats on mount
  useEffect(() => {
    fetchCreations();
    fetchStats();
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const fetchCreations = async () => {
    try {
      const res = await fetch('/api/images');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCreations(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch creations:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleCreationSuccess = (newCreation: Creation) => {
    setCreations((prev) => [newCreation, ...prev]);
    fetchStats();
    showToast('Your real AI artwork was created and saved to the database!', 'success');
  };

  const handleLike = async (id: string) => {
    // Optimistic update
    setCreations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
    );
    if (selectedCreation && selectedCreation.id === id) {
      setSelectedCreation((prev) => (prev ? { ...prev, likes: prev.likes + 1 } : null));
    }

    try {
      const res = await fetch(`/api/images/${id}/like`, { method: 'POST' });
      const json = await res.json();
      if (json.success && json.data) {
        setCreations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, likes: json.data.likes } : c))
        );
        fetchStats();
      }
    } catch (err) {
      console.error('Error liking creation:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/images/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setCreations((prev) => prev.filter((c) => c.id !== id));
        fetchStats();
        showToast('Creation removed from database.', 'info');
      }
    } catch (err) {
      console.error('Error deleting creation:', err);
      showToast('Could not delete creation.', 'error');
    }
  };

  const handleRemix = (creation: Creation) => {
    setStudioPrompt(creation.prompt);
    setStudioStyle(creation.style);
    setStudioRatio(creation.aspectRatio);
    setActiveTab('studio');
    showToast(`Loaded "${creation.prompt.slice(0, 32)}..." into Studio!`, 'info');
  };

  const handleUseInspiration = (prompt: string, style: string, aspectRatio: string) => {
    setStudioPrompt(prompt);
    setStudioStyle(style);
    setStudioRatio(aspectRatio);
    setActiveTab('studio');
    showToast('Inspiration loaded into Studio!', 'info');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#090a10] text-slate-100">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl glass-dropdown border border-white/[0.15] shadow-2xl animate-in slide-in-from-bottom-3 duration-200 text-xs font-medium">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />}
          <span className="text-slate-100">{toast.message}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        galleryCount={creations.length}
        stats={stats}
        onOpenZeroCostModal={() => setIsZeroCostModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {activeTab === 'studio' && (
          <Studio
            onCreationSuccess={handleCreationSuccess}
            onLike={handleLike}
            onOpenModal={(c) => setSelectedCreation(c)}
            initialPrompt={studioPrompt}
            initialStyle={studioStyle}
            initialRatio={studioRatio}
          />
        )}

        {activeTab === 'gallery' && (
          <Gallery
            creations={creations}
            onLike={handleLike}
            onDelete={handleDelete}
            onOpenModal={(c) => setSelectedCreation(c)}
            onRemix={handleRemix}
          />
        )}

        {activeTab === 'inspiration' && (
          <InspirationView onUsePrompt={handleUseInspiration} />
        )}

        {activeTab === 'zeroCost' && (
          <ZeroCostGuide onGoToStudio={() => setActiveTab('studio')} />
        )}

      </main>

      {/* Lightbox Modal */}
      <ImageModal
        creation={selectedCreation}
        onClose={() => setSelectedCreation(null)}
        onLike={handleLike}
        onDelete={handleDelete}
        onRemix={handleRemix}
      />

      {/* Zero Cost Info Modal */}
      <ZeroCostModal
        isOpen={isZeroCostModalOpen}
        onClose={() => setIsZeroCostModalOpen(false)}
        onGoToStudio={() => {
          setIsZeroCostModalOpen(false);
          setActiveTab('studio');
        }}
      />

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#07080d] py-6 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">ImagineAI</span>
            <span aria-hidden="true">·</span>
            <span>Zero-Cost Generative Art Studio</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">$0.00 Guaranteed</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px]">FLUX.1 Engine Online</span>
            </span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsZeroCostModalOpen(true)}
              className="hover:text-slate-200 transition text-[11px]"
            >
              How It Stays Free
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
