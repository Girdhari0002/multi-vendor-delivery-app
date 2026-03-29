import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      // Filter out products that don't belong to this seller
      setProducts(data.filter(p => p.sellerId?._id === user._id || p.sellerId === user._id));
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchProducts();
  }, [user]);

  const deleteProduct = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product deleted');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Products</h2>
        <Link to="/seller/products/add" className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700">
          Add New Product
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {products.map(product => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 flex items-center space-x-4">
                  <img src={product.image} alt={product.title} className="w-12 h-12 rounded object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900">{product.title}</p>
                    <p className="text-gray-500 text-xs">{product.category}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-semibold">₹{product.price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-800">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                  <Link to={`/seller/products/edit/${product._id}`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                  <button onClick={() => deleteProduct(product._id)} className="text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="text-center py-6 text-gray-500">You haven't added any products yet.</p>}
      </div>
    </div>
  );
};

export default ManageProducts;
