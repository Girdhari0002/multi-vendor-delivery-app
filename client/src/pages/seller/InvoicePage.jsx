import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { FaArrowLeft, FaDownload, FaPrint, FaBoxOpen } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';

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
      `Rs. ${item.price || 0}`,
      `Rs. ${(item.quantity || 0) * (item.price || 0)}`,
    ]) || [];

    doc.autoTable({
      startY: yPosition,
      head: [['PRODUCT NAME', 'QTY', 'UNIT PRICE', 'TOTAL']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [255, 107, 0], textColor: 255, fontStyle: 'bold' },
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
    doc.text(`Rs. ${order.subtotal || 0}`, pageWidth - 20, yPosition, { align: 'right' });

    yPosition += 7;
    doc.setTextColor(0);
    doc.text('Delivery Charge:', rightX, yPosition);
    doc.setTextColor(100);
    doc.text(`Rs. ${order.deliveryCharge || 50}`, pageWidth - 20, yPosition, { align: 'right' });

    yPosition += 7;
    doc.setTextColor(0);
    doc.text('Discount:', rightX, yPosition);
    doc.setTextColor(100);
    doc.text(`Rs. ${order.discount || 0}`, pageWidth - 20, yPosition, { align: 'right' });

    if (order.codCharge > 0) {
      yPosition += 7;
      doc.setTextColor(0);
      doc.text('COD Charge:', rightX, yPosition);
      doc.setTextColor(100);
      doc.text(`Rs. ${order.codCharge || 0}`, pageWidth - 20, yPosition, { align: 'right' });
    }

    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('GRAND TOTAL:', rightX, yPosition);
    doc.setTextColor(255, 107, 0); // orange-500
    doc.setFontSize(14);
    doc.setFontStyle('bold');
    doc.text(`Rs. ${order.totalPrice || 0}`, pageWidth - 20, yPosition, { align: 'right' });

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
    doc.text('Thank you for your business!', pageWidth / 2, yPosition, { align: 'center' });

    // Save PDF
    doc.save(`Invoice-${order._id.slice(-8).toUpperCase()}.pdf`);
    toast.success('Invoice downloaded successfully');
  };

  const handlePrint = () => {
    if (invoiceRef.current) {
      const printWindow = window.open('', '', 'height=800,width=800');
      printWindow.document.write('<html><head><title>Invoice</title>');
      printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
      printWindow.document.write('</head><body class="p-8">');
      printWindow.document.write(invoiceRef.current.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <Card className="max-w-md w-full text-center py-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Invoice Not Found</h2>
          <p className="text-slate-500 mb-6">The requested invoice could not be located.</p>
          <Button onClick={() => navigate('/seller/orders')} icon={<FaArrowLeft />}>
            Back to Orders
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/seller/orders')}
            icon={<FaArrowLeft />}
            className="self-start sm:self-auto"
          >
            Back to Orders
          </Button>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handlePrint}
              icon={<FaPrint />}
              className="flex-1 sm:flex-none"
            >
              Print
            </Button>
            <Button
              variant="primary"
              onClick={generatePDF}
              icon={<FaDownload />}
              className="flex-1 sm:flex-none"
            >
              Download PDF
            </Button>
          </div>
        </div>

        {/* Invoice Content */}
        <Card className="p-0 overflow-hidden" ref={invoiceRef}>
          {/* Header */}
          <div className="bg-slate-900 p-8 sm:p-12 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-500 p-2 rounded-lg">
                    <FaBoxOpen className="text-white text-2xl" />
                  </div>
                  <span className="text-2xl font-bold tracking-tight">QuickCart</span>
                </div>
                <h1 className="text-xl font-semibold text-slate-200">{sellerInfo?.businessName}</h1>
                <p className="text-slate-400 mt-1 max-w-sm">{sellerInfo?.businessAddress}</p>
                <p className="text-slate-400 mt-1">Phone: {sellerInfo?.phone}</p>
              </div>
              <div className="text-left md:text-right">
                <h2 className="text-4xl font-black text-white tracking-widest uppercase mb-2">Invoice</h2>
                <p className="text-slate-400 font-medium text-lg">INV-{order._id.slice(-6).toUpperCase()}</p>
                <p className="text-slate-400 mt-2">Date: <span className="text-white">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                <p className="text-slate-400">Order #: <span className="text-white">{order._id.slice(-8).toUpperCase()}</span></p>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-12 bg-white">
            {/* Status Badges */}
            <div className="flex flex-wrap gap-3 mb-10 pb-8 border-b border-slate-100">
              <Badge variant={order.paymentStatus === 'completed' ? 'success' : 'warning'} dot>
                Payment: {order.paymentStatus?.toUpperCase()}
              </Badge>
              <Badge variant={order.orderStatus === 'delivered' ? 'success' : 'primary'} dot>
                Order: {order.orderStatus?.toUpperCase()}
              </Badge>
              <Badge variant="neutral">
                Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}
              </Badge>
            </div>

            {/* Billing & Shipping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
              <div>
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">Bill To</h3>
                <p className="text-lg font-semibold text-slate-900 mb-1">{order.customer?.name}</p>
                <p className="text-slate-600 mb-2">Phone: {order.customer?.phone}</p>
                {order.billingAddress && (
                  <div className="text-slate-600">
                    <p>{order.billingAddress.street}</p>
                    <p>{order.billingAddress.city}, {order.billingAddress.state} - {order.billingAddress.zip}</p>
                    <p>{order.billingAddress.country}</p>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">Ship To</h3>
                {order.shippingAddress?.isDefault ? (
                  <p className="text-slate-600 italic mt-1">Same as billing address</p>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-slate-900 mb-1">{order.customer?.name}</p>
                    {order.shippingAddress && (
                      <div className="text-slate-600">
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zip}</p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto mb-10 border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Qty</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Unit Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items?.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {item.productImage && (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-100 bg-white"
                            />
                          )}
                          <span className="font-medium text-slate-900">{item.productName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-slate-700">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-slate-700">₹{item.price?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        ₹{((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="w-full md:w-1/2 bg-slate-50 p-6 rounded-xl text-slate-500 text-sm">
                <h4 className="font-bold text-slate-700 mb-2">Terms & Conditions</h4>
                <p>Please make the payment by the due date. Returns are accepted within 7 days of delivery for defective items.</p>
              </div>

              <div className="w-full md:w-80">
                <div className="space-y-3 text-slate-600 mb-4">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-900">₹{order.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Delivery Charge</span>
                    <span className="font-medium text-slate-900">₹{order.deliveryCharge?.toFixed(2) || '50.00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Discount</span>
                    <span className="font-medium text-emerald-600">-₹{order.discount?.toFixed(2) || '0.00'}</span>
                  </div>
                  {order.codCharge > 0 && (
                    <div className="flex justify-between items-center">
                      <span>COD Charge</span>
                      <span className="font-medium text-slate-900">₹{order.codCharge?.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">Total Amount</span>
                    <span className="text-2xl font-bold text-orange-500">₹{order.totalPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InvoicePage;
