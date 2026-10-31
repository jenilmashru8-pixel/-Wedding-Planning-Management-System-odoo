import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  actionLabel,
  onAction,
}) => {
  const displayAction = actionText || actionLabel;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-gold-200/60 shadow-sm my-6">
      <div className="w-16 h-16 rounded-2xl bg-gold-50 border border-gold-300 flex items-center justify-center text-burgundy-700 mb-4 shadow-sm">
        <Icon className="w-8 h-8 text-gold-600" />
      </div>
      <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-1">{title}</h3>
      <p className="text-sm text-charcoal-500 max-w-sm mb-6">{description}</p>
      {displayAction && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-burgundy-700 hover:bg-burgundy-800 text-gold-200 hover:text-white rounded-xl text-sm font-semibold shadow-md transition-all flex items-center gap-2"
        >
          {displayAction}
        </button>
      )}
    </div>
  );
};
export default EmptyState;
