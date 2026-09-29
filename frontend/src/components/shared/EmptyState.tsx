import React from 'react';
import { ClipboardCheck } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="inline-flex p-4 rounded-full bg-slate-100 text-slate-400 mb-4">
        <ClipboardCheck className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">{description}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
};
