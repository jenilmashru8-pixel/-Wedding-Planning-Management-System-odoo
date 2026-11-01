import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../utils/formatters';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  highlight?: boolean;
  variant?: 'default' | 'gold' | 'navy' | 'charcoal' | string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  description,
  icon: Icon,
  trend,
  trendType = 'neutral',
  highlight = false,
  variant = 'default',
}) => {
  const displaySubtitle = subtitle || description;

  const variantStyles = {
    gold: 'border-gold-300 bg-gradient-to-br from-white via-gold-50/20 to-gold-100/30',
    navy: 'border-navy-300 bg-gradient-to-br from-white via-blue-50/20 to-navy-50/30',
    charcoal: 'border-charcoal-200 bg-gradient-to-br from-white via-charcoal-50/20 to-ivory-100',
    default: 'border-gold-200/80 bg-white',
  }[variant] || 'border-gold-200/80 bg-white';

  const iconBgStyles = {
    gold: 'bg-gold-500/10 text-gold-700 border-gold-400/30',
    navy: 'bg-navy-900 text-gold-300 border-gold-500/30 shadow-sm',
    charcoal: 'bg-charcoal-900 text-gold-300 border-charcoal-700 shadow-sm',
    default: 'bg-gold-50 text-navy-800 border-gold-200',
  }[variant] || 'bg-gold-50 text-navy-800 border-gold-200';

  return (
    <div
      className={cn(
        'card-luxury p-5 rounded-2xl relative overflow-hidden transition-all border shadow-sm hover:shadow-md',
        variantStyles,
        highlight && 'border-gold-400 bg-gradient-to-br from-white to-gold-50/30'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-bold font-serif text-charcoal-900 tracking-tight">{value}</h3>
          {displaySubtitle && <p className="text-xs text-charcoal-500 mt-1">{displaySubtitle}</p>}
        </div>
        <div className={cn('p-3 rounded-xl border flex items-center justify-center shrink-0', iconBgStyles)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-charcoal-100 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'font-semibold px-1.5 py-0.5 rounded',
              trendType === 'positive' && 'text-emerald-700 bg-emerald-50',
              trendType === 'negative' && 'text-rose-700 bg-rose-50',
              trendType === 'neutral' && 'text-charcoal-600 bg-charcoal-100'
            )}
          >
            {trend}
          </span>
          <span className="text-charcoal-400">vs target/season</span>
        </div>
      )}
    </div>
  );
};
export default MetricCard;
