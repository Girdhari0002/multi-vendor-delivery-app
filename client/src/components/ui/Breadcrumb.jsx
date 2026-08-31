import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { FaChevronRight, FaHome } from 'react-icons/fa';

/**
 * Breadcrumb Component
 * 
 * @param {Object} props
 * @param {Array<{label: string, to: string}>} props.items - Breadcrumb items
 * @param {string} [props.className] - Additional classes
 */
const Breadcrumb = ({ items, className }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={clsx('flex text-sm text-slate-500', className)}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isHome = item.label.toLowerCase() === 'home';

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <FaChevronRight className="w-3 h-3 mx-2 text-slate-400 flex-shrink-0" />
              )}
              
              {isLast ? (
                <span 
                  className="font-medium text-slate-800 truncate max-w-[150px] sm:max-w-xs block"
                  aria-current="page"
                >
                  {isHome && <FaHome className="inline w-4 h-4 mr-1 mb-1" />}
                  {item.label}
                </span>
              ) : (
                <Link 
                  to={item.to} 
                  className="hover:text-orange-500 transition-colors truncate max-w-[100px] sm:max-w-[200px] block"
                >
                  {isHome ? <FaHome className="inline w-4 h-4" /> : item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
