import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Avatar from './Avatar'; // Assuming Avatar is in the same folder

const NavItem = ({ item, collapsed, depth = 0, onItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const hasChildren = item.subItems && item.subItems.length > 0;

  // Check if active or if any child is active
  const isActive = location.pathname === item.path ||
    (hasChildren && item.subItems.some(child => location.pathname === child.path));

  const content = (
    <div className={clsx(
      'flex items-center px-4 py-3 cursor-pointer transition-colors group',
      isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white',
      depth > 0 && !collapsed ? 'pl-10 py-2' : ''
    )}>
      {item.icon && (
        <span className={clsx(
          'text-lg transition-colors',
          isActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-white',
          collapsed ? 'mx-auto' : 'mr-4'
        )}>
          {item.icon}
        </span>
      )}
      
      {!collapsed && (
        <div className="flex-1 flex justify-between items-center whitespace-nowrap overflow-hidden">
          <span className="font-medium text-sm">{item.label}</span>
          
          <div className="flex items-center space-x-2">
            {item.badge !== undefined && (
              <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
            
            {hasChildren && (
              <span className="text-slate-500 ml-2 text-xs">
                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (hasChildren) {
    return (
      <div>
        <div onClick={() => setIsOpen(!isOpen)}>{content}</div>
        {!collapsed && isOpen && (
          <div className="bg-slate-900/50 py-1">
            {item.subItems.map(child => (
              <NavLink
                key={child.path}
                to={child.path}
                onClick={onItemClick}
                className={({ isActive }) => clsx(
                  'block px-10 py-2 text-sm transition-colors',
                  isActive ? 'text-orange-500 font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink to={item.path} end={item.path === '/'} onClick={onItemClick}>
      {content}
    </NavLink>
  );
};

/**
 * Sidebar Component
 * 
 * @param {Object} props
 * @param {Array<Object>} props.items - Navigation items array
 * @param {React.ReactNode|string} props.header - Header element
 * @param {boolean} props.collapsed - Collapsed state
 * @param {Function} props.onToggle - Toggle function
 * @param {string} [props.className] - Additional classes
 */
const Sidebar = ({ items, header, collapsed, onToggle, className, user, onItemClick }) => {
  return (
    <div 
      className={clsx(
        'flex flex-col h-screen sticky top-0 bg-slate-900 text-white shadow-xl transition-all duration-300 z-40',
        collapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Header / Logo */}
      <div className={clsx(
        'flex items-center h-16 px-4 border-b border-slate-800',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <div className="font-bold text-xl text-white truncate flex-1">
            {header || 'DeliveryApp'}
          </div>
        )}
        
        <button 
          onClick={onToggle}
          className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white focus:outline-none transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-4 hide-scrollbar custom-scrollbar">
        <nav className="space-y-1">
          {items?.map((item) => (
            <NavItem key={item.path} item={item} collapsed={collapsed} onItemClick={onItemClick} />
          ))}
        </nav>
      </div>

      {/* User Profile Mini Card */}
      <div className="border-t border-slate-800 p-4">
        <div className={clsx(
          'flex items-center',
          collapsed ? 'justify-center' : 'space-x-3'
        )}>
          <Avatar
            name={user?.name || 'User'}
            size="sm"
            online={true}
            className="ring-2 ring-slate-800"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.email || ''}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155; /* slate-700 */
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569; /* slate-600 */
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
