import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { FaArrowLeft, FaDownload, FaPrint } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';

const InvoicePage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const invoiceRef = useRef();
  const [order, setOrder] = useState(null);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login');
      return;
    }
    fetchInvoiceData();
  }, [orderId, user, navigate]);

  const fetchInvoiceData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}/invoice`);
      setOrder(response.data.order);
      setSellerInfo(response.data.sellerInfo);
    } catch (error) {
      toast.error('Failed to load invoice data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!order || !sellerInfo) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    // Header Section
    doc.setFontSize(20);
    doc.text('INVOICE', pageWidth - 30, yPosition, { align: 'right' });

    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Invoice #: INV-${order._id.slice(-6).toUpperCase()}`, pageWidth - 30, yPosition, { align: 'right' });
    yPosition += 5;
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, pageWidth - 30, yPosition, { align: 'right' });
    yPosition += 5;
    doc.text(`Order #: ${order._id.slice(-8).toUpperCase()}`, pageWidth - 30, yPosition, { align: 'right' });

    // Store Info
    yPosition += 10;
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text(sellerInfo?.businessName || 'Store Name', 20, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(sellerInfo?.businessAddress || 'Store Address', 20, yPosition);
    yPosition += 5;
    doc.text(`Phone: ${sellerInfo?.phone || 'N/A'}`, 20, yPosition);

    // Bill To and Ship To
    yPosition += 12;
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text('BILL TO:', 20, yPosition);

    const shipYPosition = yPosition;
    const shipX = pageWidth / 2 + 10;
    doc.text('SHIP TO:', shipX, shipYPosition);

    yPosition += 7;
    doc.setFontSize(10);
    doc.setTextColor(100);

    // Bill To Content
    doc.text(order.customer?.name || 'Customer Name', 20, yPosition);
    yPosition += 5;
    doc.text(`Phone: ${order.customer?.phone || 'N/A'}`, 20, yPosition);
    yPosition += 5;
    const billingAddress = order.billingAddress || order.shippingAddress;
    if (billingAddress) {
      doc.text(billingAddress.street || '', 20, yPosition);
      yPosition += 5;
      doc.text(`${billingAddress.city}, ${billingAddress.state} - ${billingAddress.zip}`, 20, yPosition);
      yPosition += 5;
      doc.text(billingAddress.country || '', 20, yPosition);
    }

    // Ship To Content
    let shipYPos = shipYPosition + 7;
    doc.setTextColor(100);
    if (order.shippingAddress?.isDefault) {
      doc.text('Same as billing', shipX, shipYPos);
    } else {
      doc.text(order.shippingAddress?.street || '', shipX, shipYPos);
      shipYPos += 5;
      doc.text(`${order.shippingAddress?.city}, ${order.shippingAddress?.state}`, shipX, shipYPos);
      shipYPos += 5;
      doc.text(order.shippingAddress?.country || '', shipX, shipYPos);
    }

    yPosition += 15;

    // Order Items Table
    const tableData = order.items?.map((item) => [
      item.productName || 'Product',
      item.quantity || 0,
      `₹${item.price || 0}`,
      `₹${(item.quantity || 0) * (item.price || 0)}`,
    ]) || [];

    doc.autoTable({
      startY: yPosition,
      head: [['PRODUCT NAME', 'QTY', 'UNIT PRICE', 'TOTAL']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [255, 153, 0], textColor: 255, fontStyle: 'bold' },
      bodyStyles: { textColor: 50 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 20, right: 20 },
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Totals Section
    doc.setFontSize(10);
    doc.setTextColor(0);

    const rightX = pageWidth - 70;
    doc.text('Subtotal:', rightX, yPosition);
    doc.setTextColor(100);
    doc.text(`₹${order.subtotal || 0}`, pageWidth - 20, yPosition, { align: 'right' });

    yPosition += 7;
    doc.setTextColor(0);
    doc.text('Delivery Charge:', rightX, yPosition);
    doc.setTextColor(100);
    doc.text(`₹${order.deliveryCharge || 50}`, pageWidth - 20, yPosition, { align: 'right' });

    yPosition += 7;
    doc.setTextColor(0);
    doc.text('Discount:', rightX, yPosition);
    doc.setTextColor(100);
    doc.text(`₹${order.discount || 0}`, pageWidth - 20, yPosition, { align: 'right' });

    if (order.codCharge > 0) {
      yPosition += 7;
      doc.setTextColor(0);
      doc.text('COD Charge:', rightX, yPosition);
      doc.setTextColor(100);
      doc.text(`₹${order.codCharge || 0}`, pageWidth - 20, yPosition, { align: 'right' });
    }

    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('GRAND TOTAL:', rightX, yPosition);
    doc.setTextColor(255, 153, 0);
    doc.setFontSize(14);
    doc.setFontStyle('bold');
    doc.text(`₹${order.totalPrice || 0}`, pageWidth - 20, yPosition, { align: 'right' });

    // Payment & Order Status
    yPosition += 15;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFontStyle('normal');
    doc.text(`Payment Method: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Payment Status: ${order.paymentStatus?.toUpperCase() || 'PENDING'}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Order Status: ${order.orderStatus?.toUpperCase() || 'PLACED'}`, 20, yPosition);

    // Footer
    yPosition = pageHeight - 20;
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('Thank you for your order!', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    doc.text('For queries contact: support@deliveryapp.com', pageWidth / 2, yPosition, { align: 'center' });

    // Save PDF
    doc.save(`Invoice-${order._id.slice(-8).toUpperCase()}.pdf`);
    toast.success('Invoice downloaded successfully');
  };

  const handlePrint = () => {
    if (invoiceRef.current) {
      const printWindow = window.open('', '', 'height=600,width=800');
      printWindow.document.write('<html><head><title>Invoice</title>');
      printWindow.document.write('<link rel="stylesheet" href="/print-styles.css">');
      printWindow.document.write('</head><body>');
      printWindow.document.write(invoiceRef.current.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading invoice...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-12 text-red-600">
        Invoice not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/seller/orders')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition"
          >
            <FaArrowLeft /> Back to Orders
          </button>
          <div className="flex gap-4">
            <button
              onClick={generatePDF}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
            >
              <FaDownload /> Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition font-semibold flex items-center gap-2"
            >
              <FaPrint /> Print
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div ref={invoiceRef} id="invoice-content" className="bg-white rounded-lg shadow-lg p-12">
          {/* Header */}
          <div className="flex justify-between items-start mb-12 pb-8 border-b-2 border-gray-300">
            <div>
              <h1 className="text-4xl font-bold text-orange-600 mb-4">📦 {sellerInfo?.businessName}</h1>
              <p className="text-gray-600">{sellerInfo?.businessAddress}</p>
              <p className="text-gray-600">Phone: {sellerInfo?.phone}</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-gray-900">INVOICE</h2>
              <p className="text-gray-600 mt-2">INV-{order._id.slice(-6).toUpperCase()}</p>
              <p className="text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p className="text-gray-600">Order #: {order._id.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          {/* Billing & Shipping */}
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase">Bill To:</h3>
              <p className="font-semibold text-gray-900">{order.customer?.name}</p>
              <p className="text-gray-600">Phone: {order.customer?.phone}</p>
              {order.billingAddress && (
                <>
                  <p className="text-gray-600">{order.billingAddress.street}</p>
                  <p className="text-gray-600">
                    {order.billingAddress.city}, {order.billingAddress.state} - {order.billingAddress.zip}
                  </p>
                  <p className="text-gray-600">{order.billingAddress.country}</p>
                </>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase">Ship To:</h3>
              {order.shippingAddress?.isDefault ? (
                <p className="text-gray-600">Same as billing address</p>
              ) : (
                <>
                  <p className="font-semibold text-gray-900">{order.customer?.name}</p>
                  {order.shippingAddress && (
                    <>
                      <p className="text-gray-600">{order.shippingAddress.street}</p>
                      <p className="text-gray-600">
                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zip}
                      </p>
                      <p className="text-gray-600">{order.shippingAddress.country}</p>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-12">
            <thead>
              <tr className="bg-orange-600 text-white">
                <th className="px-4 py-3 text-left text-sm font-bold">#</th>
                <th className="px-4 py-3 text-left text-sm font-bold">PRODUCT NAME</th>
                <th className="px-4 py-3 text-center text-sm font-bold">QTY</th>
                <th className="px-4 py-3 text-right text-sm font-bold">UNIT PRICE</th>
                <th className="px-4 py-3 text-right text-sm font-bold">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <span className="font-semibold text-gray-900">{item.productName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">₹{item.price}</td>
                  <td className="px-4 py-3 text-right font-semibold">₹{(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-12">
            <div className="w-64">
              <div className="flex justify-between py-2 border-t border-gray-300">
                <span className="font-semibold text-gray-900">Subtotal:</span>
                <span>₹{order.subtotal || 0}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold text-gray-900">Delivery Charge:</span>
                <span>₹{order.deliveryCharge || 50}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold text-gray-900">Discount:</span>
                <span>-₹{order.discount || 0}</span>
              </div>
              {order.codCharge > 0 && (
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-gray-900">COD Charge:</span>
                  <span>₹{order.codCharge}</span>
                </div>
              )}
              <div className="flex justify-between py-3 bg-orange-600 text-white px-4 rounded-lg font-bold text-lg">
                <span>GRAND TOTAL:</span>
                <span>₹{order.totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="grid grid-cols-3 gap-6 pb-8 border-b border-gray-300 mb-8">
            <div>
              <p className="text-xs text-gray-600 font-semibold">PAYMENT METHOD</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">PAYMENT STATUS</p>
              <p className={`text-sm font-semibold mt-1 ${
                order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {order.paymentStatus?.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">ORDER STATUS</p>
              <p className={`text-sm font-semibold mt-1 ${
                order.orderStatus === 'delivered' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {order.orderStatus?.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-700">
            <h4 className="font-bold mb-2">Thank you for your order!</h4>
            <p className="text-sm">For queries contact: support@deliveryapp.com</p>
            <p className="text-xs text-gray-500 mt-8">© 2024 DeliveryApp. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .navbar, .footer, button, nav {
            display: none !important;
          }
          #invoice-content {
            box-shadow: none;
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoicePage;
