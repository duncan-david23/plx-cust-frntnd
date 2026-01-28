import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/currency';
import plangex_logo_black from '../assets/PlangeX_logo.png'; 
import { supabase } from '../lib/supabaseClient';
import axios from 'axios';
import { 
  Search, 
  Heart, 
  ShoppingBag,
  X,
  User,
  Truck,
  Shield,
  Check,
  Minus,
  Plus,
  Filter,
  MessageCircle,
  Store,
  Sparkles,
  Package
} from 'lucide-react';

const ProductsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([
    { id: 'all', name: 'All Products' },
    { id: 'tshirts', name: 'T-Shirts' },
    { id: 'hoodies', name: 'Hoodies' },
    { id: 'caps', name: 'Caps' },
    { id: 'sweatshirts', name: 'Sweatshirts' },
    { id: 'accessories', name: 'Accessories' }
  ]);

  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  
  // Get cart items count
  const cartItemsCount = state.cart?.length || 0;

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      try {
        setLoading(true);
        if (!session) {
          console.error('User not logged in');
          setError('Please log in to view products');
          setLoading(false);
          return;
        }

        const token = session.access_token;

        const response = await axios.get('https://plx-bckend.onrender.com/api/users/users-plain-products', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const responseData = response.data;
        
        
        // Transform the fetched data to match your component structure
        let productsData = [];
        
        if (responseData && Array.isArray(responseData)) {
          // Response is already an array
          productsData = responseData;
        } else if (responseData && responseData.products && Array.isArray(responseData.products)) {
          // Response has a products property
          productsData = responseData.products;
        } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
          // Response has a data property
          productsData = responseData.data;
        }
        
        if (Array.isArray(productsData)) {
          const transformedProducts = productsData.map(product => ({
            id: product.id || Math.random().toString(36).substr(2, 9),
            name: product.product_name || product.name || 'Unnamed Product',
            price: parseFloat(product.product_price || product.price || 0),
            image: product.product_images && product.product_images.length > 0 
              ? product.product_images[0] 
              : product.images && product.images.length > 0 
                ? product.images[0] 
                : 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80',
            images: product.product_images || product.images || [],
            category: product.product_categories && product.product_categories.length > 0 
              ? product.product_categories[0].toLowerCase() 
              : 'uncategorized',
            categories: product.product_categories || [],
            sizes: Array.isArray(product.product_sizes) 
              ? product.product_sizes 
              : (product.product_sizes || 'S,M,L').split(',').map(s => s.trim()),
            description: product.product_description || product.description || '',
            deliveryTime: '2-4 weeks',
            stock: parseInt(product.product_stock || product.stock || 0),
            sku: product.skuid || product.sku || '',
            colors: product.product_colors || [],
            status: product.status || 'In Stock',
            created_at: product.created_at,
            updated_at: product.updated_at
          }));
          
          // console.log('Transformed products:', transformedProducts);
          setProducts(transformedProducts);
          
          // Extract unique categories from fetched products
          const uniqueCategories = new Set();
          transformedProducts.forEach(product => {
            if (product.category && product.category !== 'uncategorized') {
              uniqueCategories.add(product.category);
            }
            if (product.categories && Array.isArray(product.categories)) {
              product.categories.forEach(cat => {
                if (cat && typeof cat === 'string') {
                  uniqueCategories.add(cat.toLowerCase());
                }
              });
            }
          });
          
          // Create dynamic categories list
          const dynamicCategories = [
            { id: 'all', name: 'All Products' },
            ...Array.from(uniqueCategories).map(cat => ({
              id: cat,
              name: cat.charAt(0).toUpperCase() + cat.slice(1)
            }))
          ];
          
          setCategories(dynamicCategories);
        } else {
          console.warn('No products data found or data is not an array');
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error.response?.data?.error || error.message || 'Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and search functionality
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category === selectedCategory || 
        (product.categories && product.categories.includes(selectedCategory))
      );
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(product =>
        (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name-asc':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      default:
        // Keep original order or sort by ID
        filtered.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
    }

    return filtered;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const startCustomization = (product, selectedSizes, quantity, customInstructions) => {
    dispatch({
      type: 'START_CUSTOMIZATION',
      payload: {
        product,
        sizes: selectedSizes,
        quantity,
        customInstructions
      }
    });

    navigate('/customize');
  };

  const ProductCard = ({ product }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group cursor-pointer border border-gray-100 p-[20px] rounded-lg"
      onClick={() => setSelectedProduct(product)}
    >
      {/* Stock indicator */}
      {product.stock < 10 && product.stock > 0 && (
        <div className="absolute top-4 left-4 z-10 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded">
          Low Stock
        </div>
      )}
      {product.stock === 0 && (
        <div className="absolute top-4 left-4 z-10 bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded">
          Sold Out
        </div>
      )}

      <div className="relative overflow-hidden rounded-lg mb-4">
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
          src={product.image}
          alt={product.name}
          className="w-full h-80 object-contain"
        />
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/20 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            initial={{ y: 10, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            className="w-full bg-white text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Quick View
          </motion.button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium text-gray-900 text-lg">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-light text-gray-900">{formatCurrency(product.price)}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Heart 
              className={`w-5 h-5 ${favorites.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
            />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{product.sizes.length} sizes</p>
          <div className="flex items-center space-x-1 text-gray-500">
            <Package className="w-4 h-4" />
            <span className="text-xs">{product.stock} in stock</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const ProductModal = ({ product, onClose }) => {
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [customInstructions, setCustomInstructions] = useState('');
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    React.useEffect(() => {
      setSelectedSizes([]);
      setQuantity(1);
      setCustomInstructions('');
      setActiveImageIndex(0);
    }, [product]);

    const handleQuantityChange = (newQuantity) => {
      const maxQuantity = product?.stock || 1;
      setQuantity(Math.max(1, Math.min(maxQuantity, newQuantity)));
    };

    const toggleSizeSelection = (size) => {
      setSelectedSizes(prev => {
        if (prev.includes(size)) {
          return prev.filter(s => s !== size);
        } else {
          return [...prev, size];
        }
      });
    };

    const handleCustomize = () => {
      if (selectedSizes.length === 0) {
        alert('Please select at least one size');
        return;
      }
      
      startCustomization(product, selectedSizes, quantity, customInstructions.trim());
      onClose();
    };

    const handleThumbnailClick = (index, e) => {
      e.stopPropagation();
      setActiveImageIndex(index);
    };

    if (!product) return null;

    const productImages = product.images && product.images.length > 0 
      ? product.images 
      : [product.image || 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80'];

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid lg:grid-cols-2 gap-8 p-8">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-gray-50">
                  <img
                    src={productImages[activeImageIndex]}
                    alt={product.name}
                    className="w-full h-96 object-contain"
                  />
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Thumbnail Images */}
                {productImages.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {productImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={(e) => handleThumbnailClick(index, e)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          index === activeImageIndex 
                            ? 'border-gray-900' 
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img 
                          src={image} 
                          alt={`View ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-light text-gray-900 mb-2">{product.name}</h1>
                  <p className="text-2xl font-light text-gray-900 mb-4">{formatCurrency(product.price)}</p>
                  
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Package className="w-4 h-4" />
                      <span>{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Truck className="w-4 h-4" />
                      <span>2-4 weeks</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed">{product.description}</p>

                {/* Colors display */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Available Colors</h3>
                    <div className="flex space-x-2">
                      {product.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Multiple Size Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Select Sizes</h3>
                    <button className="text-sm text-gray-500 hover:text-gray-700">Size Guide</button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {product.sizes.map((size, index) => (
                      <button
                        key={index}
                        onClick={() => product.stock > 0 && toggleSizeSelection(size)}
                        className={`py-3 border rounded-lg text-center transition-all ${
                          selectedSizes.includes(size)
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        } ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={product.stock === 0}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {selectedSizes.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {selectedSizes.join(', ')}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Quantity</h3>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1 || product.stock === 0}
                      className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock || product.stock === 0}
                      className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Additional Custom Information */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Additional Instructions (Optional)</span>
                  </h3>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Any special instructions for customization? Design preferences, placement notes, etc."
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    maxLength={500}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {customInstructions.length}/500 characters
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={selectedSizes.length === 0 || product.stock === 0}
                    className={`w-full py-4 rounded-lg font-medium transition-all ${
                      selectedSizes.length > 0 && product.stock > 0
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    onClick={handleCustomize}
                  >
                    {product.stock === 0 
                      ? 'Out of Stock' 
                      : selectedSizes.length === 0 
                        ? 'Select at least one size to continue' 
                        : `Customize ${selectedSizes.length} size${selectedSizes.length > 1 ? 's' : ''}`
                    }
                  </motion.button>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-center space-x-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Truck className="w-4 h-4" />
                    <span>Free delivery over GHC 500</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Shield className="w-4 h-4" />
                    <span>Secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const FiltersModal = () => (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={() => setShowFilters(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 sm:space-x-12">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <img src={plangex_logo_black} alt="Plangex Logo" className="w-[90px] h-[30px]" />
              </div>
              
              {/* Categories */}
              <nav className="hidden lg:flex space-x-8">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`py-2 text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'text-gray-900 border-b-2 border-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm w-48 lg:w-64"
                />
              </div>

              {/* Visit Custom Store Button */}
              <button
                onClick={() => window.open('https://store.plangex.com/store', '_blank')}
                className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                <Sparkles className="w-4 h-4" />
                <span>Visit Store</span>
              </button>
              
              {/* Cart Button with Count */}
              <button 
                onClick={() => navigate('/cart')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                title="Cart"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount > 9 ? '9+' : cartItemsCount}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => navigate('/user-account')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Account"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Search and Categories */}
          <div className="lg:hidden mt-4 space-y-3">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              />
            </div>

            {/* Mobile Categories and Store Button */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2 overflow-x-auto pb-2 flex-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`whitespace-nowrap px-3 py-2 text-sm rounded-full border transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              
              {/* Mobile Store Button */}
              <button
                onClick={() => window.open('https://store.plangex.com/store', '_blank')}
                className="ml-2 flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
              >
                <Store className="w-4 h-4" />
                <span>Store</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-light text-gray-900 mb-1 sm:mb-2">
              {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-sm sm:text-base text-gray-500">{filteredProducts.length} products found</p>
          </div>
          
          {/* Desktop Sort */}
          <div className="hidden lg:flex items-center space-x-4">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-0 text-gray-900 text-sm focus:ring-0"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Clear all filters
              </button>
              <button
                onClick={() => window.open('https://store.plangex.com/store', '_blank')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
              >
                <Store className="w-4 h-4" />
                <span>Browse Store</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Store Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Looking for ready-to-wear fashion?</h2>
              <p className="text-gray-300">Visit our store for premium apparel bundles</p>
            </div>
            <button
              onClick={() => window.open('https://store.plangex.com/store', '_blank')}
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Visit Plangex Store</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />

      {/* Filters Modal */}
      <FiltersModal />
    </div>
  );
};

export default ProductsPage;