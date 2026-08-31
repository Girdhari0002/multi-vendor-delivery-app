import React from 'react';
import clsx from 'clsx';
import { FaCheck } from 'react-icons/fa';

/**
 * StepProgress Component
 * 
 * @param {Object} props
 * @param {Array<{label: string, description?: string, timestamp?: string, icon?: React.ReactNode, completed?: boolean, active?: boolean}>} props.steps - Steps array
 * @param {'horizontal'|'vertical'} [props.orientation='horizontal'] - Orientation
 * @param {string} [props.className] - Additional classes
 */
const StepProgress = ({ steps, orientation = 'horizontal', className }) => {
  if (!steps || steps.length === 0) return null;

  const isVertical = orientation === 'vertical';

  return (
    <div className={clsx('w-full', className)}>
      <div className={clsx(
        'flex',
        isVertical ? 'flex-col' : 'flex-row items-start justify-between'
      )}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const { completed, active, label, description, timestamp, icon } = step;
          
          return (
            <div 
              key={index} 
              className={clsx(
                'relative flex',
                isVertical ? 'flex-row pb-10 last:pb-0' : 'flex-col items-center flex-1'
              )}
            >
              {/* Connector Line */}
              {!isLast && (
                <div 
                  className={clsx(
                    'absolute transition-colors duration-300',
                    isVertical 
                      ? 'left-5 top-10 bottom-0 w-0.5 -ml-px' 
                      : 'top-5 left-1/2 right-0 w-full h-0.5 -mt-px ml-6',
                    completed ? 'bg-emerald-500' : 'bg-slate-200'
                  )}
                />
              )}

              {/* Step Circle & Icon */}
              <div className={clsx(
                'relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 bg-white flex-shrink-0',
                completed 
                  ? 'border-emerald-500 bg-emerald-500 text-white' 
                  : active 
                    ? 'border-orange-500 text-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.2)]'
                    : 'border-slate-300 text-slate-400'
              )}>
                {completed ? (
                  <FaCheck className="w-4 h-4" />
                ) : (
                  icon ? icon : <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Step Content */}
              <div className={clsx(
                'flex flex-col',
                isVertical ? 'ml-4 pt-2' : 'mt-3 items-center text-center px-2'
              )}>
                <h4 className={clsx(
                  'text-sm font-semibold transition-colors duration-300',
                  active ? 'text-slate-800' : completed ? 'text-slate-700' : 'text-slate-500'
                )}>
                  {label}
                </h4>
                
                {description && (
                  <p className={clsx(
                    'text-xs mt-1 max-w-[200px]',
                    active ? 'text-slate-600' : 'text-slate-400'
                  )}>
                    {description}
                  </p>
                )}
                
                {timestamp && (
                  <span className="text-[11px] text-slate-400 mt-1 font-medium">
                    {timestamp}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgress;
