import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft, Image as ImageIcon, Type } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import {PaystackButton} from 'react-paystack';
import toast from 'react-hot-toast';
import { use } from 'react';
import { useUser } from '../context/UserContext';

const CartPage = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { user } = useUser();

  const publicKey = 'pk_test_3bdc97b024233bb522a068bfefbbe9292322b0fa';
  const notify = () => toast.error('Transaction was not completed, please try again.');


   

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

  const proceedToCheckout = () => {
    // navigate('/checkout');
    alert('Proceeding to checkout (functionality to be implemented)');
  };

  const subtotal = state.cart.reduce((total, item) => {
    return total + (item.productPrice * item.quantity);
  }, 0);

  const shipping = subtotal > 500 ? 0 : 35; // GHC 35 shipping
  const total = subtotal + shipping;

  







const componentProps = {
    email: user.email,
    amount: total * 100, // Paystack expects amount in kobo
    publicKey: publicKey,
    currency: 'GHS',
    text: 'Proceed to Checkout',
    onSuccess: () => {
      toast.success('Order placed successfully!');
      submitOrderToBackend();
      navigate('/thank-you');
    },
    onClose: () => {
      notify();
    }

}

// Function to submit order to backend

const submitOrderToBackend = async () => {
  try {
    // Get auth token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("❌ No active session");
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

    const order_total = state.cart.reduce((sum, item) => sum + item.price, 0) + shipping;
    const item_count = state.cart.length;

    // Submit order
    const response = await axios.post(
      'https://plx-bckend.onrender.com/api/users/create-order',
      { order_items, order_total, item_count },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

       dispatch({ type: 'CLEAR_CART' });
    
    // Also clear from localStorage if you're using it
    localStorage.removeItem('cart');
    
   
    
    return response.data;
    
   
  } catch (error) {
    console.error('Error:', error);
   toast.error('Failed to submit order. Please complete your profile setup.');
   alert('Failed to submit order. Please complete your profile setup.');
    throw error;
  }
};



  // Function to view design details
  const viewDesignDetails = (designs) => {
    const designList = designs.map(design => 
      design.isText 
        ? `📝 Text: "${design.text}" (${design.fontSize}px, ${design.color})`
        : `🖼️ Image: ${design.name}`
    ).join('\n');
    
    alert(`Designs Applied:\n\n${designList}`);
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
                    
                    {/* Product Specifications */}
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                      <div className="space-y-1">
                        <p><span className="font-medium">Unit Price:</span> {formatCurrency(item.productPrice)}</p>
                        <p><span className="font-medium">Quantity:</span> {item.quantity}</p>
                        <p><span className="font-medium">Size:</span> {item.size}</p>
                      </div>
                      <div className="space-y-1">
                        {/* <p>
                          <span className="font-medium">Designs:</span> {item.uploadedDesignsCount}
                          {item.uploadedDesignsCount > 0 && (
                            <button
                              onClick={() => viewDesignDetails(item.uploadedDesigns)}
                              className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                            >
                              View Details
                            </button>
                          )}
                        </p> */}
                        {/* <div className="flex items-center space-x-1">
                          <span className="font-medium">Status:</span>
                          <span className="text-green-600">Ready for production</span>
                        </div> */}
                      </div>
                    </div>
                    
                    {/* Custom Instructions */}
                    {item.customInstructions && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm font-medium text-blue-900 mb-1">Custom Instructions:</p>
                        <p className="text-sm text-blue-800">{item.customInstructions}</p>
                      </div>
                    )}
                    
                    {/* Design Preview (Mini thumbnails) */}
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
                    
                    {/* Quantity Controls and Actions */}
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
                      
                      <div className="flex items-center space-x-2">
                        {/* <button
                          onClick={() => viewDesignDetails(item.uploadedDesigns)}
                          disabled={item.uploadedDesigns.length === 0}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            item.uploadedDesigns.length === 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          }`}
                        >
                          View Designs
                        </button> */}
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
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
                </div>
                
                {shipping === 0 ? (
                  <p className="text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                    🎉 Free shipping applied! You saved {formatCurrency(35)}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Add {formatCurrency(500 - subtotal)} more for free shipping
                  </p>
                )}
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-medium text-gray-900">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Including any applicable taxes
                  </p>
                </div>
              </div>

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

              {/* <button
                onClick={submitOrderToBackend}
                className="w-full bg-black text-white py-4 rounded-lg font-semibold mt-6 hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </button> */}

              <PaystackButton {...componentProps} className="w-full bg-black text-white py-4 rounded-lg font-semibold mt-6 hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2" />

              <p className="text-xs text-gray-500 text-center mt-4">
                Your customized designs will be sent to production after payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;