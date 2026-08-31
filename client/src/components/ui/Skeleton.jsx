import React from 'react';
import clsx from 'clsx';

export const Skeleton = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-slate-200';
  const animationClasses = animation === 'pulse' ? 'animate-pulse' : '';
  
  const variantClasses = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded',
  }[variant];

  const style = {
    width: width || (variant === 'text' ? '100%' : 'auto'),
    height: height || (variant === 'text' ? '1rem' : 'auto'),
  };

  return (
    <div
      className={clsx(baseClasses, animationClasses, variantClasses, className)}
      style={style}
    />
  );
};

export const SkeletonCard = () => (
  <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col gap-4">
    <Skeleton variant="rectangular" height="150px" className="w-full rounded-lg" />
    <div className="flex flex-col gap-2">
      <Skeleton variant="text" width="80%" className="h-5" />
      <Skeleton variant="text" width="60%" className="h-4" />
      <Skeleton variant="text" width="40%" className="h-4" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="w-full border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
    <div className="flex gap-4 p-4 border-b border-slate-200 bg-slate-50">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={`h-${i}`} variant="text" className="flex-1 h-5" />
      ))}
    </div>
    <div className="flex flex-col">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`r-${r}`} className="flex gap-4 p-4 border-b border-slate-100">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={`c-${r}-${c}`} variant="text" className="flex-1 h-4" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonProfile = () => (
  <div className="flex items-center gap-4">
    <Skeleton variant="circular" width="48px" height="48px" />
    <div className="flex flex-col gap-2 flex-1">
      <Skeleton variant="text" width="120px" className="h-4" />
      <Skeleton variant="text" width="160px" className="h-3" />
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="flex flex-col gap-2 w-full">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        variant="text" 
        className="h-4" 
        width={i === lines - 1 ? '60%' : '100%'} 
      />
    ))}
  </div>
);
