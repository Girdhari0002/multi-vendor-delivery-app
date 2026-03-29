import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              DeliveryApp
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Register</Link>
              </>
            ) : (
              <>
                {user.role === 'customer' && (
                  <>
                    <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
                    <Link to="/cart" className="text-gray-700 hover:text-blue-600">Cart</Link>
                    <Link to="/customer/orders" className="text-gray-700 hover:text-blue-600">My Orders</Link>
                  </>
                )}
                {user.role === 'seller' && (
                  <>
                    <Link to="/seller/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
                    <Link to="/seller/products" className="text-gray-700 hover:text-blue-600">Products</Link>
                    <Link to="/seller/orders" className="text-gray-700 hover:text-blue-600">Orders</Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
                    <Link to="/admin/users" className="text-gray-700 hover:text-blue-600">Users</Link>
                    <Link to="/admin/products" className="text-gray-700 hover:text-blue-600">Products</Link>
                    <Link to="/admin/orders" className="text-gray-700 hover:text-blue-600">Orders</Link>
                  </>
                )}
                <div className="ml-4 flex items-center space-x-2">
                  <span className="text-gray-500 font-medium">{user.name} ({user.role})</span>
                  <button onClick={logout} className="text-red-500 hover:text-red-700 ml-4">
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
