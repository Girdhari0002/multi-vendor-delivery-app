import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Footer = () => {
  const [language, setLanguage] = useState('English');
  const [country, setCountry] = useState('India');

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Top Section - Responsive Columns */}
      <div className="bg-amazon-dark pt-8 md:pt-12 pb-6 md:pb-8">
        <div className="max-w-7xl mx-auto px-2 md:px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {/* Column 1 - Get to Know Us */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-bold mb-3 md:mb-4 text-xs md:text-sm">Get to Know Us</h4>
            <ul className="space-y-1 md:space-y-2">
              <li>
                <a href="#" className="text-gray-300 text-xs md:text-sm hover:text-orange-400 transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 text-xs md:text-sm hover:text-orange-400 transition">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 text-xs md:text-sm hover:text-orange-400 transition">
                  Press Releases
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 text-xs md:text-sm hover:text-orange-400 transition">
                  DeliveryApp Science
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2 - Make Money with Us */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-bold mb-3 md:mb-4 text-xs md:text-sm">Make Money with Us</h4>
            <ul className="space-y-1 md:space-y-2">
              <li>
                <a href="#" className="text-gray-300 text-xs md:text-sm hover:text-orange-400 transition">
                  Sell on DeliveryApp
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 text-xs md:text-sm hover:text-orange-400 transition">
                  Sell Under Private Brands
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 text-xs md:text-sm hover:text-orange-400 transition">
                  Become an Affiliate
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 text-xs md:text-sm hover:text-orange-400 transition">
                  Advertise Your Products
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 - Let Us Help You */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-bold mb-3 md:mb-4 text-xs md:text-sm">Let Us Help You</h4>
            <ul className="space-y-1 md:space-y-2">
              <li>
                <a href="#" className="text-gray-300 text-xs md:text-sm hover:text-orange-400 transition">
                  Your Account
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 text-xs md:text-sm hover:text-orange-400 transition">
                  Your Orders
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 text-xs md:text-sm hover:text-orange-400 transition">
                  Shipping Rates & Policies
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 text-xs md:text-sm hover:text-orange-400 transition">
                  Return Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 text-xs md:text-sm hover:text-orange-400 transition">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 - Connect with Us */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-bold mb-3 md:mb-4 text-xs md:text-sm">Connect with Us</h4>
            <div className="flex justify-center sm:justify-start gap-4 md:gap-6 mb-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-orange-400 transition text-base md:text-lg"
              >
                <FaFacebook />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-orange-400 transition text-base md:text-lg"
              >
                <FaTwitter />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-orange-400 transition text-base md:text-lg"
              >
                <FaInstagram />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-orange-400 transition text-base md:text-lg"
              >
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section - Language & Country */}
      <div className="bg-amazon-dark border-t border-gray-700 py-4 md:py-6">
        <div className="max-w-7xl mx-auto px-2 md:px-4 flex flex-col gap-3 md:gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-6">
            <div className="text-center flex-1 sm:flex-none">
              <h5 className="text-white font-semibold mb-2 text-xs md:text-sm">Language</h5>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-800 text-white px-2 md:px-4 py-1 md:py-2 rounded text-xs border border-gray-600 w-full sm:w-auto"
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>

            <div className="hidden sm:flex items-center space-x-2 md:space-x-3">
              <div className="text-white font-bold text-lg md:text-xl">📦</div>
              <span className="text-white text-xs md:text-sm">DeliveryApp</span>
            </div>

            <div className="text-center flex-1 sm:flex-none">
              <h5 className="text-white font-semibold mb-2 text-xs md:text-sm">Country/Region</h5>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="bg-gray-800 text-white px-2 md:px-4 py-1 md:py-2 rounded text-xs border border-gray-600 w-full sm:w-auto"
              >
                <option>India</option>
                <option>USA</option>
                <option>UK</option>
                <option>Canada</option>
              </select>
            </div>
          </div>

          {/* Mobile Logo */}
          <div className="sm:hidden flex items-center justify-center space-x-2">
            <div className="text-white font-bold text-lg">📦</div>
            <span className="text-white text-xs">DeliveryApp</span>
          </div>
        </div>
      </div>

      {/* Bottom Section - Copyright & Links */}
      <div className="bg-gray-950 py-4 md:py-6 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-2 md:px-4">
          <div className="flex flex-col gap-3 md:gap-4 text-center md:text-left">
            <p className="text-gray-500 text-xs">
              © 2024 DeliveryApp. All rights reserved.
            </p>
            <div className="flex justify-center md:justify-start gap-2 md:gap-4 text-xs flex-wrap">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition">
                Conditions of Use
              </a>
              <span className="text-gray-600 hidden sm:inline">|</span>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition">
                Privacy Notice
              </a>
              <span className="text-gray-600 hidden sm:inline">|</span>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition">
                Interest-Based Ads
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
