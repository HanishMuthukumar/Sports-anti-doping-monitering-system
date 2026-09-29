import React from 'react';

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getBadgeStyle = (val: string) => {
    switch (val?.toUpperCase()) {
      case 'POSITIVE':
      case 'SUSPENDED':
      case 'CANCELLED':
      case 'INVALID':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'NEGATIVE':
      case 'COMPLETED':
      case 'ACTIVE':
      case 'CLOSED':
      case 'ANALYZED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'UNDER_REVIEW':
      case 'UNDER_ANALYSIS':
      case 'ACTION_TAKEN':
      case 'INCONCLUSIVE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'SCHEDULED':
      case 'SUBMITTED':
      case 'RECEIVED':
      case 'SAMPLE_SUBMITTED':
      case 'SAMPLE_COLLECTED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OPEN':
      case 'COLLECTED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatText = (val: string) => {
    return val?.replace(/_/g, ' ') || 'UNKNOWN';
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(
        status
      )}`}
    >
      {formatText(status)}
    </span>
  );
};
