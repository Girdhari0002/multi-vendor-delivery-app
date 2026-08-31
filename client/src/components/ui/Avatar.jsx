import React from 'react';
import clsx from 'clsx';

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-xl'
};

const dotSizeClasses = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4 h-4'
};

const colors = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500',
  'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500',
  'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];

/**
 * Generates a color class based on a string (name)
 * @param {string} name 
 * @returns {string} Tailwind background color class
 */
const getColorFromName = (name) => {
  if (!name) return 'bg-slate-300';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Extracts initials from a name (first letter of first and last name)
 * @param {string} name 
 * @returns {string}
 */
const getInitials = (name) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * User Avatar Component
 * 
 * @param {Object} props
 * @param {string} [props.src] - Image URL
 * @param {string} [props.name] - Name for initials fallback and color generation
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md'] - Avatar size
 * @param {boolean} [props.online] - Whether to show the online green dot
 * @param {string} [props.className] - Additional classes
 */
const Avatar = ({ src, name, size = 'md', online, className }) => {
  const sClass = sizeClasses[size] || sizeClasses.md;
  const dClass = dotSizeClasses[size] || dotSizeClasses.md;
  
  return (
    <div className={clsx('relative inline-flex flex-shrink-0 rounded-full', sClass, className)}>
      {src ? (
        <img 
          src={src} 
          alt={name || 'Avatar'} 
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <div 
          className={clsx(
            'flex items-center justify-center w-full h-full rounded-full text-white font-medium',
            getColorFromName(name)
          )}
        >
          {getInitials(name)}
        </div>
      )}
      
      {online && (
        <span 
          className={clsx(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-white bg-emerald-500',
            dClass
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
