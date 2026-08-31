import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaSignOutAlt, FaTruck } from 'react-icons/fa';

const DeliveryLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2 text-orange-600">
              <FaTruck className="h-6 w-6" />
              <span className="font-bold text-lg md:text-xl text-slate-900">QuickCart Delivery</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block">
                  {user?.name || 'Delivery Agent'}
                </span>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-slate-500 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <FaSignOutAlt className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DeliveryLayout;
