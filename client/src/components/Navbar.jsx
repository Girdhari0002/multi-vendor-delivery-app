import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SearchBar from './ui/SearchBar';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import {
  FaTruck, FaBars, FaTimes, FaHome, FaBoxOpen, FaHeart,
  FaShoppingCart, FaUser, FaCog, FaSignOutAlt, FaTachometerAlt,
  FaUsers, FaClipboardList, FaChevronDown
} from 'react-icons/fa';
import clsx from 'clsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (query) => {
    if (query.trim()) {
      navigate(`/?search=${encodeURIComponent(query)}`);
      setIsMobileMenuOpen(false);
    }
  };

  const getProfileLink = () => {
    if (user?.role === 'delivery') return '/delivery';
    if (user?.role === 'seller') return '/seller/profile';
    if (user?.role === 'admin') return '/admin/profile';
    return '/profile';
  };

  const getSettingsLink = () => {
    if (user?.role === 'delivery') return '/delivery/settings';
    if (user?.role === 'seller') return '/seller/settings';
    if (user?.role === 'admin') return '/admin/settings';
    return '/settings';
  };

  const NavLinks = ({ mobile = false }) => {
    const baseClass = clsx(
      "flex items-center gap-2 font-medium transition-colors duration-200",
      mobile ? "text-slate-700 py-3 px-4 hover:bg-orange-50 hover:text-orange-500 rounded-lg text-lg" : "text-slate-600 hover:text-orange-500"
    );

    if (!user) {
      return (
        <>
          <Link to="/login" className={baseClass} onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
          <Link to="/register" className={clsx(baseClass, !mobile && "bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 hover:text-white")} onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
        </>
      );
    }

    return (
      <>
        {user.role === 'customer' && (
          <>
            <Link to="/" className={baseClass} onClick={() => setIsMobileMenuOpen(false)}><FaHome /> Home</Link>
            <Link to="/orders" className={baseClass} onClick={() => setIsMobileMenuOpen(false)}><FaBoxOpen /> Orders</Link>
            <Link to="/wishlist" className={baseClass} onClick={() => setIsMobileMenuOpen(false)}>
              <FaHeart /> Wishlist
            </Link>
            <Link to="/cart" className={baseClass} onClick={() => setIsMobileMenuOpen(false)}>
              <div className="relative">
                <FaShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              {mobile && <span>Cart</span>}
            </Link>
          </>
        )}
        {user.role === 'seller' && (
          <>
            <Link to="/seller" className={baseClass} onClick={() => setIsMobileMenuOpen(false)}><FaTachometerAlt /> Dashboard</Link>
            <Link to="/seller/products" className={baseClass} onClick={() => setIsMobileMenuOpen(false)}><FaBoxOpen /> Products</Link>
            <Link to="/seller/orders" className={baseClass} onClick={() => setIsMobileMenuOpen(false)}><FaClipboardList /> Orders</Link>
          </>
        )}
        {user.role === 'admin' && (
          <>
            <Link to="/admin" className={baseClass} onClick={() => setIsMobileMenuOpen(false)}><FaTachometerAlt /> Dashboard</Link>
            <Link to="/admin/users" className={baseClass} onClick={() => setIsMobileMenuOpen(false)}><FaUsers /> Users</Link>
            <Link to="/admin/orders" className={baseClass} onClick={() => setIsMobileMenuOpen(false)}><FaClipboardList /> Orders</Link>
            <Link to="/admin/products" className={baseClass} onClick={() => setIsMobileMenuOpen(false)}><FaBoxOpen /> Products</Link>
          </>
        )}
        {user.role === 'delivery' && (
          <>
            <Link to="/delivery" className={baseClass} onClick={() => setIsMobileMenuOpen(false)}><FaTachometerAlt /> Dashboard</Link>
          </>
        )}
      </>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-50 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Brand */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-slate-800 hover:text-orange-500 transition-colors">
              <FaTruck className="text-orange-500" />
              <span>QuickCart</span>
            </Link>
          </div>

          {/* Center: Search (Desktop) */}
          {user?.role === 'customer' && (
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <SearchBar onSubmit={handleSearchSubmit} placeholder="Search products..." />
            </div>
          )}

          {/* Right: Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6">
            <NavLinks />
            
            {user && (
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 focus:outline-none hover:text-orange-500 transition-colors"
                >
                  <Avatar name={user.name} size="sm" />
                  <span className="text-sm font-medium text-slate-700 hidden lg:block">{user.name}</span>
                  <FaChevronDown className="text-slate-400 text-xs" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 overflow-hidden">
                    <Link to={getProfileLink()} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-orange-500" onClick={() => setIsProfileOpen(false)}>
                      <FaUser className="text-slate-400" /> My Profile
                    </Link>
                    <Link to={getSettingsLink()} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-orange-500" onClick={() => setIsProfileOpen(false)}>
                      <FaCog className="text-slate-400" /> Settings
                    </Link>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <button onClick={() => { logout(); setIsProfileOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {user?.role === 'customer' && (
              <Link to="/cart" className="relative text-slate-600">
                <FaShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-slate-600 hover:text-orange-500 focus:outline-none"
            >
              <FaBars size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
          
          <div className="relative ml-auto w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <span className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <FaTruck className="text-orange-500" /> Menu
              </span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500 hover:text-red-500">
                <FaTimes size={24} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {user && (
                <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-lg">
                  <Avatar name={user.name} size="md" />
                  <div>
                    <p className="font-medium text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                </div>
              )}

              {user?.role === 'customer' && (
                <div className="mb-6">
                  <SearchBar onSubmit={handleSearchSubmit} placeholder="Search products..." size="md" />
                </div>
              )}

              <div className="flex flex-col space-y-1">
                <NavLinks mobile={true} />
              </div>

              {user && (
                <>
                  <div className="h-px bg-slate-100 my-4"></div>
                  <div className="flex flex-col space-y-1">
                    <Link to={getProfileLink()} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-3 px-4 text-slate-700 hover:bg-slate-50 hover:text-orange-500 rounded-lg font-medium">
                      <FaUser className="text-slate-400" /> My Profile
                    </Link>
                    <Link to={getSettingsLink()} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-3 px-4 text-slate-700 hover:bg-slate-50 hover:text-orange-500 rounded-lg font-medium">
                      <FaCog className="text-slate-400" /> Settings
                    </Link>
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg font-medium w-full text-left">
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
