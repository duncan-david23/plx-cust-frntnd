import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Image as ImageIcon, Type, Package, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import { PaystackButton } from 'react-paystack';
import toast from 'react-hot-toast';
import { useUser } from '../context/UserContext';

const CartPage = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { user } = useUser();
  
  // States
  const [includeDelivery, setIncludeDelivery] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  const publicKey = 'pk_live_760359367d973660d1cd77f5f1954e00c0cc2e38';
  const notify = () => toast.error('Transaction was not completed, please try again.');

  // Fetch user profile to check if complete
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoadingProfile(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoadingProfile(false);
          return;
        }
        
        const accessToken = session.access_token;
        const response = await axios.get(
          'https://plx-bckend.onrender.com/api/users/account-profile',
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        
        if (response.data) {
          setUserProfile(response.data);
          // Check if profile is complete (has name and phone)
          const hasName = response.data.full_name && response.data.full_name.trim() !== '';
          const hasPhone = response.data.phone_number && response.data.phone_number.trim() !== '';
          setProfileComplete(hasName && hasPhone);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Unable to load your profile');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    dispatch({
      type: 'UPDATE_CART_ITEM_QUANTITY',
      payload: { itemId, quantity: newQuantity }
    });
  };

  const removeFromCart = (itemId) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: itemId
    });
  };

  const subtotal = state.cart.reduce((total, item) => {
    return total + (item.productPrice * item.quantity);
  }, 0);

  // Calculate shipping - FREE if subtotal > 500 AND user includes delivery
  const isEligibleForFreeShipping = subtotal > 500;
  
  // For display purposes only - actual fee will be determined based on location
  const estimatedDeliveryFee = 40; // Just for UI display
  const shipping = includeDelivery ? 
    (isEligibleForFreeShipping ? 0 : estimatedDeliveryFee) : 
    0;

  const total = subtotal + shipping;

  // Check if user can proceed to payment
  const canProceedToPayment = () => {
    if (loadingProfile) return false;
    if (!profileComplete) return false;
    return true;
  };

  // Custom Paystack button click handler
  const handlePaystackClick = (e) => {
    if (!canProceedToPayment()) {
      e.preventDefault();
      if (!profileComplete) {
        toast.error('Please complete your profile setup before making payment');
        alert('Please complete your profile setup:\n\n1. Go to your profile page\n2. Fill in your full name and phone number\n3. Save your profile\n4. Return to cart to complete payment');
        navigate('/profile');
      }
      return;
    }
  };

  const componentProps = {
    email: user?.email || '',
    amount: total * 100,
    publicKey: publicKey,
    currency: 'GHS',
    text: 'Proceed to Checkout',
    onSuccess: async () => {
      try {
        await submitOrderToBackend();
        toast.success('Order placed successfully!');
        navigate('/thank-you');
      } catch (error) {
        // Payment succeeded but order submission failed
        toast.error('Payment succeeded but order submission failed. Contact support.');
        console.error('Order submission error after payment:', error);
      }
    },
    onClose: () => {
      notify();
    }
  };

  // Function to submit order to backend
  const submitOrderToBackend = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please login to continue');
        return;
      }
      
      const accessToken = session.access_token;

      // Prepare order items
      const order_items = state.cart.map(item => ({
        product_name: item.productName,
        product_price: item.productPrice,
        quantity: item.quantity,
        size: item.size,
        custom_instructions: item.customInstructions || '',
        uploaded_designs: item.uploadedDesigns?.map(design => ({
          id: design.id,
          name: design.name,
          type: design.type,
          is_text: design.isText,
          text_content: design.isText ? design.text : null,
          font_size: design.isText ? design.fontSize : null,
          font_family: design.isText ? design.fontFamily : null,
          text_color: design.isText ? design.color : null,
          image_data: !design.isText ? design.url : null,
        })) || [],
        uploaded_designs_count: item.uploadedDesignsCount || 0,
        preview_image: item.previewImage,
        total_price: item.price,
        timestamp: new Date().toISOString()
      }));

      const order_total = total;
      const item_count = state.cart.length;
      const delivery_included = includeDelivery;
      const delivery_paid = includeDelivery;

      // Submit order
      const response = await axios.post(
        'https://plx-bckend.onrender.com/api/users/create-order',
        { 
          order_items, 
          order_total, 
          item_count,
          delivery_included,
          delivery_paid,
          delivery_fee: includeDelivery ? shipping : 0,
          free_shipping_applied: isEligibleForFreeShipping && includeDelivery,
          customer_name: userProfile?.full_name,
          customer_phone: userProfile?.phone_number
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      // Clear cart after successful order
      dispatch({ type: 'CLEAR_CART' });
      localStorage.removeItem('cart');
      
      return response.data;
      
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  if (state.cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-light text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Start customizing some products!</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="flex items-center space-x-2 sm:space-x-4 mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/products')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-light text-gray-900">Shopping Cart</h1>
          <span className="bg-gray-900 text-white text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full">
            {state.cart.length} {state.cart.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {state.cart.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                  {/* Customized Product Preview Image */}
                  <div className="flex-shrink-0 w-full sm:w-32 h-48 sm:h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {item.previewImage ? (
                      <img
                        src={item.previewImage}
                        alt={`Customized ${item.productName}`}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <ShoppingBag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-500">Custom Preview</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        Customized {item.productName}
                      </h3>
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(item.productPrice * item.quantity)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                      <div className="space-y-1">
                        <p><span className="font-medium">Unit Price:</span> {formatCurrency(item.productPrice)}</p>
                        <p><span className="font-medium">Quantity:</span> {item.quantity}</p>
                        <p><span className="font-medium">Size:</span> {item.size}</p>
                      </div>
                    </div>
                    
                    {item.customInstructions && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm font-medium text-blue-900 mb-1">Custom Instructions:</p>
                        <p className="text-sm text-blue-800">{item.customInstructions}</p>
                      </div>
                    )}
                    
                    {item.uploadedDesigns.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Applied Designs:</p>
                        <div className="flex flex-wrap gap-2">
                          {item.uploadedDesigns.slice(0, 4).map(design => (
                            <div 
                              key={design.id} 
                              className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-md"
                              title={design.name}
                            >
                              {design.isText ? (
                                <>
                                  <Type className="w-3 h-3 text-blue-600" />
                                  <span className="text-xs text-gray-600 truncate max-w-[80px]">
                                    "{design.text}"
                                  </span>
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="w-3 h-3 text-purple-600" />
                                  <span className="text-xs text-gray-600 truncate max-w-[80px]">
                                    {design.name}
                                  </span>
                                </>
                              )}
                            </div>
                          ))}
                          {item.uploadedDesigns.length > 4 && (
                            <div className="bg-gray-100 px-2 py-1 rounded-md">
                              <span className="text-xs text-gray-500">
                                +{item.uploadedDesigns.length - 4} more
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 mr-2">Update Quantity:</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 lg:order-last">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-4 sm:top-6">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({state.cart.length} {state.cart.length === 1 ? 'item' : 'items'})</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                
                {/* Delivery Option */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Package className="w-5 h-5 text-gray-700" />
                      <span className="font-medium text-gray-900">Delivery Option</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {includeDelivery ? 'Pay Now' : 'Pay on Delivery'}
                      </span>
                      <button
                        onClick={() => setIncludeDelivery(!includeDelivery)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          includeDelivery ? 'bg-black' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            includeDelivery ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-2">
                    {includeDelivery ? (
                      <>
                        <p className="text-gray-700">
                          <span className="font-medium">Delivery fee included in total:</span> 
                          {isEligibleForFreeShipping ? ' FREE' : ` Estimated fee`}
                        </p>
                        {isEligibleForFreeShipping ? (
                          <p className="text-green-600 bg-green-50 p-2 rounded">
                            🎉 Free delivery applied!
                          </p>
                        ) : (
                          <p className="text-gray-500">
                            Add {formatCurrency(500 - subtotal)} more for free delivery
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-gray-700">
                          <span className="font-medium">Pay delivery fee when order arrives</span>
                        </p>
                        <p className="text-gray-500 text-xs">
                          Delivery fee varies based on your location and will be collected in cash upon delivery
                        </p>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Delivery Fee Display */}
                <div className="flex justify-between text-gray-600 border-t border-gray-200 pt-4">
                  <span>
                    {includeDelivery ? 
                      (isEligibleForFreeShipping ? 'Delivery Fee' : 'Estimated Delivery Fee') : 
                      'Delivery Fee'
                    }
                  </span>
                  <span className={isEligibleForFreeShipping && includeDelivery ? 'text-green-600 font-medium' : ''}>
                    {includeDelivery ? 
                      (isEligibleForFreeShipping ? 'FREE' : 'Pay Now') : 
                      'Pay on Delivery'
                    }
                  </span>
                </div>
                
                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-medium text-gray-900">
                    <span>Total Amount</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {includeDelivery ? 
                      (isEligibleForFreeShipping ? 
                        'Includes FREE delivery' : 
                        'Includes estimated delivery fee'
                      ) : 
                      'Excludes delivery fee (Pay upon delivery)'
                    }
                  </p>
                  {!includeDelivery && !isEligibleForFreeShipping && (
                    <p className="text-xs text-gray-400 mt-1">
                      Delivery fee will be determined based on your location
                    </p>
                  )}
                </div>
              </div>

              {/* Profile Check Warning */}
              {!loadingProfile && !profileComplete && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Complete Your Profile</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Please add your full name and phone number to your profile before making payment.
                      </p>
                      <button
                        onClick={() => navigate('/profile')}
                        className="mt-2 text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 transition-colors"
                      >
                        Go to Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Design Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Design Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Designs Applied:</span>
                    <span className="font-medium">
                      {state.cart.reduce((sum, item) => sum + item.uploadedDesignsCount, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Customized Items:</span>
                    <span className="font-medium">
                      {state.cart.filter(item => item.uploadedDesignsCount > 0).length}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    All designs are stored and ready for production
                  </div>
                </div>
              </div>

              {/* Paystack Button with custom onClick */}
              <div onClick={handlePaystackClick}>
                <PaystackButton 
                  {...componentProps} 
                  className={`w-full bg-black text-white py-4 rounded-lg font-semibold mt-6 hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 ${
                    !canProceedToPayment() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              {loadingProfile ? (
                <p className="text-xs text-gray-500 text-center mt-4">
                  Checking profile...
                </p>
              ) : !profileComplete ? (
                <p className="text-xs text-red-500 text-center mt-4">
                  Please complete your profile to proceed with payment
                </p>
              ) : (
                <p className="text-xs text-gray-500 text-center mt-4">
                  {includeDelivery ? 
                    (isEligibleForFreeShipping ? 
                      'Your order includes free delivery' :
                      'Your order includes estimated delivery fee'
                    ) : 
                    'Delivery fee will be determined based on your location and paid upon delivery'
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;