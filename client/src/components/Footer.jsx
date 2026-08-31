import React from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white hover:text-orange-400 transition-colors">
              <FaTruck className="text-orange-500" />
              <span>QuickCart</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Delivering happiness to your doorstep. The fastest, most reliable delivery service for all your daily needs.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-slate-400 hover:text-orange-400 transition-colors" aria-label="Facebook">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-orange-400 transition-colors" aria-label="Twitter">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-orange-400 transition-colors" aria-label="Instagram">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-orange-400 transition-colors" aria-label="LinkedIn">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm text-slate-400 hover:text-orange-400 transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-sm text-slate-400 hover:text-orange-400 transition-colors">Products</Link></li>
              <li><Link to="/about" className="text-sm text-slate-400 hover:text-orange-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-sm text-slate-400 hover:text-orange-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-3">
              <li><Link to="/help" className="text-sm text-slate-400 hover:text-orange-400 transition-colors">Help Center</Link></li>
              <li><Link to="/returns" className="text-sm text-slate-400 hover:text-orange-400 transition-colors">Returns</Link></li>
              <li><Link to="/shipping" className="text-sm text-slate-400 hover:text-orange-400 transition-colors">Shipping Info</Link></li>
              <li><Link to="/faq" className="text-sm text-slate-400 hover:text-orange-400 transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <FaMapMarkerAlt className="mt-1 text-orange-500 shrink-0" />
                <span>123 Delivery Street, Tech Park, Bangalore, India 560001</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <FaPhone className="text-orange-500 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <FaEnvelope className="text-orange-500 shrink-0" />
                <span>support@quickcart.com</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} QuickCart. All rights reserved.
            </p>
            <p className="text-slate-400 text-sm flex items-center gap-1">
              Made with <FaHeart className="text-red-500 mx-1" /> in India
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link to="/terms" className="text-slate-400 hover:text-orange-400 transition-colors">Terms of Service</Link>
              <span className="text-slate-700">|</span>
              <Link to="/privacy" className="text-slate-400 hover:text-orange-400 transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
