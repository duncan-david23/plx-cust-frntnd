import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { products } from '../data/products';
import { formatCurrency } from '../utils/currency';
import plangex_logo_black from '../assets/PlangeX_logo.png'; 
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
  MessageCircle
} from 'lucide-react';

const ProductsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  
  // Get cart items count
  const cartItemsCount = state.cart?.length || 0;

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'tshirts', name: 'T-Shirts' },
    { id: 'hoodies', name: 'Hoodies' },
    { id: 'caps', name: 'Caps' },
    { id: 'sweatshirts', name: 'Sweatshirts' },
    { id: 'accessories', name: 'Accessories' }
  ];

  // Filter and search functionality
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        filtered.sort((a, b) => a.price - b.price);
    }

    return filtered;
  }, [selectedCategory, searchQuery, sortBy]);

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
      <div className="relative overflow-hidden rounded-lg mb-4">
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
          src={product.image}
          alt={product.name}
          className="w-full h-80 object-contain"
        />
        
        {/* <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-all duration-300"
        >
          <Heart 
            className={`w-5 h-5 transition-all ${
              favorites.has(product.id) 
                ? 'fill-red-500 text-red-500 scale-110' 
                : 'text-gray-600'
            }`} 
          />
        </button> */}

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
        </div>
        <p className="text-sm text-gray-500">{product.sizes.length} sizes</p>
      </div>
    </motion.div>
  );

  const ProductModal = ({ product, onClose }) => {
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [customInstructions, setCustomInstructions] = useState('');

    React.useEffect(() => {
      setSelectedSizes([]);
      setQuantity(1);
      setCustomInstructions('');
    }, [product]);

    const handleQuantityChange = (newQuantity) => {
      setQuantity(Math.max(1, newQuantity));
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
      startCustomization(product, selectedSizes, quantity, customInstructions.trim());
      onClose();
    };

    if (!product) return null;

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
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-light text-gray-900 mb-2">{product.name}</h1>
                  <p className="text-2xl font-light text-gray-900 mb-4">{formatCurrency(product.price)}</p>
                  
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Truck className="w-4 h-4" />
                      <span>{product.deliveryTime}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed">{product.description}</p>

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
                        onClick={() => toggleSizeSelection(size)}
                        className={`py-3 px-4 border rounded-lg text-center transition-all ${
                          selectedSizes.includes(size)
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
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
                      className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
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
                    disabled={selectedSizes.length === 0}
                    className={`w-full py-4 rounded-lg font-medium transition-all ${
                      selectedSizes.length > 0
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    onClick={handleCustomize}
                  >
                    {selectedSizes.length === 0 
                      ? 'Select at least one size to continue' 
                      : `Customize ${selectedSizes.length} size${selectedSizes.length > 1 ? 's' : ''}`
                    }
                  </motion.button>
                  
                  {/* <button className="w-full border border-gray-300 py-4 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                    <Heart className="w-5 h-5" />
                    <span>Add to Wishlist</span>
                  </button> */}
                </div>

                {/* Features */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">Features</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-center space-x-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Truck className="w-4 h-4" />
                    <span>Free delivery over GHC 500</span>
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
                </select>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

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

              {/* <button 
                onClick={() => setShowFilters(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Filters"
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              </button> */}
              
              {/* <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block" title="Favorites">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              </button> */}
              
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
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors "
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

            {/* Mobile Categories */}
            <div className="flex space-x-4 overflow-x-auto pb-2">
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
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

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