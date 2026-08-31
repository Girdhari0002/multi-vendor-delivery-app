import React, { forwardRef, useId } from 'react';

const Input = forwardRef(({
  label,
  icon,
  error,
  helperText,
  className = '',
  id,
  ...rest
}, ref) => {
  const defaultId = useId();
  const inputId = id || defaultId;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-800">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-orange-500'}
            ${rest.disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}
          `}
          {...rest}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {helperText && !error && <p className="text-sm text-slate-500">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
