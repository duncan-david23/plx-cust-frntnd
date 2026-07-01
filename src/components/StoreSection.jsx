import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Package, 
  ShoppingBag, 
  Store, 
  Image as ImageIcon,
  X,
  Upload,
  Edit2,
  Save,
  Loader2,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle,
  Crown,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import { PaystackButton } from 'react-paystack';
import toast from 'react-hot-toast';

const StoreSection = () => {
  const [vendorData, setVendorData] = useState(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsViewed, setTermsViewed] = useState(false);
  const [promotingProduct, setPromotingProduct] = useState(null);
  const [promotionData, setPromotionData] = useState(null);

  // Paystack configuration
  const publicKey = 'pk_live_760359367d973660d1cd77f5f1954e00c0cc2e38';
  
  // Store setup form state
  const [storeForm, setStoreForm] = useState({
    storeName: '',
    storeDescription: '',
    whatsapp: ''
  });

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    images: [],
    sizes: '',
    category: '',
    description: ''
  });

  // Fetch vendor data on mount
  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      setIsFetching(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("❌ No active session");
        setIsFetching(false);
        return;
      }

      const accessToken = session.access_token;
      
      const response = await axios.get(
        "https://plx-bckend.onrender.com/api/users/vendor-profile",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      console.log("✅ Vendor profile fetched:", response.data);

      if (response.data && response.data.profile) {
        const profile = response.data.profile;
        
        if (profile.store_name) {
          setVendorData({
            hasStore: true,
            vendorName: profile.store_name,
            whatsapp: profile.store_phone || '',
            description: profile.store_description || '',
            products: []
          });
          
          await fetchVendorProducts(accessToken);
        } else {
          setVendorData({
            hasStore: false,
            products: []
          });
        }
        
        setStoreForm({
          storeName: profile.store_name || '',
          storeDescription: profile.store_description || '',
          whatsapp: profile.store_phone || ''
        });
      } else {
        setVendorData({
          hasStore: false,
          products: []
        });
      }
    } catch (error) {
      console.error("❌ Error fetching vendor data:", error.response?.data || error.message);
      setError("Failed to load store data. Please try again.");
      
      setVendorData({
        hasStore: false,
        products: []
      });
    } finally {
      setIsFetching(false);
    }
  };

  const fetchVendorProducts = async (accessToken) => {
    try {
      const response = await axios.get(
        "https://plx-bckend.onrender.com/api/users/vendor-products",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      console.log("✅ Vendor products fetched:", response.data);

      if (response.data && response.data.products) {
        setVendorData(prev => ({
          ...prev,
          products: response.data.products
        }));
      }
    } catch (error) {
      console.error("❌ Error fetching vendor products:", error.response?.data || error.message);
    }
  };

  const openTermsModal = () => {
    setShowTermsModal(true);
    setTermsViewed(true);
  };

  const acceptTerms = () => {
    setTermsAccepted(true);
    setShowTermsModal(false);
  };

  const handleSetupStore = async () => {
    const { storeName, storeDescription, whatsapp } = storeForm;

    if (!storeName || !whatsapp) {
      setError("Store name and WhatsApp number are required");
      return;
    }

    if (!termsAccepted) {
      setError("You must agree to the Terms and Conditions before creating your store");
      openTermsModal();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("No active session. Please login again.");
        setLoading(false);
        return;
      }

      const accessToken = session.access_token;
      
      const response = await axios.put(
        "https://plx-bckend.onrender.com/api/users/add-vendor-profile",
        {
          store_name: storeName,
          store_description: storeDescription,
          store_phone: whatsapp,
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString()
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      console.log("✅ Store setup successful:", response.data);
      
      setVendorData({
        hasStore: true,
        vendorName: storeName,
        whatsapp: whatsapp,
        description: storeDescription,
        products: []
      });
      
      setShowSetupModal(false);
      setLoading(false);
      
    } catch (error) {
      console.error("❌ Error setting up store:", error.response?.data || error.message);
      setError(error.response?.data?.error || "Failed to set up store. Please try again.");
      setLoading(false);
    }
  };

  const handleEditStore = async () => {
    const { storeName, storeDescription, whatsapp } = storeForm;

    if (!storeName || !whatsapp) {
      setError("Store name and WhatsApp number are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("No active session. Please login again.");
        setLoading(false);
        return;
      }

      const accessToken = session.access_token;
      
      const response = await axios.put(
        "https://plx-bckend.onrender.com/api/users/add-vendor-profile",
        {
          store_name: storeName,
          store_description: storeDescription,
          store_phone: whatsapp
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      console.log("✅ Store updated successfully:", response.data);
      
      setVendorData({
        ...vendorData,
        vendorName: storeName,
        whatsapp: whatsapp,
        description: storeDescription
      });
      
      setShowEditModal(false);
      setLoading(false);
      
    } catch (error) {
      console.error("❌ Error updating store:", error.response?.data || error.message);
      setError(error.response?.data?.error || "Failed to update store. Please try again.");
      setLoading(false);
    }
  };

  const handlePublishProduct = async (e) => {
    e.preventDefault();
    
    const { name, price, category, images } = productForm;
    
    if (!name || !price || !category) {
      setError("Product name, price, and category are required");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("No active session. Please login again.");
        setLoading(false);
        return;
      }

      const accessToken = session.access_token;
      
      const formData = new FormData();
      formData.append('product_name', name);
      formData.append('product_price', price);
      formData.append('product_description', productForm.description || '');
      formData.append('category', category);
      formData.append('sizes', productForm.sizes || '');
      
      if (images && images.length > 0) {
        images.forEach((image) => {
          if (image instanceof File) {
            formData.append('product_images', image);
          }
        });
      }
      
      const response = await axios.post(
        "https://plx-bckend.onrender.com/api/users/add-vendor-product",
        formData,
        {
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );
      
      console.log("✅ Product published:", response.data);
      
      const newProduct = response.data.product;
      
      setVendorData(prev => ({
        ...prev,
        products: [newProduct, ...prev.products]
      }));
      
      setShowProductModal(false);
      setProductForm({
        name: '',
        price: '',
        images: [],
        sizes: '',
        category: '',
        description: ''
      });
      setLoading(false);
      
    } catch (error) {
      console.error("❌ Error publishing product:", error.response?.data || error.message);
      setError(error.response?.data?.error || "Failed to publish product. Please try again.");
      setLoading(false);
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("No active session. Please login again.");
        setLoading(false);
        return;
      }

      const accessToken = session.access_token;
      
      await axios.delete(
        `https://plx-bckend.onrender.com/api/users/delete-vendor-product/${selectedProduct.id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      console.log("✅ Product deleted successfully");
      
      setVendorData(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== selectedProduct.id)
      }));
      
      setShowDeleteModal(false);
      setSelectedProduct(null);
      setLoading(false);
      
    } catch (error) {
      console.error("❌ Error deleting product:", error.response?.data || error.message);
      setError(error.response?.data?.error || "Failed to delete product. Please try again.");
      setLoading(false);
    }
  };

  // Handle promotion with payment
  const handlePromoteClick = (product) => {
    if (product.featured) {
      // If already featured, remove from featured directly
      handlePromoteToFeatured(product);
    } else {
      // If not featured, show payment modal
      setPromotionData(product);
      setShowPaymentModal(true);
    }
  };

  // Actual promotion function
  const handlePromoteToFeatured = async (product) => {
    try {
      setPromotingProduct(product.id);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("No active session. Please login again.");
        setPromotingProduct(null);
        return;
      }

      const accessToken = session.access_token;
      
      const newFeaturedStatus = !product.featured;
      
      const response = await axios.put(
        `https://plx-bckend.onrender.com/api/users/update-product-featured/${product.id}`,
        {
          featured: newFeaturedStatus
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      console.log("✅ Product featured status updated:", response.data);
      
      setVendorData(prev => ({
        ...prev,
        products: prev.products.map(p => 
          p.id === product.id ? { ...p, featured: newFeaturedStatus } : p
        )
      }));
      
      setPromotingProduct(null);
      setShowPaymentModal(false);
      setPromotionData(null);
      
      toast.success(newFeaturedStatus ? 'Product promoted to featured!' : 'Product removed from featured');
      
    } catch (error) {
      console.error("❌ Error updating featured status:", error.response?.data || error.message);
      setError(error.response?.data?.error || "Failed to update featured status. Please try again.");
      setPromotingProduct(null);
    }
  };

  // Paystack payment success handler
  const handlePaymentSuccess = async () => {
    try {
      toast.loading('Processing payment...');
      
      // After successful payment, promote the product
      if (promotionData) {
        await handlePromoteToFeatured(promotionData);
        toast.success('Payment successful! Product is now featured.');
      }
    } catch (error) {
      console.error("Error after payment:", error);
      toast.error('Payment succeeded but failed to promote product. Please contact support.');
    }
  };

  // Paystack payment close handler
  const handlePaymentClose = () => {
    toast.error('Payment cancelled');
    setShowPaymentModal(false);
    setPromotionData(null);
  };

  // Get user email for Paystack
  const getUserEmail = () => {
    return localStorage.getItem('userEmail') || 'customer@example.com';
  };

  // Paystack component props
  const getPaystackProps = () => {
    return {
      email: getUserEmail(),
      amount: 50 * 100, // ₵50.00 in pesewas
      publicKey: publicKey,
      currency: 'GHS',
      text: 'Pay ₵50.00 to Promote',
      onSuccess: handlePaymentSuccess,
      onClose: handlePaymentClose,
    };
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const openEditModal = () => {
    setStoreForm({
      storeName: vendorData.vendorName,
      storeDescription: vendorData.description || '',
      whatsapp: vendorData.whatsapp || ''
    });
    setShowEditModal(true);
    setError(null);
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-t-2 border-[#1a1a1a] rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-[13px] font-light tracking-[0.2em] text-[#666] uppercase">Loading</p>
        </div>
      </div>
    );
  }

  // Error display
  if (error && !vendorData) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <X className="w-12 h-12 mx-auto" strokeWidth={1} />
          </div>
          <h3 className="text-xl font-light text-[#1a1a1a] mb-2">Something went wrong</h3>
          <p className="text-[14px] font-light text-[#666] mb-6">{error}</p>
          <button
            onClick={fetchVendorData}
            className="px-6 py-3 bg-[#1a1a1a] text-white text-[13px] font-light tracking-[0.1em] hover:bg-[#2a2a2a] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No store setup - Show setup button
  if (!vendorData?.hasStore) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <div className="text-center mb-12">
            <div className="w-16 h-16 border border-[#1a1a1a] flex items-center justify-center mx-auto mb-8">
              <Store className="w-8 h-8 text-[#1a1a1a]" strokeWidth={1} />
            </div>
            <h2 className="text-[32px] font-light tracking-[-0.02em] text-[#1a1a1a] mb-3">
              Open Your Store
            </h2>
            <p className="text-[14px] font-light text-[#666] tracking-[0.05em] leading-relaxed">
              Create your presence and start selling<br />streetwear fashion to customers worldwide
            </p>
          </div>
          
          <button
            onClick={() => setShowSetupModal(true)}
            className="w-full py-4 bg-[#2d8a4e] hover:bg-[#236b3d] text-white text-[14px] font-light tracking-[0.1em] transition-all duration-300"
          >
            Set up My Store
          </button>
          
          <p className="text-[11px] font-light text-[#999] tracking-[0.1em] text-center mt-6 uppercase">
            Join thousands of sellers
          </p>
        </div>

        {/* Setup Modal */}
        {showSetupModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
            <div className="bg-white w-full max-w-lg p-10 animate-[fadeIn_0.3s_ease-out] max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-[26px] font-light tracking-[-0.02em] text-[#1a1a1a]">
                    Set Up Your Store
                  </h3>
                  <p className="text-[13px] font-light text-[#666] mt-1 tracking-[0.05em]">
                    Enter your details to get started
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowSetupModal(false);
                    setError(null);
                  }}
                  className="p-2 hover:bg-[#f5f5f5] transition-colors"
                >
                  <X className="w-5 h-5 text-[#1a1a1a]" strokeWidth={1} />
                </button>
              </div>
              
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200">
                  <p className="text-[13px] font-light text-red-600">{error}</p>
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-light text-[#666] uppercase tracking-[0.15em] mb-2">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeForm.storeName}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, storeName: e.target.value }))}
                    placeholder="Your store name"
                    className="w-full px-0 py-3 bg-transparent border-b border-[#e0e0e0] focus:border-[#1a1a1a] outline-none transition-colors text-[15px] font-light"
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-light text-[#666] uppercase tracking-[0.15em] mb-2">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={storeForm.whatsapp}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="+1234567890"
                    className="w-full px-0 py-3 bg-transparent border-b border-[#e0e0e0] focus:border-[#1a1a1a] outline-none transition-colors text-[15px] font-light"
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-light text-[#666] uppercase tracking-[0.15em] mb-2">
                    Store Description
                  </label>
                  <textarea
                    value={storeForm.storeDescription}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, storeDescription: e.target.value }))}
                    placeholder="Tell customers about your store"
                    rows={3}
                    className="w-full px-0 py-3 bg-transparent border-b border-[#e0e0e0] focus:border-[#1a1a1a] outline-none transition-colors text-[15px] font-light resize-none"
                  />
                </div>

                {/* Terms and Conditions Section */}
                <div className="pt-4 border-t border-[#e0e0e0]">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={openTermsModal}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {termsAccepted ? (
                        <CheckCircle className="w-5 h-5 text-[#2d8a4e]" strokeWidth={1.5} />
                      ) : (
                        <div className="w-5 h-5 border-2 border-[#999] rounded-full" />
                      )}
                    </button>
                    <div>
                      <p className="text-[13px] font-light text-[#666]">
                        I agree to the{' '}
                        <button
                          onClick={openTermsModal}
                          className="text-[#2d8a4e] hover:underline font-medium"
                        >
                          Terms and Conditions
                        </button>
                      </p>
                      {termsAccepted && (
                        <p className="text-[11px] font-light text-[#2d8a4e] mt-1">
                          ✓ Terms accepted
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleSetupStore}
                disabled={loading}
                className="w-full mt-8 py-4 bg-[#2d8a4e] hover:bg-[#236b3d] text-white text-[14px] font-light tracking-[0.1em] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Store'}
              </button>
            </div>
          </div>
        )}

        {/* Terms and Conditions Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
            <div className="bg-white w-full max-w-2xl p-10 animate-[fadeIn_0.3s_ease-out] max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-[26px] font-light tracking-[-0.02em] text-[#1a1a1a]">
                    Terms & Conditions
                  </h3>
                  <p className="text-[13px] font-light text-[#666] mt-1 tracking-[0.05em]">
                    Please read carefully before proceeding
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowTermsModal(false);
                  }}
                  className="p-2 hover:bg-[#f5f5f5] transition-colors"
                >
                  <X className="w-5 h-5 text-[#1a1a1a]" strokeWidth={1} />
                </button>
              </div>

              <div className="space-y-4 text-[14px] font-light text-[#444] leading-relaxed">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-medium text-[13px]">
                    ⚠️ Important: Streetwear Fashion Only
                  </p>
                  <p className="text-red-600 text-[13px] mt-1">
                    This platform is exclusively for streetwear fashion clothing. 
                    Any products outside of streetwear fashion will result in 
                    <strong> permanent account deletion</strong> without warning.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-[#1a1a1a] mb-2">1. Platform Purpose</h4>
                  <p className="text-[13px]">
                    PlangeX Marketplace is a dedicated marketplace for streetwear fashion. 
                    This includes hoodies, t-shirts, jerseys, caps, sweatshirts, 
                    and related streetwear apparel. By creating a store, you agree 
                    to list only streetwear fashion items.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-[#1a1a1a] mb-2">2. Prohibited Items</h4>
                  <p className="text-[13px]">
                    The following items are strictly prohibited and will result in 
                    immediate account termination:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-[13px] space-y-1">
                    <li>Non-fashion items (electronics, furniture, etc.)</li>
                    <li>Items that violate intellectual property rights</li>
                    <li>Illegal or restricted items</li>
                    <li>Items not related to streetwear fashion</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-[#1a1a1a] mb-2">3. Account Verification</h4>
                  <p className="text-[13px]">
                    All vendors must provide accurate information including store name 
                    and WhatsApp number. PlangeX reserves the right to verify any 
                    store and its products at any time.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-[#1a1a1a] mb-2">4. Product Quality</h4>
                  <p className="text-[13px]">
                    All products must be accurately described with clear images. 
                    Misleading product listings will result in account suspension.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-[#1a1a1a] mb-2">5. Termination Policy</h4>
                  <p className="text-[13px]">
                    Violation of these terms, especially listing non-streetwear items, 
                    will result in <strong>permanent account deletion</strong> with 
                    no possibility of reinstatement.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#e0e0e0] flex gap-4">
                <button
                  onClick={() => {
                    setShowTermsModal(false);
                    setTermsAccepted(false);
                  }}
                  className="flex-1 py-3 border border-[#e0e0e0] hover:bg-[#f5f5f5] text-[#666] text-[13px] font-light tracking-[0.1em] transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={acceptTerms}
                  className="flex-1 py-3 bg-[#2d8a4e] hover:bg-[#236b3d] text-white text-[13px] font-light tracking-[0.1em] transition-colors"
                >
                  Accept Terms
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Store exists - Show products
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="bg-white border-b border-[#f0f0f0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-[#1a1a1a] flex items-center justify-center">
                <Store className="w-7 h-7 text-white" strokeWidth={1} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-[28px] font-light tracking-[-0.02em] text-[#1a1a1a]">
                    {vendorData.vendorName}
                  </h1>
                  <button
                    onClick={openEditModal}
                    className="p-2 hover:bg-[#f5f5f5] transition-colors rounded-full"
                    title="Edit store details"
                  >
                    <Edit2 className="w-4 h-4 text-[#666]" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-[12px] font-light text-[#666] tracking-[0.05em]">
                    {vendorData.products?.length || 0} products
                  </p>
                  {vendorData.whatsapp && (
                    <p className="text-[12px] font-light text-[#666] tracking-[0.05em]">
                      WhatsApp: {vendorData.whatsapp}
                    </p>
                  )}
                </div>
                {vendorData.description && (
                  <p className="text-[13px] font-light text-[#666] mt-1 tracking-[0.02em]">
                    {vendorData.description}
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setShowProductModal(true)}
              className="group flex items-center gap-3 px-6 py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white text-[12px] font-light tracking-[0.1em] transition-all duration-300"
            >
              <Plus className="w-4 h-4" strokeWidth={1} />
              <span>Publish Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {!vendorData.products || vendorData.products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-[#ccc] mx-auto mb-4" strokeWidth={1} />
            <h3 className="text-[18px] font-light text-[#666] tracking-[0.05em]">No products yet</h3>
            <p className="text-[13px] font-light text-[#999] mt-2 tracking-[0.05em]">
              Start publishing your first product
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vendorData.products.map((product) => (
              <div
                key={product.id}
                className={`group bg-white hover:shadow-[0_2px_20px_rgba(0,0,0,0.06)] w-[280px] transition-all duration-300 overflow-hidden ${
                  product.featured ? 'ring-2 ring-[#2d8a4e]' : 'border border-[#f0f0f0]'
                }`}
              >
                <div className="relative aspect-square bg-[#f5f5f5] overflow-hidden">
                  {product.item_images && product.item_images[0] ? (
                    <img
                      src={product.item_images[0]}
                      alt={product.item_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#f5f5f5]">
                      <ImageIcon className="w-8 h-8 text-[#ccc]" strokeWidth={1} />
                    </div>
                  )}
                  
                  {/* Featured Badge */}
                  {product.featured && (
                    <div className="absolute top-3 left-3 bg-[#2d8a4e] text-white text-[10px] font-light tracking-[0.1em] px-3 py-1.5 uppercase flex items-center gap-1.5 z-10">
                      <Crown className="w-3 h-3" />
                      <span>Featured</span>
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3 bg-[#1a1a1a] text-white text-[10px] font-light tracking-[0.1em] px-3 py-1.5 uppercase z-10">
                    {product.category || 'General'}
                  </div>
                  
                  {/* Action buttons overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 px-4 z-20">
                    <button
                      onClick={() => handleViewProduct(product)}
                      className="p-2.5 bg-white hover:bg-gray-100 transition-colors rounded-full"
                      title="View product"
                    >
                      <Eye className="w-4 h-4 text-[#1a1a1a]" strokeWidth={1.5} />
                    </button>
                    
                    {/* Promote to Featured Button - Black */}
                    <button
                      onClick={() => handlePromoteClick(product)}
                      disabled={promotingProduct === product.id}
                      className={`p-2.5 transition-colors rounded-full ${
                        product.featured 
                          ? 'bg-[#2d8a4e] hover:bg-[#236b3d] text-white' 
                          : 'bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white'
                      }`}
                      title={product.featured ? 'Remove from featured' : 'Promote to featured (₵50.00)'}
                    >
                      {promotingProduct === product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Crown className="w-4 h-4" strokeWidth={1.5} />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteProduct(product)}
                      className="p-2.5 bg-white hover:bg-red-50 transition-colors rounded-full"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[14px] font-light text-[#1a1a1a] tracking-[-0.01em] truncate flex-1">
                      {product.item_name}
                    </h3>
                    {product.featured && (
                      <Sparkles className="w-3.5 h-3.5 text-[#2d8a4e] flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                  
                  <p className="text-[18px] font-light text-[#1a1a1a] mt-1.5 tracking-[-0.01em]">
                    ₵{product.item_price}
                  </p>
                  
                  {product.item_sizes && product.item_sizes.length > 0 && product.item_sizes[0] !== 'One Size' && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {product.item_sizes.slice(0, 3).map((size, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-light text-[#666] tracking-[0.1em] uppercase border border-[#e0e0e0] px-2.5 py-0.5"
                        >
                          {size}
                        </span>
                      ))}
                      {product.item_sizes.length > 3 && (
                        <span className="text-[9px] font-light text-[#666] tracking-[0.1em] uppercase border border-[#e0e0e0] px-2.5 py-0.5">
                          +{product.item_sizes.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-[#f0f0f0]">
                    <button
                      onClick={() => handlePromoteClick(product)}
                      disabled={promotingProduct === product.id}
                      className={`text-[10px] font-medium tracking-[0.1em] transition-colors uppercase flex items-center gap-1.5 px-3 py-1.5 rounded ${
                        product.featured 
                          ? 'bg-[#2d8a4e] text-white hover:bg-[#236b3d]' 
                          : 'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]'
                      }`}
                    >
                      {promotingProduct === product.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Crown className="w-3 h-3" />
                      )}
                      {product.featured ? 'Featured' : 'Promote (₵50)'}
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="text-[10px] font-light text-[#1a1a1a] hover:text-[#666] tracking-[0.1em] transition-colors uppercase"
                      >
                        View
                      </button>
                      <span className="text-[#e0e0e0] text-[10px]">|</span>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="text-[10px] font-light text-red-500 hover:text-red-600 tracking-[0.1em] transition-colors uppercase"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && promotionData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-md p-8 animate-[fadeIn_0.3s_ease-out] rounded-lg">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#2d8a4e]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-[#2d8a4e]" />
              </div>
              <h3 className="text-2xl font-light text-[#1a1a1a] mb-2">
                Promote to Featured
              </h3>
              <p className="text-[14px] font-light text-[#666]">
               Get your product featured on the marketplace for just ₵50.00 for 7 days.
              </p>
            </div>

            <div className="bg-[#f5f5f5] rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                {promotionData.item_images && promotionData.item_images[0] ? (
                  <img 
                    src={promotionData.item_images[0]} 
                    alt={promotionData.item_name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-[#e0e0e0] rounded flex items-center justify-center">
                    <Package className="w-6 h-6 text-[#999]" />
                  </div>
                )}
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-medium text-[#1a1a1a]">{promotionData.item_name}</p>
                  <p className="text-[11px] font-light text-[#666]">₵{promotionData.item_price}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[14px] font-light text-[#666]">
                <span>Promotion fee</span>
                <span className="font-medium text-[#1a1a1a]">₵50.00</span>
              </div>
              <div className="border-t border-[#e0e0e0] pt-3 flex justify-between text-[16px] font-medium text-[#1a1a1a]">
                <span>Total</span>
                <span>₵50.00</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPromotionData(null);
                }}
                className="flex-1 py-3 border border-[#e0e0e0] hover:bg-[#f5f5f5] text-[#666] text-[13px] font-light tracking-[0.1em] transition-colors rounded"
              >
                Cancel
              </button>
              <PaystackButton
                {...getPaystackProps()}
                className="flex-1 py-3 bg-[#2d8a4e] hover:bg-[#236b3d] text-white text-[13px] font-light tracking-[0.1em] transition-colors rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Store Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-lg p-10 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-[26px] font-light tracking-[-0.02em] text-[#1a1a1a]">
                  Edit Store Details
                </h3>
                <p className="text-[13px] font-light text-[#666] mt-1 tracking-[0.05em]">
                  Update your store information
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setError(null);
                }}
                className="p-2 hover:bg-[#f5f5f5] transition-colors"
              >
                <X className="w-5 h-5 text-[#1a1a1a]" strokeWidth={1} />
              </button>
            </div>
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200">
                <p className="text-[13px] font-light text-red-600">{error}</p>
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-light text-[#666] uppercase tracking-[0.15em] mb-2">
                  Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={storeForm.storeName}
                  onChange={(e) => setStoreForm(prev => ({ ...prev, storeName: e.target.value }))}
                  placeholder="Your store name"
                  className="w-full px-0 py-3 bg-transparent border-b border-[#e0e0e0] focus:border-[#1a1a1a] outline-none transition-colors text-[15px] font-light"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-light text-[#666] uppercase tracking-[0.15em] mb-2">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={storeForm.whatsapp}
                  onChange={(e) => setStoreForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="+1234567890"
                  className="w-full px-0 py-3 bg-transparent border-b border-[#e0e0e0] focus:border-[#1a1a1a] outline-none transition-colors text-[15px] font-light"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-light text-[#666] uppercase tracking-[0.15em] mb-2">
                  Store Description
                </label>
                <textarea
                  value={storeForm.storeDescription}
                  onChange={(e) => setStoreForm(prev => ({ ...prev, storeDescription: e.target.value }))}
                  placeholder="Tell customers about your store"
                  rows={3}
                  className="w-full px-0 py-3 bg-transparent border-b border-[#e0e0e0] focus:border-[#1a1a1a] outline-none transition-colors text-[15px] font-light resize-none"
                />
              </div>
            </div>
            
            <button
              onClick={handleEditStore}
              disabled={loading}
              className="w-full mt-8 py-4 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white text-[14px] font-light tracking-[0.1em] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" strokeWidth={1} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-2xl p-10 animate-[fadeIn_0.3s_ease-out] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-[26px] font-light tracking-[-0.02em] text-[#1a1a1a]">
                  Product Details
                </h3>
                <p className="text-[13px] font-light text-[#666] mt-1 tracking-[0.05em]">
                  View product information
                </p>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedProduct(null);
                }}
                className="p-2 hover:bg-[#f5f5f5] transition-colors"
              >
                <X className="w-5 h-5 text-[#1a1a1a]" strokeWidth={1} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Product Images */}
              {selectedProduct.item_images && selectedProduct.item_images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {selectedProduct.item_images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full aspect-square object-cover border border-[#e0e0e0]"
                    />
                  ))}
                </div>
              )}

              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-light text-[#666] uppercase tracking-[0.15em] mb-1">
                    Product Name
                  </label>
                  <p className="text-[18px] font-light text-[#1a1a1a]">
                    {selectedProduct.item_name}
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-light text-[#666] uppercase tracking-[0.15em] mb-1">
                    Price
                  </label>
                  <p className="text-[18px] font-light text-[#1a1a1a]">
                    ₵{selectedProduct.item_price}
                  </p>
                </div>

                {selectedProduct.item_description && (
                  <div>
                    <label className="block text-[11px] font-light text-[#666] uppercase tracking-[0.15em] mb-1">
                      Description
                    </label>
                    <p className="text-[15px] font-light text-[#1a1a1a] leading-relaxed">
                      {selectedProduct.item_description}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-light text-[#666] uppercase tracking-[0.15em] mb-1">
                    Category
                  </label>
                  <p className="text-[15px] font-light text-[#1a1a1a]">
                    {selectedProduct.category || 'General'}
                  </p>
                </div>

                {selectedProduct.item_sizes && selectedProduct.item_sizes.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-light text-[#666] uppercase tracking-[0.15em] mb-1">
                      Sizes
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.item_sizes.map((size, idx) => (
                        <span
                          key={idx}
                          className="text-[12px] font-light text-[#666] uppercase border border-[#e0e0e0] px-4 py-1.5"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-light text-[#666] uppercase tracking-[0.15em] mb-1">
                    Status
                  </label>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-2 text-[13px] font-light ${selectedProduct.featured ? 'text-[#2d8a4e]' : 'text-[#666]'}`}>
                      <span className={`w-2 h-2 rounded-full ${selectedProduct.featured ? 'bg-[#2d8a4e]' : 'bg-[#999]'}`}></span>
                      {selectedProduct.featured ? 'Featured' : 'Standard'}
                    </span>
                    {selectedProduct.featured && (
                      <span className="text-[11px] font-light text-[#2d8a4e] bg-[#e8f5e9] px-3 py-1 rounded-full flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Promoted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#f0f0f0] flex justify-end gap-3">
              <button
                onClick={() => handlePromoteClick(selectedProduct)}
                className={`px-6 py-3 text-[13px] font-light tracking-[0.1em] transition-colors flex items-center gap-2 ${
                  selectedProduct.featured 
                    ? 'bg-[#2d8a4e] hover:bg-[#236b3d] text-white' 
                    : 'bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white'
                }`}
              >
                <Crown className="w-4 h-4" />
                {selectedProduct.featured ? 'Remove from Featured' : 'Promote to Featured (₵50)'}
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedProduct(null);
                }}
                className="px-6 py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white text-[13px] font-light tracking-[0.1em] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-md p-10 animate-[fadeIn_0.3s_ease-out]">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" strokeWidth={1.5} />
              </div>
              <h3 className="text-[24px] font-light tracking-[-0.02em] text-[#1a1a1a] mb-2">
                Delete Product
              </h3>
              <p className="text-[14px] font-light text-[#666] tracking-[0.05em]">
                Are you sure you want to delete "{selectedProduct.item_name}"?<br />
                This action cannot be undone.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200">
                <p className="text-[13px] font-light text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProduct(null);
                  setError(null);
                }}
                className="flex-1 py-3 border border-[#e0e0e0] hover:bg-[#f5f5f5] text-[#666] text-[13px] font-light tracking-[0.1em] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                disabled={loading}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-[13px] font-light tracking-[0.1em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl p-10 animate-[fadeIn_0.3s_ease-out] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-[26px] font-light tracking-[-0.02em] text-[#1a1a1a]">
                  Publish Product
                </h3>
                <p className="text-[13px] font-light text-[#666] mt-1 tracking-[0.05em]">
                  Add a new product to your store
                </p>
              </div>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setError(null);
                }}
                className="p-2 hover:bg-[#f5f5f5] transition-colors"
              >
                <X className="w-5 h-5 text-[#1a1a1a]" strokeWidth={1} />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200">
                <p className="text-[13px] font-light text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handlePublishProduct} className="space-y-7">
              {/* Product Name */}
              <div>
                <label className="block text-[11px] font-light text-[#666] uppercase tracking-[0.15em] mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                  className="w-full px-0 py-3 bg-transparent border-b border-[#e0e0e0] focus:border-[#1a1a1a] outline-none transition-colors text-[15px] font-light"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-[11px] font-light text-[#666] uppercase tracking-[0.15em] mb-2">
                  Price (₵) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={productForm.price}
                  onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-0 py-3 bg-transparent border-b border-[#e0e0e0] focus:border-[#1a1a1a] outline-none transition-colors text-[15px] font-light"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-light text-[#666] uppercase tracking-[0.15em] mb-2">
                  Category *
                </label>
                <select
                  required
                  value={productForm.category}
                  onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-0 py-3 bg-transparent border-b border-[#e0e0e0] focus:border-[#1a1a1a] outline-none transition-colors text-[15px] font-light appearance-none"
                >
                  <option value="" className="text-[#666]">Select a category</option>
                  <option value="Tshirt">Tshirt</option>
                  <option value="Hoodies">Hoodies</option>
                  <option value="Sweatshirt">Sweatshirt</option>
                  <option value="Caps">Caps</option>
                  <option value="Jersey">Jersey</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-light text-[#666] uppercase tracking-[0.15em] mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your product"
                  rows={3}
                  className="w-full px-0 py-3 bg-transparent border-b border-[#e0e0e0] focus:border-[#1a1a1a] outline-none transition-colors text-[15px] font-light resize-none"
                />
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-[11px] font-light text-[#666] uppercase tracking-[0.15em] mb-2">
                  Sizes (Optional)
                </label>
                <input
                  type="text"
                  value={productForm.sizes}
                  onChange={(e) => setProductForm(prev => ({ ...prev, sizes: e.target.value }))}
                  placeholder="S, M, L"
                  className="w-full px-0 py-3 bg-transparent border-b border-[#e0e0e0] focus:border-[#1a1a1a] outline-none transition-colors text-[15px] font-light"
                />
                <p className="text-[10px] font-light text-[#999] tracking-[0.05em] mt-1.5">
                  Comma separated. Leave empty for one size.
                </p>
              </div>

              {/* Images */}
              <div>
                <label className="block text-[11px] font-light text-[#666] uppercase tracking-[0.15em] mb-2">
                  Product Images
                </label>
                <div className="flex flex-wrap gap-4 mb-4">
                  {productForm.images.map((image, index) => {
                    const imageUrl = image instanceof File ? URL.createObjectURL(image) : image;
                    return (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Product ${index + 1}`}
                          className="w-20 h-20 object-cover border border-[#e0e0e0]"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-[#1a1a1a] text-white p-1 hover:bg-[#2a2a2a] transition-colors"
                        >
                          <X className="w-3 h-3" strokeWidth={1} />
                        </button>
                      </div>
                    );
                  })}
                </div>
                
                <label className="w-full border-2 border-dashed border-[#e0e0e0] hover:border-[#1a1a1a] p-8 transition-colors cursor-pointer">
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-[#999] mx-auto mb-2" strokeWidth={1} />
                    <p className="text-[12px] font-light text-[#999] tracking-[0.05em]">
                      Click to upload images (max 3)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </label>
                <p className="text-[10px] font-light text-[#999] mt-2">
                  {productForm.images.length}/3 images uploaded
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white text-[14px] font-light tracking-[0.1em] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  'Publish Product'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreSection;