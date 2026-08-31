import React from 'react';

const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  onClick,
  ...rest
}) => {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8'
  };

  const isClickable = !!onClick;
  
  const baseClasses = 'bg-white rounded-xl shadow-sm border border-slate-100 transition-all duration-200';
  const hoverClasses = hover || isClickable ? 'hover:shadow-md hover:-translate-y-0.5' : '';
  const clickClasses = isClickable ? 'cursor-pointer active:scale-[0.98]' : '';

  const classes = `${baseClasses} ${hoverClasses} ${clickClasses} ${paddings[padding]} ${className}`;

  return (
    <div className={classes} onClick={onClick} {...rest}>
      {children}
    </div>
  );
};

export default Card;
