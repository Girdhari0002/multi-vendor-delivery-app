import React from 'react';
import clsx from 'clsx';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const colorStyles = {
  primary: {
    bg: 'bg-orange-50',
    text: 'text-orange-500',
    iconBg: 'bg-orange-100',
  },
  success: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-500',
    iconBg: 'bg-emerald-100',
  },
  warning: {
    bg: 'bg-amber-50',
    text: 'text-amber-500',
    iconBg: 'bg-amber-100',
  },
  danger: {
    bg: 'bg-red-50',
    text: 'text-red-500',
    iconBg: 'bg-red-100',
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-500',
    iconBg: 'bg-blue-100',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-500',
    iconBg: 'bg-purple-100',
  },
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'primary',
  className,
}) => {
  const styles = colorStyles[color] || colorStyles.primary;
  const isPositive = trend !== undefined && trend >= 0;
  const TrendIcon = isPositive ? FaArrowUp : FaArrowDown;

  return (
    <div
      className={clsx(
        'rounded-xl p-6 transition-all duration-200 hover:shadow-md',
        styles.bg,
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        {Icon && (
          <div
            className={clsx(
              'w-10 h-10 rounded-full flex items-center justify-center',
              styles.iconBg,
              styles.text
            )}
          >
            <Icon size={20} />
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        
        {trend !== undefined && (
          <div className="flex items-center gap-2 mt-2">
            <div
              className={clsx(
                'flex items-center text-xs font-semibold px-2 py-1 rounded-full',
                isPositive
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              )}
            >
              <TrendIcon size={10} className="mr-1" />
              {Math.abs(trend)}%
            </div>
            {trendLabel && (
              <span className="text-xs text-slate-500">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
