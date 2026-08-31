import React from 'react';
import clsx from 'clsx';
import { FaBoxOpen } from 'react-icons/fa';

const EmptyState = ({
  icon: Icon = FaBoxOpen,
  title = 'No Data Found',
  description = 'There is nothing to display at this time.',
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-6 text-orange-500">
        <Icon size={32} />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
