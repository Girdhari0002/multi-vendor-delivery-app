import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import Spinner from '../../components/Spinner';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products', {
        params: { keyword, category }
      });
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [keyword, category]);

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Search products..."
          className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="food">Food</option>
          <option value="books">Books</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <img src={product.image || 'https://via.placeholder.com/300'} alt={product.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 truncate">{product.title}</h3>
                <p className="text-gray-500 text-sm mt-1">{product.category}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xl font-bold text-blue-600">₹{product.price}</span>
                  <div className="flex items-center space-x-1 text-yellow-500">
                    <span>★</span>
                    <span>{product.rating.toFixed(1)}</span>
                  </div>
                </div>
                <Link to={`/product/${product._id}`} className="mt-4 block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded transition-colors duration-200">
                  View Details
                </Link>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12">
              No products found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
