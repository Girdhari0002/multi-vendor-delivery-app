import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import CustomerLayout from './components/layouts/CustomerLayout';
import SellerLayout from './components/layouts/SellerLayout';
import AdminLayout from './components/layouts/AdminLayout';
import DeliveryLayout from './components/layouts/DeliveryLayout';

// Public pages
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

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Routes>
        {/* Public Routes (No Layout - Split Screen Auth) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Customer Routes (CustomerLayout) */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<ProtectedRoute allowedRoles={['customer']}><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute allowedRoles={['customer']}><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute allowedRoles={['customer']}><Orders /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute allowedRoles={['customer']}><Wishlist /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['customer']}><CustomerProfile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={['customer']}><Settings /></ProtectedRoute>} />
        </Route>

        {/* Seller Routes (SellerLayout) */}
        <Route path="/seller" element={<ProtectedRoute allowedRoles={['seller']}><SellerLayout /></ProtectedRoute>}>
          <Route index element={<SellerDashboard />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<AddProduct />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="invoice/:orderId" element={<InvoicePage />} />
          <Route path="payouts" element={<SellerPayouts />} />
          <Route path="profile" element={<SellerProfile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Admin Routes (AdminLayout) */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="sellers" element={<ManageSellers />} />
          <Route path="sellers/:id" element={<SellerDetails />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="payouts" element={<Payouts />} />
          <Route path="delivery-agents" element={<ManageDeliveryAgents />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Delivery Routes (DeliveryLayout) */}
        <Route path="/delivery" element={<ProtectedRoute allowedRoles={['delivery']}><DeliveryLayout /></ProtectedRoute>}>
          <Route index element={<DeliveryDashboard />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
