import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { FaUser, FaCog, FaSignOutAlt, FaShoppingCart, FaHeart, FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    if (user?.role === 'customer') {
      fetchCartCount();
    }
  }, [user]);

  const fetchCartCount = async () => {
    try {
      const { data } = await api.get('/cart');
      setCartCount(data?.items?.length || 0);
    } catch (error) {
      console.error('Failed to fetch cart count');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    if (showDropdown || showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown, showMobileMenu]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getProfileLink = () => {
    if (user?.role === 'delivery') return '/delivery/dashboard';
    const rolePrefix = user?.role === 'seller' ? 'seller' : user?.role === 'admin' ? 'admin' : 'customer';
    return `/${rolePrefix}/profile`;
  };

  const closeMobileMenu = () => setShowMobileMenu(false);

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="text-xl sm:text-2xl font-bold" style={{ color: '#FF9900' }}>
              DeliveryApp
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                <Link to="/login" className="text-gray-700 hover:text-orange-500 transition font-medium text-sm">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-md text-white transition text-sm" style={{ backgroundColor: '#FF9900' }}>
                  Register
                </Link>
              </>
            ) : (
              <>
                {user.role === 'customer' && (
                  <>
                    <Link to="/" className="text-gray-700 hover:text-orange-500 transition font-medium text-sm">
                      Home
                    </Link>
                    <Link to="/wishlist" className="text-gray-700 hover:text-orange-500 transition font-medium" title="Wishlist">
                      <FaHeart size={18} />
                    </Link>
                    <Link to="/cart" className="relative text-gray-700 hover:text-orange-500 transition font-medium">
                      <FaShoppingCart size={18} />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}
                {user.role === 'seller' && (
                  <>
                    <Link to="/seller/dashboard" className="text-gray-700 hover:text-orange-500 transition font-medium text-sm">
                      Dashboard
                    </Link>
                    <Link to="/seller/products" className="text-gray-700 hover:text-orange-500 transition font-medium text-sm">
                      Products
                    </Link>
                    <Link to="/seller/orders" className="text-gray-700 hover:text-orange-500 transition font-medium text-sm">
                      Orders
                    </Link>
                    <Link to="/seller/payouts" className="text-gray-700 hover:text-orange-500 transition font-medium text-sm">
                      Payouts
                    </Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin/dashboard" className="text-gray-700 hover:text-orange-500 transition font-medium text-sm">
                      Dashboard
                    </Link>
                    <Link to="/admin/users" className="text-gray-700 hover:text-orange-500 transition font-medium text-sm">
                      Users
                    </Link>
                    <Link to="/admin/products" className="text-gray-700 hover:text-orange-500 transition font-medium text-sm">
                      Products
                    </Link>
                    <Link to="/admin/delivery-agents" className="text-gray-700 hover:text-orange-500 transition font-medium text-sm">
                      Delivery Agents
                    </Link>
                    <Link to="/admin/coupons" className="text-gray-700 hover:text-orange-500 transition font-medium text-sm">
                      Coupons
                    </Link>
                  </>
                )}
                {user.role === 'delivery' && (
                  <Link to="/delivery/dashboard" className="text-gray-700 hover:text-orange-500 transition font-medium text-sm">
                    My Deliveries
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative ml-4" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 focus:outline-none group"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 overflow-hidden transition group-hover:shadow-md"
                      style={{ backgroundColor: '#FF9900', borderColor: '#FF9900' }}
                    >
                      {user?.profilePicture ? (
                        <img src={user.profilePicture} alt={user?.name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(user?.name)
                      )}
                    </div>
                    <span className="text-gray-700 hidden sm:inline text-sm font-medium max-w-xs truncate">
                      {user?.name}
                    </span>
                    <FaChevronDown size={12} className="text-gray-600 transition-transform" style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                      </div>

                      <div className="py-2">
                        <Link
                          to={getProfileLink()}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-orange-50 transition text-sm"
                        >
                          <FaUser size={14} className="text-gray-500" />
                          <span>My Profile</span>
                        </Link>

                        {user.role === 'customer' && (
                          <Link
                            to="/customer/orders"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-orange-50 transition text-sm"
                          >
                            <FaShoppingCart size={14} className="text-gray-500" />
                            <span>My Orders</span>
                          </Link>
                        )}

                        {user.role === 'seller' && (
                          <Link
                            to="/seller/products"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-orange-50 transition text-sm"
                          >
                            <FaShoppingCart size={14} className="text-gray-500" />
                            <span>My Products</span>
                          </Link>
                        )}

                        <Link
                          to="/settings"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-orange-50 transition text-sm"
                        >
                          <FaCog size={14} className="text-gray-500" />
                          <span>Settings</span>
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 py-2">
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            logout();
                          }}
                          className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full transition text-sm"
                        >
                          <FaSignOutAlt size={14} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {user?.role === 'customer' && (
              <Link to="/cart" className="relative text-gray-700 hover:text-orange-500 transition">
                <FaShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-gray-700 hover:text-orange-500 transition focus:outline-none"
            >
              {showMobileMenu ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div ref={mobileMenuRef} className="md:hidden bg-white border-t border-gray-200 py-2">
            {!user ? (
              <div className="flex flex-col space-y-2 px-2">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded transition text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="block px-4 py-2 text-white rounded transition text-sm font-medium"
                  style={{ backgroundColor: '#FF9900' }}
                >
                  Register
                </Link>
              </div>
            ) : (
              <>
                {user.role === 'customer' && (
                  <>
                    <Link
                      to="/"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded transition text-sm font-medium"
                    >
                      Home
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded transition text-sm font-medium"
                    >
                      Wishlist
                    </Link>
                  </>
                )}
                {user.role === 'seller' && (
                  <>
                    <Link
                      to="/seller/dashboard"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded transition text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/seller/products"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded transition text-sm font-medium"
                    >
                      Products
                    </Link>
                    <Link
                      to="/seller/orders"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded transition text-sm font-medium"
                    >
                      Orders
                    </Link>
                    <Link
                      to="/seller/payouts"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded transition text-sm font-medium"
                    >
                      Payouts
                    </Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded transition text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/users"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded transition text-sm font-medium"
                    >
                      Users
                    </Link>
                    <Link
                      to="/admin/products"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded transition text-sm font-medium"
                    >
                      Products
                    </Link>
                    <Link
                      to="/admin/delivery-agents"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded transition text-sm font-medium"
                    >
                      Delivery Agents
                    </Link>
                    <Link
                      to="/admin/coupons"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded transition text-sm font-medium"
                    >
                      Coupons
                    </Link>
                  </>
                )}
                {user.role === 'delivery' && (
                  <Link
                    to="/delivery/dashboard"
                    onClick={closeMobileMenu}
                    className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded transition text-sm font-medium"
                  >
                    My Deliveries
                  </Link>
                )}

                <div className="border-t border-gray-100 py-2 px-2">
                  <Link
                    to={getProfileLink()}
                    onClick={closeMobileMenu}
                    className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded transition text-sm font-medium"
                  >
                    My Profile
                  </Link>
                  {user.role === 'customer' && (
                    <Link
                      to="/customer/orders"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded transition text-sm font-medium"
                    >
                      My Orders
                    </Link>
                  )}
                  {user.role === 'seller' && (
                    <Link
                      to="/seller/products"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded transition text-sm font-medium"
                    >
                      My Products
                    </Link>
                  )}
                  <Link
                    to="/settings"
                    onClick={closeMobileMenu}
                    className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded transition text-sm font-medium"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      logout();
                    }}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded transition text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
