import React, { useState, useEffect } from 'react';
import { FaEye, FaTrash, FaCheck, FaTimes, FaSearch, FaSort } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function ManageSellers() {
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    filterAndSortSellers();
  }, [sellers, searchTerm, sortBy, filterStatus]);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      console.log('Fetching sellers with user:', user);
      const response = await api.get('/admin/sellers');
      console.log('Sellers fetched:', response.data);
      setSellers(response.data);
    } catch (error) {
      console.error('Error fetching sellers:', error.response?.data || error.message);
      alert('Failed to load sellers: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortSellers = () => {
    let filtered = [...sellers];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.storeStatus === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(s =>
        (s.businessName || s.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          const nameA = (a.businessName || a.name || '').toLowerCase();
          const nameB = (b.businessName || b.name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        case 'revenue':
          return (b.totalRevenue || 0) - (a.totalRevenue || 0);
        case 'orders':
          return (b.orderCount || 0) - (a.orderCount || 0);
        case 'products':
          return (b.productCount || 0) - (a.productCount || 0);
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredSellers(filtered);
  };

  const handleDeleteSeller = async (sellerId) => {
    if (window.confirm('Are you sure you want to delete this seller and all their products/orders?')) {
      try {
        await api.delete(`/admin/sellers/${sellerId}`);
        alert('Seller deleted successfully');
        fetchSellers();
      } catch (error) {
        console.error('Error deleting seller:', error);
        alert('Failed to delete seller: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleViewDetails = (sellerId) => {
    navigate(`/admin/sellers/${sellerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-center">Loading sellers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-2 md:p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
            Manage Sellers
          </h1>
          <p className="text-gray-600 text-xs md:text-sm">
            View, manage, and monitor all sellers on the platform
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-3 md:p-6 mb-4 md:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-2 md:top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search sellers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 md:pl-10 pr-4 py-1 md:py-2 border border-gray-300 rounded-lg text-xs md:text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 md:px-4 py-1 md:py-2 border border-gray-300 rounded-lg text-xs md:text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 md:px-4 py-1 md:py-2 border border-gray-300 rounded-lg text-xs md:text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="revenue">Sort by Revenue</option>
              <option value="orders">Sort by Orders</option>
              <option value="products">Sort by Products</option>
              <option value="date">Sort by Date</option>
            </select>

            {/* Stats */}
            <div className="bg-indigo-50 p-2 md:p-3 rounded-lg">
              <p className="text-xs md:text-sm text-indigo-600 font-semibold">
                {filteredSellers.length} of {sellers.length} sellers
              </p>
            </div>
          </div>
        </div>

        {/* Sellers Table/Cards */}
        {filteredSellers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 md:p-12 text-center">
            <p className="text-gray-600 text-sm md:text-lg">No sellers found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Shop Name</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Owner</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-center font-bold text-gray-700">Products</th>
                    <th className="px-4 py-3 text-center font-bold text-gray-700">Orders</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-700">Revenue</th>
                    <th className="px-4 py-3 text-center font-bold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-center font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSellers.map((seller, index) => (
                    <tr key={seller._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 hover:bg-indigo-50 transition`}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{seller.businessName || seller.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{seller.businessType || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{seller.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{seller.email}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                          {seller.productCount || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                          {seller.orderCount || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 text-sm">
                        ₹{(seller.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          seller.storeStatus === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {seller.storeStatus === 'active' ? (
                            <><FaCheck size={10} /> Active</>
                          ) : (
                            <><FaTimes size={10} /> Inactive</>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(seller._id)}
                            className="text-indigo-600 hover:text-indigo-900 font-semibold text-sm"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleDeleteSeller(seller._id)}
                            className="text-red-600 hover:text-red-900 font-semibold text-sm"
                            title="Delete Seller"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-3">
              {filteredSellers.map(seller => (
                <div key={seller._id} className="bg-white rounded-lg shadow-md p-3 border border-gray-200 hover:shadow-lg transition">
                  {/* Header */}
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900 text-sm md:text-base">{seller.businessName || seller.name || 'N/A'}</h3>
                    <p className="text-xs text-gray-500">{seller.businessType || 'Not specified'}</p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3">
                    <div className="text-xs md:text-sm">
                      <p className="text-gray-500 font-semibold">Owner</p>
                      <p className="text-gray-900">{seller.name}</p>
                    </div>
                    <div className="text-xs md:text-sm">
                      <p className="text-gray-500 font-semibold">Email</p>
                      <p className="text-gray-900 truncate">{seller.email}</p>
                    </div>
                    <div className="text-xs md:text-sm">
                      <p className="text-gray-500 font-semibold">Products</p>
                      <p className="text-blue-600 font-bold">{seller.productCount || 0}</p>
                    </div>
                    <div className="text-xs md:text-sm">
                      <p className="text-gray-500 font-semibold">Orders</p>
                      <p className="text-green-600 font-bold">{seller.orderCount || 0}</p>
                    </div>
                    <div className="text-xs md:text-sm">
                      <p className="text-gray-500 font-semibold">Revenue</p>
                      <p className="text-purple-600 font-bold">
                        ₹{(seller.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="text-xs md:text-sm">
                      <p className="text-gray-500 font-semibold">Joined</p>
                      <p className="text-gray-900">{new Date(seller.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      seller.storeStatus === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {seller.storeStatus === 'active' ? (
                        <><FaCheck size={10} /> Active</>
                      ) : (
                        <><FaTimes size={10} /> Inactive</>
                      )}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(seller._id)}
                        className="text-indigo-600 hover:text-indigo-900 font-semibold p-1 md:p-2 hover:bg-indigo-50 rounded"
                        title="View Details"
                      >
                        <FaEye size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSeller(seller._id)}
                        className="text-red-600 hover:text-red-900 font-semibold p-1 md:p-2 hover:bg-red-50 rounded"
                        title="Delete Seller"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Summary Stats */}
        {filteredSellers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
            <div className="bg-white rounded-lg shadow-md p-3 md:p-6">
              <p className="text-gray-600 text-xs md:text-sm mb-2 font-semibold">Total Sellers</p>
              <p className="text-2xl md:text-3xl font-bold text-indigo-600">{filteredSellers.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 md:p-6">
              <p className="text-gray-600 text-xs md:text-sm mb-2 font-semibold">Total Products</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-600">
                {filteredSellers.reduce((sum, s) => sum + (s.productCount || 0), 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 md:p-6">
              <p className="text-gray-600 text-xs md:text-sm mb-2 font-semibold">Total Orders</p>
              <p className="text-2xl md:text-3xl font-bold text-green-600">
                {filteredSellers.reduce((sum, s) => sum + (s.orderCount || 0), 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 md:p-6">
              <p className="text-gray-600 text-xs md:text-sm mb-2 font-semibold">Total Revenue</p>
              <p className="text-2xl md:text-3xl font-bold text-purple-600">
                ₹{filteredSellers.reduce((sum, s) => sum + (s.totalRevenue || 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
