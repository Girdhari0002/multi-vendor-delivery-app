import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Sidebar from '../ui/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { 
  FaTachometerAlt, 
  FaBox, 
  FaPlus, 
  FaShoppingBag, 
  FaMoneyBillWave, 
  FaStore, 
  FaCog,
  FaBars,
  FaSignOutAlt
} from 'react-icons/fa';

const SellerLayout = ({ title }) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sellerSidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sellerSidebarCollapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const sidebarItems = [
    { label: 'Dashboard', path: '/seller', icon: <FaTachometerAlt /> },
    { 
      label: 'Products', 
      path: '/seller/products', 
      icon: <FaBox />,
      subItems: [
        { label: 'All Products', path: '/seller/products' },
        { label: 'Add Product', path: '/seller/products/add' }
      ]
    },
    { label: 'Orders', path: '/seller/orders', icon: <FaShoppingBag /> },
    { label: 'Payouts', path: '/seller/payouts', icon: <FaMoneyBillWave /> },
    { label: 'Store Profile', path: '/seller/profile', icon: <FaStore /> },
    { label: 'Settings', path: '/seller/settings', icon: <FaCog /> }
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar 
          header="Seller Portal" 
          headerIcon={<FaStore />}
          items={sidebarItems}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          user={user}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-50">
            <Sidebar 
              header="Seller Portal" 
              headerIcon={<FaStore />}
              items={sidebarItems}
              collapsed={false}
              user={user}
              onItemClick={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex items-center">
            <button 
              className="md:hidden p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 mr-3"
              onClick={() => setMobileOpen(true)}
            >
              <FaBars />
            </button>
            <h1 className="text-xl font-semibold text-slate-800">{title || 'Seller Portal'}</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-slate-900">{user?.name || 'Seller'}</span>
              <span className="text-xs text-slate-500">{user?.email}</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <FaSignOutAlt size={18} />
            </button>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
