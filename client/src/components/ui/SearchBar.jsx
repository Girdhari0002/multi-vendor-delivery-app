import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { FaSearch, FaTimes } from 'react-icons/fa';

const SearchBar = ({
  value = '',
  onChange,
  onSubmit,
  placeholder = 'Search...',
  suggestions = [],
  onSuggestionClick,
  className,
  size = 'md',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  const sizeClasses = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2.5 px-4 text-base',
    lg: 'py-3.5 px-5 text-lg',
  };

  const iconSizes = { sm: 14, md: 16, lg: 20 };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value && isFocused && suggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [value, isFocused, suggestions]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit(value);
      setShowSuggestions(false);
    }
    if (e.key === 'Escape') {
      if (onChange) onChange('');
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    if (onChange) onChange('');
    if (onSubmit) onSubmit('');
  };

  return (
    <div ref={wrapperRef} className={clsx('relative w-full', className)}>
      <div 
        className={clsx(
          'relative flex items-center w-full bg-white border rounded-full transition-all duration-300 overflow-hidden',
          isFocused ? 'border-orange-500 shadow-md ring-2 ring-orange-100' : 'border-slate-300 hover:border-slate-400'
        )}
      >
        <span className="pl-4 text-slate-400">
          <FaSearch size={iconSizes[size]} />
        </span>
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={clsx(
            'w-full bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-400',
            sizeClasses[size]
          )}
        />
        
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="pr-4 text-slate-400 hover:text-slate-600 focus:outline-none"
            aria-label="Clear search"
          >
            <FaTimes size={iconSizes[size]} />
          </button>
        )}
      </div>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50">
          <ul className="max-h-60 overflow-y-auto py-2">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onMouseDown={() => {
                  if (onSuggestionClick) onSuggestionClick(suggestion);
                  else if (onChange) onChange(suggestion.label || suggestion);
                  setShowSuggestions(false);
                }}
                className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-slate-700 text-sm transition-colors flex items-center gap-2"
              >
                <FaSearch className="text-slate-400" size={12} />
                {suggestion.label || suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
