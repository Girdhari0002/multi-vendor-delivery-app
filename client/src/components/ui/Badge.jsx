import React from 'react';

const Badge = ({
  variant = 'neutral',
  children,
  size = 'md',
  dot = false,
  className = '',
  ...rest
}) => {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-orange-50 text-orange-700 border-orange-200'
  };

  const dotColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-slate-500',
    primary: 'bg-orange-500'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };

  const classes = `inline-flex items-center justify-center rounded-full border font-medium ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <span className={classes} {...rest}>
      {dot && (
        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} aria-hidden="true" />
      )}
      {children}
    </span>
  );
};

export default Badge;
