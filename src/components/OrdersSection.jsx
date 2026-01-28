import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Search, 
  Download, 
  Loader, 
  AlertCircle, 
  Package,
  Paintbrush,
  Store,
  Layers,
  ShoppingBag,
  Tag,
  ChevronUp,
  ChevronDown,
  Printer
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const UnifiedCustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    per_page: 10
  });

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get auth token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please log in to view your orders');
        setLoading(false);
        return;
      }

      const token = session.access_token;
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('Fetching orders from both endpoints...');

      // Define endpoints
      const endpoints = [
        {
          url: `https://plx-bckend.onrender.com/api/users/custom-orders?page=${pagination.current_page}&limit=${pagination.per_page}`,
          type: 'custom'
        },
        {
          url: `https://plx-bckend.onrender.com/api/users/orders?page=${pagination.current_page}&limit=${pagination.per_page}`,
          type: 'store'
        }
      ];

      // Fetch from both endpoints in parallel
      const fetchPromises = endpoints.map(endpoint => 
        axios.get(endpoint.url, { headers })
          .then(response => ({
            type: endpoint.type,
            data: response.data,
            error: null
          }))
          .catch(error => ({
            type: endpoint.type,
            data: null,
            error: error.message
          }))
      );

      const results = await Promise.all(fetchPromises);

    

      let allOrders = [];
      let errors = [];
      let combinedPagination = { ...pagination };

      // Process each result
      results.forEach(result => {
        if (result.error) {
          errors.push(`${result.type} orders: ${result.error}`);
        } else if (result.data) {
          
          
          // Extract orders from response (handles both structures)
          let ordersFromResponse = [];
          
          if (result.data.orders && Array.isArray(result.data.orders)) {
            ordersFromResponse = result.data.orders;
            
            // Use pagination from first successful response
            if (result.data.pagination && allOrders.length === 0) {
              combinedPagination = result.data.pagination;
            }
          } else if (Array.isArray(result.data)) {
            ordersFromResponse = result.data;
          } else {
            errors.push(`${result.type} orders: Invalid response structure`);
            return;
          }

          // Transform orders based on type
          const transformedOrders = ordersFromResponse.map(order => {
            // Determine if it's a custom or store order
            const isCustomOrder = result.type === 'custom' || 
                                 (order.order_id && order.order_id.startsWith('CSPLX')) ||
                                 (order.items && order.items[0] && order.items[0].uploaded_designs);
            
            const orderType = isCustomOrder ? 'custom' : 'store';
            
            // Transform items
            const items = Array.isArray(order.items) ? order.items.map(item => ({
              id: `${order.order_id}-${item.productId || item.product_name || 'item'}`,
              name: item.name || item.product_name || 'Product',
              productId: item.productId,
              image: item.image,
              quantity: item.quantity || 1,
              price: item.price || item.product_price || 0,
              size: item.size || 'N/A',
              custom_instructions: item.custom_instructions,
              preview_image: item.preview_image,
              uploaded_designs: item.uploaded_designs || [],
              uploaded_designs_count: item.uploaded_designs_count || 0,
              itemTotal: item.itemTotal || (item.price * item.quantity),
              orderType: orderType
            })) : [];

            return {
              ...order,
              id: order.order_id || order.id,
              orderType: orderType,
              order_id: order.order_id,
              date: order.created_at,
              created_at: order.created_at,
              updated_at: order.updated_at,
              items: items,
              total: order.order_total || order.total || 0,
              status: order.status || 'pending',
              customer_name: order.customer_name || '',
              customer_email: order.customer_email || '',
              customer_phone: order.customer_phone || '',
              customer_address: order.customer_address || '',
              item_count: order.item_count || items.length,
              user_id: order.user_id,
              payment_method: order.payment_method || 'Credit Card'
            };
          });

          allOrders = [...allOrders, ...transformedOrders];
        }
      });

      // Sort all orders by date (newest first)
      const sortedOrders = allOrders.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      setOrders(sortedOrders);
      setPagination(combinedPagination);

     

      // Handle errors
      if (errors.length > 0 && sortedOrders.length === 0) {
        setError(`Failed to load orders: ${errors.join(', ')}`);
      } else if (errors.length > 0) {
        console.warn('Partial data loaded with errors:', errors);
      }

    } catch (err) {
      console.error('Error in fetchAllOrders:', err);
      
      let errorMessage = 'Failed to load orders';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (err.response.status === 404) {
          errorMessage = 'Orders endpoint not found.';
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      
      // For development, use mock data if API fails
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock data for development');
        setOrders(getMockOrders());
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock data that matches your API response structure
  const getMockOrders = () => [
    {
      id: 'CSPLX605234861592',
      orderType: 'custom',
      order_id: 'CSPLX605234861592',
      date: '2026-01-28T13:00:35.951+00:00',
      created_at: '2026-01-28T13:00:35.951+00:00',
      updated_at: '2026-01-28T12:58:48.126491+00:00',
      items: [
        {
          id: 'CSPLX605234861592-item-1',
          name: 'Custom T-Shirt',
          quantity: 1,
          price: 150,
          size: 'M',
          custom_instructions: 'Print logo on front',
          preview_image: null,
          uploaded_designs: [],
          uploaded_designs_count: 0,
          itemTotal: 150,
          orderType: 'custom'
        }
      ],
      total: 150,
      status: 'delivered',
      customer_name: 'David Augustine Duncan',
      customer_email: 'duncan.david600@gmail.com',
      customer_phone: '+233556664343',
      customer_address: 'Ghana, Accra\nBohye Narhman\nGreenwite Flat',
      item_count: 1,
      user_id: '704cc2ce-5276-417f-a27c-9695c7afedf6',
      payment_method: 'Credit Card'
    },
    {
      id: 'PLX563781674546',
      orderType: 'store',
      order_id: 'PLX563781674546',
      date: '2026-01-16T11:43:01.894+00:00',
      created_at: '2026-01-16T11:43:01.894+00:00',
      updated_at: '2026-01-16T11:43:02.004502+00:00',
      items: [
        {
          id: 'PLX563781674546-item-1',
          name: 'Store Product',
          productId: 'prod_001',
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&h=150&fit=crop',
          quantity: 1,
          price: 109.99,
          size: 'L',
          itemTotal: 109.99,
          orderType: 'store'
        }
      ],
      total: 109.99,
      status: 'delivered',
      customer_name: 'David Augustine Duncan',
      customer_email: 'duncan.david600@gmail.com',
      customer_phone: '+233556664343',
      customer_address: 'Ghana, Accra\nBohye Narhman\nGreenwite Flat',
      item_count: 1,
      user_id: '704cc2ce-5276-417f-a27c-9695c7afedf6',
      payment_method: 'Credit Card'
    }
  ];

  useEffect(() => {
    fetchAllOrders();
  }, [pagination.current_page]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-500/10 text-green-600';
      case 'completed': return 'bg-green-500/10 text-green-600';
      case 'shipped': return 'bg-blue-500/10 text-blue-600';
      case 'processing': return 'bg-amber-500/10 text-amber-600';
      case 'pending': return 'bg-yellow-500/10 text-yellow-600';
      case 'cancelled': return 'bg-red-500/10 text-red-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getOrderTypeBadge = (orderType) => {
    switch (orderType) {
      case 'custom':
        return {
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-700',
          icon: <Paintbrush className="w-3 h-3" />,
          label: 'Custom Order'
        };
      case 'store':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          icon: <Store className="w-3 h-3" />,
          label: 'Store Order'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          icon: <ShoppingBag className="w-3 h-3" />,
          label: 'Order'
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const UploadedDesignsGrid = ({ designs }) => {
    if (!designs || designs.length === 0) return null;
    
    return (
      <div className="mt-3">
        <p className="text-xs font-medium text-gray-700 mb-2">Uploaded Designs ({designs.length})</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {designs.map((design, index) => {
            const designUrl = design.image_data || design.url || design.preview_url;
            
            if (!designUrl) return null;
            
            return (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(designUrl, '_blank', 'noopener,noreferrer');
                }}
                className="group relative w-full aspect-square overflow-hidden rounded-lg border border-gray-300 hover:border-purple-500 transition-colors bg-white"
                title="Click to view full size"
              >
                <img
                  src={designUrl}
                  alt={`Design ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="absolute top-1 right-1 w-5 h-5 bg-black/70 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  ↗
                </div>
                <div className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 bg-black/70 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  #{index + 1}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const OrderCard = ({ order }) => {
    const orderTypeBadge = getOrderTypeBadge(order.orderType);
    const isExpanded = expandedOrder === order.order_id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all"
      >
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <div className={`w-2 h-2 rounded-full ${order.orderType === 'custom' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
              <h3 className="font-bold text-gray-900 text-lg">{order.order_id}</h3>
              
              {/* Order Type Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${orderTypeBadge.bgColor} ${orderTypeBadge.textColor}`}>
                {orderTypeBadge.icon}
                <span>{orderTypeBadge.label}</span>
              </span>
              
              {/* Status Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="capitalize">{order.status || 'pending'}</span>
              </span>
            </div>
            
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(order.date || order.created_at)}
            </p>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>{order.item_count} item{order.item_count !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span>Total: {formatCurrency(order.total)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpandedOrder(isExpanded ? null : order.order_id)}
              className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
              title={isExpanded ? 'Hide details' : 'Show details'}
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-6 border-t border-gray-100 space-y-6">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Name:</span> {order.customer_name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span> {order.customer_email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Phone:</span> {order.customer_phone || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Address:</span> {order.customer_address || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Order Items ({order.item_count})</h4>
                  <div className="space-y-4">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-gray-50 rounded-xl">
                          {/* Item Image */}
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 bg-white rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                              {item.preview_image || item.image ? (
                                <img 
                                  src={item.preview_image || item.image} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover cursor-pointer"
                                  onClick={() => window.open(item.preview_image || item.image, '_blank')}
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                  }}
                                />
                              ) : (
                                <Package className="w-8 h-8 text-gray-400" />
                              )}
                            </div>
                          </div>
                          
                          {/* Item Details */}
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 text-lg mb-2">{item.name}</h5>
                                
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                    <ShoppingBag className="w-3 h-3" />
                                    Qty: {item.quantity}
                                  </span>
                                  
                                  {item.size && item.size !== 'N/A' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                                      <Tag className="w-3 h-3" />
                                      Size: {item.size}
                                    </span>
                                  )}
                                  
                                  {item.uploaded_designs_count > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
                                      <Paintbrush className="w-3 h-3" />
                                      {item.uploaded_designs_count} design{item.uploaded_designs_count !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Custom Instructions */}
                                {item.custom_instructions && (
                                  <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                    <p className="text-xs font-medium text-amber-800 mb-1">Custom Instructions:</p>
                                    <p className="text-sm text-amber-900">"{item.custom_instructions}"</p>
                                  </div>
                                )}
                                
                                {/* Uploaded Designs (for custom orders) */}
                                {item.uploaded_designs && item.uploaded_designs.length > 0 && (
                                  <UploadedDesignsGrid designs={item.uploaded_designs} />
                                )}
                              </div>
                              
                              {/* Price */}
                              <div className="text-right">
                                <p className="font-semibold text-gray-900 text-xl">{formatCurrency(item.price)}</p>
                                <p className="text-sm text-gray-500">each</p>
                                <p className="text-sm font-medium text-gray-900 mt-2">
                                  Item Total: {formatCurrency(item.itemTotal || item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-400">
                        No items found for this order
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Order Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Order ID:</span>
                          <span className="font-medium text-gray-900">{order.order_id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Order Type:</span>
                          <span className={`font-medium ${orderTypeBadge.textColor}`}>
                            {orderTypeBadge.label}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Order Date:</span>
                          <span className="font-medium text-gray-900">{formatDate(order.created_at)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="font-medium text-gray-900">{order.payment_method}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Items Total:</span>
                          <span className="font-medium text-gray-900">{formatCurrency(order.total)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Status:</span>
                          <span className={`font-medium capitalize ${getStatusColor(order.status).replace('bg-', 'text-').replace('/10', '')}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-gray-200 mt-2">
                          <div className="flex justify-between font-bold text-gray-900">
                            <span>Order Total:</span>
                            <span className="text-lg">{formatCurrency(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Filter orders based on search term and order type
  const filteredOrders = orders.filter(order => {
    // Search filter
    const matchesSearch = 
      order.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      order.items?.some(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.custom_instructions && item.custom_instructions.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    
    // Order type filter
    const matchesOrderType = orderTypeFilter === 'all' || order.orderType === orderTypeFilter;
    
    return matchesSearch && matchesOrderType;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader className="w-12 h-12 text-gray-400 animate-spin mb-4" />
        <p className="text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Unable to load orders</h3>
        <p className="text-red-500 mb-4 text-center max-w-md">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={() => fetchAllOrders()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">My Orders</h3>
          <p className="text-gray-500 mt-1">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
            {pagination.total_pages > 1 && ` • Page ${pagination.current_page} of ${pagination.total_pages}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Order Type Filters */}
      {orders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setOrderTypeFilter('all')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${orderTypeFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Layers className="w-4 h-4" />
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setOrderTypeFilter('custom')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${orderTypeFilter === 'custom' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
          >
            <Paintbrush className="w-4 h-4" />
            Custom Orders ({orders.filter(o => o.orderType === 'custom').length})
          </button>
          <button
            onClick={() => setOrderTypeFilter('store')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${orderTypeFilter === 'store' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
          >
            <Store className="w-4 h-4" />
            Store Orders ({orders.filter(o => o.orderType === 'store').length})
          </button>
        </div>
      )}

      {/* Show error banner if we have error but also have some orders */}
      {error && orders.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Partial Data Loaded</p>
              <p className="text-sm text-yellow-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-500 mb-2">No orders found</h4>
          <p className="text-gray-400">
            {searchTerm || orderTypeFilter !== 'all' ? 'Try a different search term or filter' : 'Your order history will appear here'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                disabled={pagination.current_page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-gray-600">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                disabled={pagination.current_page === pagination.total_pages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default UnifiedCustomerOrders;