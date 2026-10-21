import React, { useState, useEffect } from 'react';
import {
  Wand2,
  Sparkles,
  Shuffle,
  Sliders,
  Download,
  Heart,
  Maximize2,
  Copy,
  Check,
  RotateCw,
  Info,
  Camera,
  Zap,
  Crown,
  Box,
  Film,
  Layers,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Cpu,
  RefreshCw,
  ArrowRight,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Creation } from '../types';
import { SURPRISE_PROMPTS } from '../data/prompts';

interface StudioProps {
  onCreationSuccess: (creation: Creation) => void;
  onLike: (id: string) => void;
  onOpenModal: (creation: Creation) => void;
  initialPrompt?: string;
  initialStyle?: string;
  initialRatio?: string;
}

const STYLES: { id: string; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'photorealistic', label: 'Photorealistic', icon: <Camera className="w-4 h-4 text-emerald-400" />, desc: '35mm photograph, sharp focus, natural daylight, realistic textures' },
  { id: 'anime', label: 'Vibrant Anime', icon: <Sparkles className="w-4 h-4 text-pink-400" />, desc: 'Studio Ghibli aesthetic, luminous colors, delicate line work' },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: <Zap className="w-4 h-4 text-cyan-400" />, desc: 'Neon violet and cyan glow, wet asphalt reflections, high tech' },
  { id: 'fantasy', label: 'High Fantasy', icon: <Crown className="w-4 h-4 text-amber-400" />, desc: 'Celestial starlight, mystical realism, glowing particles' },
  { id: 'minimal', label: 'Minimalist 3D', icon: <Box className="w-4 h-4 text-purple-400" />, desc: 'Clean geometry, frosted glass, balanced negative space' },
  { id: 'cinematic', label: 'Cinematic', icon: <Film className="w-4 h-4 text-rose-400" />, desc: '35mm anamorphic lens, dramatic moody lighting, film grain' },
  { id: 'isometric', label: 'Isometric 3D', icon: <Layers className="w-4 h-4 text-blue-400" />, desc: 'Tilt-shift miniature diorama, cute voxel details' },
];

const RATIOS: { id: string; label: string; aspect: string; previewClass: string }[] = [
  { id: '1:1', label: '1:1', aspect: 'Square (768×768)', previewClass: 'w-6 h-6' },
  { id: '16:9', label: '16:9', aspect: 'Landscape (768×432)', previewClass: 'w-8 h-4.5' },
  { id: '9:16', label: '9:16', aspect: 'Portrait (432×768)', previewClass: 'w-4.5 h-8' },
  { id: '4:3', label: '4:3', aspect: 'Standard (768×576)', previewClass: 'w-7 h-5' },
  { id: '3:2', label: '3:2', aspect: 'Classic Photo (768×512)', previewClass: 'w-7.5 h-5' },
];

const QUICK_STARTERS = [
  'A small brown monkey riding a red bicycle, carrying a bunch of yellow bananas stolen from a fruit shop. An angry shopkeeper runs behind the monkey trying to catch it. Both characters are clearly visible, the bicycle has two correctly formed wheels, the bananas are detailed, and the shop is recognizable. Sharp focus, natural daylight, realistic textures, clear character anatomy, detailed background, cinematic photography',
  'A neon glass terrarium on Mars glowing with bioluminescent blue orchids at night',
  'Ancient Japanese temple floating in clouds with cherry blossom petals swirling in the wind',
  'An ethereal white wolf with starlight eyes walking over a calm frozen lake under northern lights',
  'Futuristic coffee shop in Neo-Seoul during twilight rain, cozy warm amber lights and chrome details'
];

