import React from 'react';
import clsx from 'clsx';

/**
 * Tabs Component
 * 
 * @param {Object} props
 * @param {Array<{key: string|number, label: string, count?: number, icon?: React.ReactNode}>} props.tabs - Tab items
 * @param {string|number} props.activeTab - Currently active tab key
 * @param {Function} props.onChange - Called with the new tab key when clicked
 * @param {'underline'|'pills'} [props.variant='underline'] - Visual style of tabs
 * @param {string} [props.className] - Additional classes
 */
const Tabs = ({ tabs, activeTab, onChange, variant = 'underline', className }) => {
  if (!tabs || tabs.length === 0) return null;

  const isUnderline = variant === 'underline';
  const isPills = variant === 'pills';

  return (
    <div className={clsx('w-full', className)}>
      <div className={clsx(
        'flex overflow-x-auto hide-scrollbar whitespace-nowrap',
        isUnderline ? 'border-b border-slate-200' : 'gap-2'
      )}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              type="button"
              className={clsx(
                'flex items-center justify-center font-medium transition-colors focus:outline-none',
                // Underline variant styles
                isUnderline && [
                  'px-4 py-3 border-b-2',
                  isActive 
                    ? 'border-orange-500 text-orange-500' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                ],
                // Pills variant styles
                isPills && [
                  'px-4 py-2 rounded-full text-sm',
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                ]
              )}
            >
              {tab.icon && (
                <span className="mr-2">
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              
              {tab.count !== undefined && (
                <span className={clsx(
                  'ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs rounded-full',
                  isActive
                    ? (isPills ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600')
                    : 'bg-slate-100 text-slate-500'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Add this global style if it doesn't exist elsewhere to hide scrollbars while allowing scroll */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Tabs;
