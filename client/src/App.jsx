import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Global pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyOtp from './pages/VerifyOtp';

// Customer pages
import Home from './pages/customer/Home';
import ProductDetails from './pages/customer/ProductDetails';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import Orders from './pages/customer/Orders';
import CustomerProfile from './pages/customer/CustomerProfile';
import Wishlist from './pages/customer/Wishlist';

// Seller pages
import SellerDashboard from './pages/seller/Dashboard';
import ManageProducts from './pages/seller/ManageProducts';
import AddProduct from './pages/seller/AddProduct';
import SellerOrders from './pages/seller/SellerOrders';
import SellerProfile from './pages/seller/SellerProfile';
import InvoicePage from './pages/seller/InvoicePage';
import SellerPayouts from './pages/seller/Payouts';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProfile from './pages/admin/AdminProfile';
import CustomerDetails from './pages/admin/CustomerDetails';
import ManageSellers from './pages/admin/ManageSellers';
import SellerDetails from './pages/admin/SellerDetails';
import ManageDeliveryAgents from './pages/admin/ManageDeliveryAgents';
import Coupons from './pages/admin/Coupons';
import Payouts from './pages/admin/Payouts';

// Delivery pages
import DeliveryDashboard from './pages/delivery/Dashboard';

// Shared pages
import Settings from './pages/Settings';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
          <Navbar />
          <ToastContainer position="top-right" autoClose={3000} />
          
          <main className="flex-1 max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />

              {/* Customer Access (Default / Logged in as customer) */}
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<ProtectedRoute allowedRoles={['customer']}><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute allowedRoles={['customer']}><Checkout /></ProtectedRoute>} />
              <Route path="/customer/orders" element={<ProtectedRoute allowedRoles={['customer']}><Orders /></ProtectedRoute>} />
              <Route path="/customer/profile" element={<ProtectedRoute allowedRoles={['customer']}><CustomerProfile /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute allowedRoles={['customer']}><Wishlist /></ProtectedRoute>} />

              {/* Seller Access */}
              <Route path="/seller/dashboard" element={<ProtectedRoute allowedRoles={['seller']}><SellerDashboard /></ProtectedRoute>} />
              <Route path="/seller/products" element={<ProtectedRoute allowedRoles={['seller']}><ManageProducts /></ProtectedRoute>} />
              <Route path="/seller/products/add" element={<ProtectedRoute allowedRoles={['seller']}><AddProduct /></ProtectedRoute>} />
              <Route path="/seller/products/edit/:id" element={<ProtectedRoute allowedRoles={['seller']}><AddProduct /></ProtectedRoute>} />
              <Route path="/seller/orders" element={<ProtectedRoute allowedRoles={['seller']}><SellerOrders /></ProtectedRoute>} />
              <Route path="/seller/profile" element={<ProtectedRoute allowedRoles={['seller']}><SellerProfile /></ProtectedRoute>} />
              <Route path="/seller/invoice/:orderId" element={<ProtectedRoute allowedRoles={['seller']}><InvoicePage /></ProtectedRoute>} />
              <Route path="/seller/payouts" element={<ProtectedRoute allowedRoles={['seller']}><SellerPayouts /></ProtectedRoute>} />

              {/* Admin Access */}
              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute allowedRoles={['admin']}><AdminProducts /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><AdminOrders /></ProtectedRoute>} />
              <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><AdminProfile /></ProtectedRoute>} />
              <Route path="/admin/customers/:id" element={<ProtectedRoute allowedRoles={['admin']}><CustomerDetails /></ProtectedRoute>} />
              <Route path="/admin/sellers" element={<ProtectedRoute allowedRoles={['admin']}><ManageSellers /></ProtectedRoute>} />
              <Route path="/admin/sellers/:id" element={<ProtectedRoute allowedRoles={['admin']}><SellerDetails /></ProtectedRoute>} />
              <Route path="/admin/delivery-agents" element={<ProtectedRoute allowedRoles={['admin']}><ManageDeliveryAgents /></ProtectedRoute>} />
              <Route path="/admin/coupons" element={<ProtectedRoute allowedRoles={['admin']}><Coupons /></ProtectedRoute>} />
              <Route path="/admin/payouts" element={<ProtectedRoute allowedRoles={['admin']}><Payouts /></ProtectedRoute>} />

              {/* Delivery Agent Access */}
              <Route path="/delivery/dashboard" element={<ProtectedRoute allowedRoles={['delivery']}><DeliveryDashboard /></ProtectedRoute>} />

              {/* Shared Routes */}
              <Route path="/settings" element={<ProtectedRoute allowedRoles={['customer', 'seller', 'admin', 'delivery']}><Settings /></ProtectedRoute>} />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
