import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/formatters';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className={cn(
            'relative w-full rounded-2xl bg-white border border-gold-300 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200',
            maxWidthClasses[maxWidth]
          )}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 px-6 py-4 text-white flex items-center justify-between border-b border-gold-500/30">
            <div>
              <h3 className="font-serif text-lg font-bold tracking-wide text-gold-200">{title}</h3>
              {subtitle && <p className="text-xs text-gold-300/80 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gold-300 hover:text-white hover:bg-navy-700/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};
