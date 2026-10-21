import React, { useEffect, useState } from 'react';
import {
  X,
  Heart,
  Download,
  Copy,
  Check,
  Wand2,
  Trash2,
  ExternalLink,
  Layers,
  Sparkles,
  Calendar,
  ShieldCheck,
  FileImage,
  Loader2
} from 'lucide-react';
import { Creation } from '../types';

interface ImageModalProps {
  creation: Creation | null;
  onClose: () => void;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  onRemix: (creation: Creation) => void;
}

type ImageFormat = 'png' | 'webp' | 'jpg';

interface FormatInfo {
  id: ImageFormat;
  label: string;
  ext: string;
  mime: string;
  desc: string;
}

const FORMATS: FormatInfo[] = [
  { id: 'png', label: 'PNG', ext: '.png', mime: 'image/png', desc: 'Lossless quality, sharp details' },
  { id: 'webp', label: 'WebP', ext: '.webp', mime: 'image/webp', desc: 'Modern web, smallest file size' },
  { id: 'jpg', label: 'JPG', ext: '.jpg', mime: 'image/jpeg', desc: 'Universal compatibility' }
];

export const ImageModal: React.FC<ImageModalProps> = ({
  creation,
  onClose,
  onLike,
  onDelete,
  onRemix
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showEnhanced, setShowEnhanced] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ImageFormat>('png');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!creation) return null;

  const handleCopyPrompt = () => {
    const textToCopy = showEnhanced && creation.enhancedPrompt ? creation.enhancedPrompt : creation.prompt;
    navigator.clipboard.writeText(textToCopy);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(creation.imageUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const downloadImageInFormat = async (format: ImageFormat) => {
    if (!creation || isDownloading) return;
    setIsDownloading(true);
    setDownloadStatus(`Preparing ${format.toUpperCase()}...`);

    try {
      // 1. Client-side canvas conversion for crisp direct pixel extraction
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = creation.imageUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || creation.width;
      canvas.height = img.naturalHeight || creation.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('2D context not available');

      ctx.drawImage(img, 0, 0);

      const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
      const quality = format === 'png' ? undefined : 0.95;

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, mimeType, quality);
      });

      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `imagineai-${creation.id}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        setDownloadStatus(`Exported as .${format.toUpperCase()}`);
      } else {
        throw new Error('Canvas toBlob failed');
      }
    } catch (err) {
      console.warn('Canvas conversion failed, falling back to server endpoint:', err);
      // 2. Server-side proxy fallback
      const link = document.createElement('a');
      link.href = `/api/images/${creation.id}/download?format=${format}`;
      link.download = `imagineai-${creation.id}.${format}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadStatus(`Exported as .${format.toUpperCase()}`);
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadStatus(null), 3000);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this creation from the database?')) {
      onDelete(creation.id);
      onClose();
    }
  };

  const currentFormatMeta = FORMATS.find((f) => f.id === selectedFormat);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="glass-panel border border-white/[0.12] rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white transition cursor-pointer"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Large Image Canvas */}
        <div className="flex-1 bg-[#07080d] flex items-center justify-center p-4 min-h-[300px] md:min-h-[550px] overflow-hidden relative">
          <img
            src={creation.imageUrl}
            alt={creation.prompt}
            style={{ imageRendering: 'auto' }}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Right Side: Metadata & Actions */}
        <div className="w-full md:w-80 lg:w-96 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/[0.08] bg-[#0d0f18]/95 overflow-y-auto custom-scrollbar">
          
          <div className="space-y-5">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs text-purple-400 font-semibold uppercase tracking-wider mb-1">
                <span>{creation.style} Style</span>
                <span className="text-emerald-400 font-normal capitalize">{creation.model || 'Neural Diffusion'}</span>
              </div>
              <h2 className="text-sm font-bold text-white">Creation Details</h2>
            </div>

            {/* Prompt View with Toggle for Enhanced */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase text-[10px] tracking-wider">Prompt</span>
                {creation.enhancedPrompt && creation.enhancedPrompt !== creation.prompt && (
                  <button
                    onClick={() => setShowEnhanced(!showEnhanced)}
                    className="text-[11px] text-purple-400 hover:text-purple-300 transition"
                  >
                    {showEnhanced ? 'Show Original' : 'Show Enhanced'}
                  </button>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-[#141724] border border-white/[0.06] text-xs text-slate-200 leading-relaxed max-h-36 overflow-y-auto custom-scrollbar font-sans">
                {showEnhanced && creation.enhancedPrompt ? creation.enhancedPrompt : creation.prompt}
              </div>

              <button
                onClick={handleCopyPrompt}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 transition cursor-pointer"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPrompt ? 'Prompt Copied to Clipboard' : 'Copy Prompt'}</span>
              </button>
            </div>

            {/* Technical Metadata (Clean Unboxed Grid) */}
            <div className="pt-3 border-t border-white/[0.06] space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
                <span className="text-slate-500">Dimensions</span>
                <span className="font-mono">{creation.width} × {creation.height} px</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
                <span className="text-slate-500">Aspect Ratio</span>
                <span className="font-mono">{creation.aspectRatio}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
                <span className="text-slate-500">Seed</span>
                <span className="font-mono">#{creation.seed}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
                <span className="text-slate-500">Model</span>
                <span className="font-mono capitalize">{creation.model || 'FLUX.1'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/[0.03]">
                <span className="text-slate-500">Created</span>
                <span>{new Date(creation.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Billing Cost</span>
                <span className="text-emerald-400 font-semibold">$0.00 (Zero-Cost)</span>
              </div>
            </div>

          </div>

          {/* Action Dock */}
          <div className="space-y-3 pt-5 border-t border-white/[0.08] mt-4">
            
            {/* Like and Remix Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onLike(creation.id)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${creation.likes > 0 ? 'text-pink-500 fill-pink-500' : 'text-slate-400'}`} />
                <span>{creation.likes} Upvotes</span>
              </button>

              <button
                onClick={() => {
                  onRemix(creation);
                  onClose();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-semibold text-purple-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Wand2 className="w-4 h-4" />
                <span>Remix</span>
              </button>
            </div>

            {/* Download Format Selection */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <FileImage className="w-3 h-3 text-purple-400" />
                  <span>Choose Format</span>
                </span>
                <span className="text-[10px] text-slate-400 italic">
                  {currentFormatMeta?.desc}
                </span>
              </div>

              {/* Segmented Format Switcher */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#141724] border border-white/[0.08] rounded-xl">
                {FORMATS.map((f) => {
                  const isSelected = selectedFormat === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFormat(f.id)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold uppercase transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Action Download Button */}
            <button
              onClick={() => downloadImageInFormat(selectedFormat)}
              disabled={isDownloading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition disabled:opacity-50 cursor-pointer active:scale-[0.99]"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>
                {isDownloading
                  ? downloadStatus || 'Converting & Exporting...'
                  : `Download as .${selectedFormat.toUpperCase()} HD`}
              </span>
            </button>

            {/* Quick 1-click format chips for power users */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-0.5">
              <span>Quick Save:</span>
              <div className="flex items-center gap-2">
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => downloadImageInFormat(f.id)}
                    disabled={isDownloading}
                    className="text-purple-400 hover:text-purple-300 font-mono underline decoration-dotted transition disabled:opacity-40"
                    title={`Instantly download as ${f.label}`}
                  >
                    {f.ext}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Status */}
            {downloadStatus && !isDownloading && (
              <div className="text-center text-[11px] text-emerald-400 font-medium animate-in fade-in">
                ✓ {downloadStatus}
              </div>
            )}

            {/* Bottom auxiliary links */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px] text-slate-500">
              <button
                onClick={handleCopyUrl}
                className="hover:text-slate-300 transition flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink className="w-3 h-3" />
                <span>{copiedUrl ? 'URL Copied!' : 'Copy Direct URL'}</span>
              </button>

              <button
                onClick={handleDelete}
                className="text-rose-400 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer"
                title="Delete creation"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
