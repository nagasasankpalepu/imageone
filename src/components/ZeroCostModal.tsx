import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { ZeroCostGuide } from './ZeroCostGuide';

interface ZeroCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToStudio: () => void;
}

export const ZeroCostModal: React.FC<ZeroCostModalProps> = ({
  isOpen,
  onClose,
  onGoToStudio
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="glass-panel border border-white/[0.12] rounded-2xl max-w-4xl w-full p-6 sm:p-8 relative my-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <ZeroCostGuide
          onGoToStudio={() => {
            onClose();
            onGoToStudio();
          }}
        />
      </div>
    </div>
  );
};