export const Studio: React.FC<StudioProps> = ({
  onCreationSuccess,
  onLike,
  onOpenModal,
  initialPrompt = '',
  initialStyle = 'photorealistic',
  initialRatio = '1:1'
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [style, setStyle] = useState(initialStyle);
  const [aspectRatio, setAspectRatio] = useState(initialRatio);
  const [engine, setEngine] = useState<'gemini' | 'flux'>('flux');
  const [seed, setSeed] = useState<string>('');
  const [useRandomSeed, setUseRandomSeed] = useState(true);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [autoEnhance, setAutoEnhance] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [lastCreation, setLastCreation] = useState<Creation | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [billingNotice, setBillingNotice] = useState<{ message: string; model: string } | null>(null);
  const [zoomMode, setZoomMode] = useState<'fit' | '100%'>('fit');

  // Sync initial props if changed from outside (e.g. remix)
  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
    if (initialStyle) setStyle(initialStyle);
    if (initialRatio) setAspectRatio(initialRatio);
  }, [initialPrompt, initialStyle, initialRatio]);

  // Handle Surprise Me randomizer
  const handleSurpriseMe = () => {
    const randomItem = SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)];
    setPrompt(randomItem.prompt);
    setStyle(randomItem.style);
    setAspectRatio(randomItem.aspectRatio);
    setErrorMsg(null);
    setBillingNotice(null);
  };

  // Handle AI prompt enhancement
  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/prompt/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style })
      });
      const data = await res.json();
      if (data.success && data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      } else {
        setErrorMsg('Could not enhance prompt at this moment.');
      }
    } catch (err) {
      console.error('Enhance error:', err);
      setErrorMsg('Network error while enhancing prompt.');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Main Generate Handler
  const handleGenerate = async (e?: React.FormEvent, overrideEngine?: 'gemini' | 'flux') => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    const activeEngine = overrideEngine || engine;
    if (overrideEngine) setEngine(overrideEngine);

    setErrorMsg(null);
    setBillingNotice(null);
    setIsGenerating(true);
    setImageLoaded(false);
    setGenerationProgress(15);
    setGenerationStep(
      activeEngine === 'gemini'
        ? 'Calling Google Gemini image generation API (gemini-3.1-flash-lite-image)...'
        : 'Connecting to neural diffusion image pipeline...'
    );

    const timer1 = setTimeout(() => {
      setGenerationProgress(45);
      setGenerationStep(
        activeEngine === 'gemini'
          ? 'Synthesizing multimodal image tokens...'
          : 'Synthesizing character subjects and environmental lighting...'
      );
    }, 1500);

    const timer2 = setTimeout(() => {
      setGenerationProgress(75);
      setGenerationStep('Denoising neural layers & encoding high-res image...');
    }, 3200);

    try {
      const numericSeed = !useRandomSeed && seed ? parseInt(seed, 10) : undefined;
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          aspectRatio,
          engine: activeEngine,
          seed: numericSeed,
          negativePrompt: negativePrompt.trim() || undefined,
          autoEnhance
        })
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const result = await res.json();

      if (res.ok && result.success && result.data) {
        setGenerationProgress(90);
        setGenerationStep('Verifying image canvas rendering...');

        // Verify image loads in the browser before showing success
        const img = new Image();
        img.src = result.data.imageUrl;
        img.onload = () => {
          setGenerationProgress(100);
          setGenerationStep('Image ready!');
          setImageLoaded(true);
          setLastCreation(result.data);
          setIsGenerating(false);

          // ONLY trigger success toast after the image is verified and displayed
          onCreationSuccess(result.data);

          try {
            confetti({
              particleCount: 35,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#a855f7', '#06b6d4', '#ec4899']
            });
          } catch {
            // ignore
          }
        };

        img.onerror = () => {
          setIsGenerating(false);
          setErrorMsg('The image was generated by the server, but failed to display in the browser. Please try again.');
        };
      } else {
        setIsGenerating(false);
        if (result.requiresBilling) {
          setBillingNotice({
            message: result.error,
            model: result.model || 'gemini-3.1-flash-lite-image'
          });
        } else {
          setErrorMsg(result.error || 'Failed to generate image. Please try again.');
        }
      }
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsGenerating(false);
      console.error('Generation network error:', err);
      setErrorMsg('Network error connecting to the image generation server.');
    }
  };

  const handleMakeAnother = () => {
    setSeed(String(Math.floor(Math.random() * 1000000)));
    handleGenerate();
  };

  const handleCopyPrompt = () => {
    if (!lastCreation) return;
    navigator.clipboard.writeText(lastCreation.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownload = () => {
    if (!lastCreation) return;
    const link = document.createElement('a');
    link.href = `/api/images/${lastCreation.id}/download?format=png`;
    link.download = `imagineai-${lastCreation.id}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Control Studio Column */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <div className="glass-panel rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <form onSubmit={handleGenerate} className="space-y-5 relative z-10">
            
            {/* Model Engine Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Generation Engine</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  {engine === 'gemini' ? 'Google Gemini 3.1' : 'Neural Diffusion (Free · $0.00)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-1 bg-[#0d0f18] border border-white/[0.08] rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setEngine('flux');
                    setBillingNotice(null);
                    setErrorMsg(null);
                  }}
                  className={`flex flex-col p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                    engine === 'flux'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="text-xs font-bold flex items-center gap-1">
                    <span>Neural Diffusion</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-normal">
                      Free $0.00
                    </span>
                  </span>
                  <span className="text-[10px] opacity-80 truncate">
                    Sharp subjects, no card needed
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEngine('gemini');
                    setBillingNotice(null);
                    setErrorMsg(null);
                  }}
                  className={`flex flex-col p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                    engine === 'gemini'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="text-xs font-bold flex items-center gap-1">
                    <span>Google Gemini</span>
                  </span>
                  <span className="text-[10px] opacity-80 truncate">
                    gemini-3.1-flash-lite-image
                  </span>
                </button>
              </div>
            </div>

            {/* Prompt Header & Actions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Describe Your Vision</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSurpriseMe}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition cursor-pointer"
                    title="Load an inspiring random prompt"
                  >
                    <Shuffle className="w-3 h-3 text-cyan-400" />
                    <span>Surprise Me</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEnhancePrompt}
                    disabled={!prompt.trim() || isEnhancing}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 rounded-lg disabled:opacity-40 transition cursor-pointer"
                    title="Enhance prompt with lighting and texture details"
                  >
                    <Sparkles className={`w-3 h-3 text-purple-400 ${isEnhancing ? 'animate-spin' : ''}`} />
                    <span>{isEnhancing ? 'Enhancing...' : 'Enhance'}</span>
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A small brown monkey riding a red bicycle, carrying a bunch of yellow bananas stolen from a fruit shop..."
                  className="w-full bg-[#0d0f18] border border-white/[0.1] focus:border-purple-500/70 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition resize-none custom-scrollbar leading-relaxed"
                />
                {prompt && (
                  <button
                    type="button"
                    onClick={() => setPrompt('')}
                    className="absolute bottom-3 right-3 text-[11px] text-slate-500 hover:text-slate-300 transition cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Style Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Art Style Preset
                </label>
                <span className="text-[11px] text-slate-400">
                  {STYLES.find((s) => s.id === style)?.desc}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STYLES.map((s) => {
                  const isSelected = style === s.id;
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium text-left transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/15 text-white shadow-sm shadow-purple-500/20'
                          : 'border-white/[0.06] bg-[#0d0f18]/60 text-slate-400 hover:border-white/[0.15] hover:text-slate-200'
                      }`}
                    >
                      <span className="shrink-0">{s.icon}</span>
                      <span className="truncate">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-5 gap-2">
                {RATIOS.map((r) => {
                  const isSelected = aspectRatio === r.id;
                  return (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setAspectRatio(r.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/15 text-white shadow-sm'
                          : 'border-white/[0.06] bg-[#0d0f18]/60 text-slate-400 hover:border-white/[0.15]'
                      }`}
                      title={r.aspect}
                    >
                      <div className="h-9 flex items-center justify-center mb-1">
                        <div
                          className={`border rounded-xs transition-colors ${
                            isSelected ? 'border-purple-400 bg-purple-400/20' : 'border-slate-500 bg-slate-800/40'
                          } ${r.previewClass}`}
                        />
                      </div>
                      <span className="font-semibold text-[11px]">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>Advanced Parameters</span>
                <span className="text-[10px] text-slate-500">
                  {showAdvanced ? '(Click to collapse)' : '(Seed, Negative Prompt)'}
                </span>
              </button>

              {showAdvanced && (
                <div className="mt-3 p-3.5 rounded-xl bg-[#0d0f18]/90 border border-white/[0.06] space-y-3.5 text-xs">
                  {/* Seed Control */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-medium text-slate-400">Seed Value</label>
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useRandomSeed}
                          onChange={(e) => setUseRandomSeed(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-0"
                        />
                        <span>Random Seed</span>
                      </label>
                    </div>
                    {!useRandomSeed && (
                      <input
                        type="number"
                        value={seed}
                        onChange={(e) => setSeed(e.target.value)}
                        placeholder="e.g. 482910"
                        className="w-full bg-[#141724] border border-white/[0.1] rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                      />
                    )}
                  </div>

                  {/* Negative Prompt */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Negative Prompt (Elements to avoid)
                    </label>
                    <input
                      type="text"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="e.g. blur, extra limbs, bad anatomy, low resolution"
                      className="w-full bg-[#141724] border border-white/[0.1] rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error Message if any */}
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Gemini Billing Notice with Alternative */}
            {billingNotice && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-200">
                      Google Gemini Billing Required
                    </h4>
                    <p className="text-[11px] text-amber-300/80 mt-1 leading-relaxed">
                      The <code className="bg-amber-950/40 px-1 py-0.5 rounded text-amber-200">{billingNotice.model}</code> model requires a Google AI Studio project with billing enabled. Free tier accounts have a quota limit of 0 for image generation models.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-500/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleGenerate(undefined, 'flux')}
                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Switch to Free Neural Diffusion & Generate Now</span>
                  </button>
                </div>
              </div>
            )}

            {/* Generate CTA Button */}
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>
                {isGenerating
                  ? 'Generating Real Image...'
                  : `Generate Image (${engine === 'gemini' ? 'Gemini 3.1' : 'Neural Diffusion'}) ✦`}
              </span>
            </button>

          </form>
        </div>

        {/* Quick Prompt Starters Box */}
        <div className="glass-card rounded-xl p-4 border border-white/[0.06]">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Click to Try an Example</span>
          </p>
          <div className="space-y-1.5">
            {QUICK_STARTERS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(s);
                  setErrorMsg(null);
                  setBillingNotice(null);
                }}
                className="w-full text-left p-2 rounded-lg text-xs text-slate-300 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] transition line-clamp-1 cursor-pointer"
              >
                "{s}"
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Render Canvas & Viewport Column */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center min-h-[560px] glass-panel rounded-2xl p-6 relative overflow-hidden">
        
        {/* Loading State */}
        {isGenerating && (
          <div className="w-full max-w-md mx-auto text-center py-16 flex flex-col items-center animate-in fade-in duration-200">
            {/* Glowing orbital spinner */}
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
              <div 
                className="absolute inset-2 rounded-full border-4 border-cyan-500/20 border-b-cyan-400 animate-spin" 
                style={{ animationDirection: 'reverse', animationDuration: '2.5s' }} 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-purple-300 animate-pulse" />
              </div>
            </div>

            <h3 className="text-base font-bold text-white mb-2">Synthesizing Real AI Image</h3>
            <p className="text-xs text-purple-300 mb-4 font-mono">{generationStep}</p>

            {/* Progress bar */}
            <div className="w-full bg-[#121522] h-2 rounded-full overflow-hidden border border-white/[0.08] mb-3">
              <div 
                className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 h-full transition-all duration-500 ease-out"
                style={{ width: `${generationProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between w-full text-[11px] text-slate-500 font-mono">
              <span>Engine: {engine === 'gemini' ? 'Google Gemini' : 'Neural Diffusion'}</span>
              <span>Waiting for server</span>
              <span>{generationProgress}%</span>
            </div>
          </div>
        )}

        {/* Empty State before any generation */}
        {!isGenerating && !lastCreation && (
          <div className="text-center py-20 px-4 max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-5 text-3xl shadow-inner">
              🎨
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Your Creative Canvas Awaits</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Type your idea on the left, pick an art style and aspect ratio, and click{' '}
              <span className="text-purple-400 font-medium">Generate Image</span>.
              The backend connects directly to real image models, validates the data, and renders the image here in true pixel clarity.
            </p>
            <button
              onClick={handleSurpriseMe}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/30 text-purple-300 text-xs font-semibold transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Load an Idea & Start</span>
            </button>
          </div>
        )}

        {/* Active Generated Image Viewport */}
        {!isGenerating && lastCreation && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            
            {/* Image Canvas Container - Sharp pixel rendering with no blur */}
            <div className="relative group max-w-full rounded-2xl overflow-hidden border border-white/[0.1] shadow-2xl bg-[#07080d] flex items-center justify-center">
              
              {/* Image itself with native rendering */}
              <div className={`${zoomMode === '100%' ? 'overflow-auto max-h-[600px] max-w-full p-2' : ''}`}>
                <img
                  src={lastCreation.imageUrl}
                  alt={lastCreation.prompt}
                  style={{
                    imageRendering: 'auto',
                    maxWidth: zoomMode === 'fit' ? '100%' : 'none',
                    maxHeight: zoomMode === 'fit' ? '500px' : 'none',
                  }}
                  className={`w-auto object-contain cursor-pointer transition-transform duration-200 ${
                    zoomMode === 'fit' ? 'hover:scale-[1.01]' : ''
                  }`}
                  onClick={() => onOpenModal(lastCreation)}
                />
              </div>

              {/* Top overlay controls */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <button
                  onClick={() => setZoomMode(zoomMode === 'fit' ? '100%' : 'fit')}
                  className="p-2 rounded-lg bg-black/70 backdrop-blur-md text-white hover:bg-black/90 transition shadow-lg cursor-pointer flex items-center gap-1 text-xs"
                  title={zoomMode === 'fit' ? 'Switch to 100% Native Pixels' : 'Fit to Screen'}
                >
                  {zoomMode === 'fit' ? <ZoomIn className="w-4 h-4" /> : <ZoomOut className="w-4 h-4" />}
                  <span className="text-[10px] hidden sm:inline">{zoomMode === 'fit' ? '100%' : 'Fit'}</span>
                </button>
                <button
                  onClick={() => onOpenModal(lastCreation)}
                  className="p-2 rounded-lg bg-black/70 backdrop-blur-md text-white hover:bg-black/90 transition shadow-lg cursor-pointer"
                  title="Expand Fullscreen Lightbox"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-lg bg-black/70 backdrop-blur-md text-white hover:bg-black/90 transition shadow-lg cursor-pointer"
                  title="Download Image"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom overlay bar */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-center justify-between gap-3 opacity-95 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onLike(lastCreation.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-semibold text-white transition cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 ${lastCreation.likes > 0 ? 'text-pink-500 fill-pink-500' : 'text-white'}`} />
                    <span>{lastCreation.likes}</span>
                  </button>

                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-medium text-white transition cursor-pointer"
                    title="Copy Prompt"
                  >
                    {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPrompt ? 'Copied' : 'Copy Prompt'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMakeAnother}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-semibold text-white transition cursor-pointer"
                    title="Generate another variation with fresh seed"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Make Another</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition shadow-md shadow-purple-600/30 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Image</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Clean metadata strip below image */}
            <div className="w-full max-w-2xl mt-4 px-2">
              <p className="text-xs text-slate-300 italic text-center mb-2.5 line-clamp-2">
                "{lastCreation.prompt}"
              </p>

              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-slate-400 font-mono">
                <span className="capitalize">{lastCreation.style}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-emerald-400 font-semibold">{lastCreation.width}×{lastCreation.height} px</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Ratio {lastCreation.aspectRatio}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Model: {lastCreation.model}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Seed #{lastCreation.seed}</span>
              </div>

              {/* Action buttons below */}
              <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
                <button
                  onClick={handleMakeAnother}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-semibold text-purple-300 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                  <span>Make Another</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Image</span>
                </button>

                <button
                  onClick={() => onOpenModal(lastCreation)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Inspect & Export</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
