import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Cpu,
  Database,
  Lock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ZeroCostGuideProps {
  onGoToStudio?: () => void;
}

export const ZeroCostGuide: React.FC<ZeroCostGuideProps> = ({ onGoToStudio }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Hero Guarantee Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden border border-emerald-500/25">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official Zero-Spending Guarantee</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Pure Creative Freedom. Exactly $0.00 Cost.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            ImagineAI is architected from the ground up to eliminate all billing surprises.
            You do not need to register credit cards, purchase tokens, or risk surprise cloud bills.
            Every generation is free, unlimited, and persistent.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {onGoToStudio && (
              <button
                onClick={onGoToStudio}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                <span>Start Creating in Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3 Pillars of Zero Unexpected Spending */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Pillar 1 */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">FLUX.1 Neural Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Powered by Pollinations AI's community FLUX endpoint. Generates real, full-resolution AI imagery without requiring OpenAI, Midjourney, or Stable Diffusion API credits.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>No API key required</span>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Self-Contained Storage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              All image metadata, like counts, and prompt history are persisted directly in a local fast database. No external Supabase, AWS, or cloud database meter ticking.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Zero database host fees</span>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Safe Prompt Enhancement</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Prompt enhancement utilizes Gemini 2.5/3.8 Flash or procedural stylistic templates. There are zero paid model calls and no credit card holds.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>No unexpected charge risk</span>
          </div>
        </div>

      </div>

      {/* Comparison Table */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-white mb-4">
          Cost Architecture Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Component</th>
                <th className="pb-3 font-semibold">Typical Commercial Tools</th>
                <th className="pb-3 font-semibold text-emerald-400">ImagineAI Architecture</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              <tr>
                <td className="py-3 font-medium text-white">Image Generation</td>
                <td className="py-3 text-rose-400">$0.04 - $0.12 per image</td>
                <td className="py-3 text-emerald-400 font-bold">$0.00 (FLUX Open Cluster)</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Database Hosting</td>
                <td className="py-3 text-rose-400">$15 - $25 / month</td>
                <td className="py-3 text-emerald-400 font-bold">$0.00 (Local Persistent DB)</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Prompt Expansion</td>
                <td className="py-3 text-rose-400">Paid LLM tokens</td>
                <td className="py-3 text-emerald-400 font-bold">$0.00 (Free Tier / Procedural)</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Payment Info Needed</td>
                <td className="py-3 text-rose-400">Required Credit Card</td>
                <td className="py-3 text-emerald-400 font-bold">Never Required</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
