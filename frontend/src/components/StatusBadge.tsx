import React from 'react';
import { cn } from '../utils/formatters';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getBadgeStyle = (val: string) => {
    switch (val.toUpperCase()) {
      case 'CONFIRMED':
      case 'SIGNED':
      case 'ACCEPTED':
      case 'PAID':
      case 'DONE':
      case 'RESOLVED':
      case 'APPROVED':
      case 'ARRIVED':
      case 'SETTLED':
      case 'CONVERTED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';

      case 'IN_PROGRESS':
      case 'SENT':
      case 'VIEWED':
      case 'CONTACTED':
      case 'MEETING_SCHEDULED':
      case 'PROPOSAL_SENT':
      case 'WORKING':
      case 'PARTIALLY_PAID':
      case 'ISSUED':
      case 'ASSIGNED':
      case 'PARTIAL':
        return 'bg-amber-50 text-amber-700 border-amber-200';

      case 'NEW':
      case 'DRAFT':
      case 'TO_PLAN':
      case 'PENDING':
      case 'EXPECTED':
      case 'REQUESTED':
      case 'SUBMITTED':
      case 'OPEN':
      case 'PENDING_BILLING':
      case 'PENDING_VERIFICATION':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      case 'DELAYED':
      case 'OVERDUE':
      case 'URGENT':
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';

      case 'CANCELLED':
      case 'REJECTED':
      case 'LOST':
      case 'BLOCKED':
      case 'DECLINED':
      case 'CLOSED':
      case 'VOID':
      case 'DISPUTED':
        return 'bg-gray-100 text-gray-600 border-gray-200';

      default:
        return 'bg-gold-50 text-gold-800 border-gold-200';
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase',
        getBadgeStyle(status),
        className
      )}
    >
      {formatText(status)}
    </span>
  );
};
