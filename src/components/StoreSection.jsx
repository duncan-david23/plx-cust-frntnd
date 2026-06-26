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
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const StoreSection = () => {
  const [vendorData, setVendorData] = useState(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  
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
      
      // Fetch vendor profile from your API
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

  const handleSetupStore = async () => {
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
      
      // Remove product from state
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
              Create your presence and start selling<br />to customers worldwide
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
            <div className="bg-white w-full max-w-lg p-10 animate-[fadeIn_0.3s_ease-out]">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {vendorData.products.map((product) => (
              <div
                key={product.id}
                className="group bg-white hover:shadow-[0_2px_20px_rgba(0,0,0,0.04)] transition-all duration-500"
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
                  <div className="absolute top-4 right-4 bg-[#1a1a1a] text-white text-[10px] font-light tracking-[0.1em] px-3 py-1.5 uppercase">
                    {product.category || 'General'}
                  </div>
                  
                  {/* Action buttons overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <button
                      onClick={() => handleViewProduct(product)}
                      className="p-3 bg-white hover:bg-gray-100 transition-colors rounded-full"
                      title="View product"
                    >
                      <Eye className="w-5 h-5 text-[#1a1a1a]" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product)}
                      className="p-3 bg-white hover:bg-red-50 transition-colors rounded-full"
                      title="Delete product"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-[15px] font-light text-[#1a1a1a] tracking-[-0.01em] line-clamp-1">
                    {product.item_name}
                  </h3>
                  <p className="text-[20px] font-light text-[#1a1a1a] mt-2 tracking-[-0.01em]">
                    ₵{product.item_price}
                  </p>
                  
                  {product.item_sizes && product.item_sizes.length > 0 && product.item_sizes[0] !== 'One Size' && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {product.item_sizes.slice(0, 3).map((size, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-light text-[#666] tracking-[0.1em] uppercase border border-[#e0e0e0] px-3 py-1"
                        >
                          {size}
                        </span>
                      ))}
                      {product.item_sizes.length > 3 && (
                        <span className="text-[10px] font-light text-[#666] tracking-[0.1em] uppercase border border-[#e0e0e0] px-3 py-1">
                          +{product.item_sizes.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f0f0f0]">
                    <span className="text-[10px] font-light text-[#999] tracking-[0.1em] uppercase flex items-center gap-2">
                      <ShoppingBag className="w-3 h-3" strokeWidth={1} />
                      Available
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="text-[11px] font-light text-[#1a1a1a] hover:text-[#666] tracking-[0.1em] transition-colors uppercase"
                      >
                        View
                      </button>
                      <span className="text-[#e0e0e0]">|</span>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="text-[11px] font-light text-red-500 hover:text-red-600 tracking-[0.1em] transition-colors uppercase"
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
                  <span className="inline-flex items-center gap-2 text-[13px] font-light text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#f0f0f0] flex justify-end">
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