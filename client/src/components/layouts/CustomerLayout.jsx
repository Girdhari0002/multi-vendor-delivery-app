import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import BottomNav from '../ui/BottomNav';
import { useCart } from '../../context/CartContext';
import { FaHome, FaSearch, FaShoppingCart, FaBox, FaUser } from 'react-icons/fa';

const CustomerLayout = () => {
  const { cartCount } = useCart();

  const navItems = [
    { label: 'Home', path: '/', icon: <FaHome /> },
    { label: 'Search', path: '/search', icon: <FaSearch /> },
    { label: 'Cart', path: '/cart', icon: <FaShoppingCart />, badge: cartCount },
    { label: 'Orders', path: '/orders', icon: <FaBox /> },
    { label: 'Profile', path: '/profile', icon: <FaUser /> }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
      <Footer />
      <BottomNav items={navItems} />
    </div>
  );
};

export default CustomerLayout;
