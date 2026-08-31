import React from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

/**
 * BottomNav Component (Mobile only)
 * 
 * @param {Object} props
 * @param {Array<{key: string, label: string, icon: React.ReactNode, to: string, badge?: number|boolean}>} props.items - Navigation items (max 5)
 * @param {string} [props.className] - Additional classes
 */
const BottomNav = ({ items, className }) => {
  if (!items || items.length === 0) return null;
  
  // Truncate items to max 5 to fit bottom nav nicely
  const navItems = items.slice(0, 5);

  return (
    <div className={clsx(
      'fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe',
      className
    )}>
      <nav className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            className={({ isActive }) => clsx(
              'relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
              isActive ? 'text-orange-500' : 'text-slate-500 hover:text-slate-800'
            )}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <span className={clsx('text-xl', isActive ? 'animate-bounce' : '')}>
                    {item.icon}
                  </span>
                  
                  {/* Badge */}
                  {item.badge !== undefined && item.badge !== false && (
                    <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge === true ? '' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium leading-none">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Tailwind config needs pb-safe for notch devices or add it here */}
      <style>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
};

export default BottomNav;
