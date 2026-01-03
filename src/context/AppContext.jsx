import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

// Helper function to safely store data without base64 images
const sanitizeCartForStorage = (cart) => {
  return cart.map(item => ({
    ...item,
    // Remove base64 preview image if we have Cloudinary URL
    originalPreviewBase64: item.previewImage?.startsWith('https://res.cloudinary.com') 
      ? null 
      : item.originalPreviewBase64,
    // Sanitize uploaded designs
    uploadedDesigns: item.uploadedDesigns.map(design => ({
      ...design,
      // Remove base64 URLs if we have Cloudinary URL
      url: design.cloudinaryUrl || design.url,
      originalBase64: null, // Always remove original base64
      cloudinaryUrl: design.cloudinaryUrl || null
    }))
  }));
};

// Get initial state from localStorage
const getInitialState = () => {
  try {
    const savedCart = localStorage.getItem('userCart');
    const savedOrders = localStorage.getItem('userOrders');
    
    // Parse and sanitize cart data on load
    let cart = [];
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      // Remove any base64 data that might have been stored previously
      cart = parsedCart.map(item => ({
        ...item,
        originalPreviewBase64: null, // Clear base64 on load
        uploadedDesigns: item.uploadedDesigns?.map(design => ({
          ...design,
          originalBase64: null // Clear base64 on load
        })) || []
      }));
    }

    return {
      currentProduct: null,
      customization: {
        selectedProduct: null,
        selectedSizes: [],
        quantity: 1,
        customInstructions: '',
        uploadedDesigns: [],
        activeDesign: null,
        productSize: 'M'
      },
      cart,
      orders: savedOrders ? JSON.parse(savedOrders) : []
    };
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return {
      currentProduct: null,
      customization: {
        selectedProduct: null,
        selectedSizes: [],
        quantity: 1,
        customInstructions: '',
        uploadedDesigns: [],
        activeDesign: null,
        productSize: 'M'
      },
      cart: [],
      orders: []
    };
  }
};

const initialState = getInitialState();

function appReducer(state, action) {
  let newState;
  
  switch (action.type) {
    case 'SET_CURRENT_PRODUCT':
      newState = {
        ...state,
        currentProduct: action.payload
      };
      break;

    case 'START_CUSTOMIZATION':
      newState = {
        ...state,
        customization: {
          ...initialState.customization,
          selectedProduct: action.payload.product,
          selectedSizes: action.payload.sizes,
          quantity: action.payload.quantity,
          customInstructions: action.payload.customInstructions,
          productSize: action.payload.sizes[0] || 'M'
        }
      };
      break;

    case 'UPDATE_CUSTOMIZATION':
      newState = {
        ...state,
        customization: {
          ...state.customization,
          ...action.payload
        }
      };
      break;

    case 'ADD_DESIGN':
      const newDesigns = [...state.customization.uploadedDesigns, action.payload];
      newState = {
        ...state,
        customization: {
          ...state.customization,
          uploadedDesigns: newDesigns,
          activeDesign: action.payload.id
        }
      };
      break;

    case 'UPDATE_DESIGN':
      newState = {
        ...state,
        customization: {
          ...state.customization,
          uploadedDesigns: state.customization.uploadedDesigns.map(design =>
            design.id === action.payload.id
              ? { ...design, ...action.payload.updates }
              : design
          )
        }
      };
      break;

    case 'REMOVE_DESIGN':
      const filteredDesigns = state.customization.uploadedDesigns.filter(
        design => design.id !== action.payload
      );
      newState = {
        ...state,
        customization: {
          ...state.customization,
          uploadedDesigns: filteredDesigns,
          activeDesign: state.customization.activeDesign === action.payload 
            ? filteredDesigns[0]?.id || null
            : state.customization.activeDesign
        }
      };
      break;

    case 'SET_ACTIVE_DESIGN':
      newState = {
        ...state,
        customization: {
          ...state.customization,
          activeDesign: action.payload
        }
      };
      break;

    case 'ADD_TO_CART':
      // Prepare design data for storage - Cloudinary URLs only
      const designsForCart = state.customization.uploadedDesigns.map(design => {
        const designData = {
          id: design.id,
          name: design.name,
          type: design.type,
          isText: design.isText,
          position: design.position,
          scale: design.scale,
          rotation: design.rotation,
          opacity: design.opacity,
          visible: design.visible,
          uploadDate: design.uploadDate
        };

        if (design.isText) {
          return {
            ...designData,
            text: design.text,
            fontSize: design.fontSize,
            fontFamily: design.fontFamily,
            color: design.color,
            url: null,
            cloudinaryUrl: null,
            originalBase64: null
          };
        } else {
          // Use Cloudinary URL if available, otherwise use the URL
          const urlToStore = design.cloudinaryUrl || design.url;
          return {
            ...designData,
            text: null,
            fontSize: null,
            fontFamily: null,
            color: null,
            url: urlToStore,
            cloudinaryUrl: design.cloudinaryUrl || null,
            originalBase64: null // Never store base64 in cart
          };
        }
      });

      const cartItem = {
        id: Date.now(),
        productName: state.customization.selectedProduct.name,
        productPrice: state.customization.selectedProduct.price,
        quantity: state.customization.quantity,
        size: state.customization.productSize,
        customInstructions: state.customization.customInstructions,
        previewImage: action.payload?.previewImage || null,
        originalPreviewBase64: null, // Don't store base64 in localStorage
        uploadedDesigns: designsForCart,
        uploadedDesignsCount: state.customization.uploadedDesigns.length,
        price: state.customization.selectedProduct.price * state.customization.quantity,
        timestamp: new Date().toISOString(),
        originalProduct: {
          id: state.customization.selectedProduct.id,
          category: state.customization.selectedProduct.category,
          image: state.customization.selectedProduct.image
        }
      };
      
      newState = {
        ...state,
        cart: [...state.cart, cartItem],
        customization: initialState.customization
      };
      
      // Sanitize and save to localStorage
      const sanitizedCart = sanitizeCartForStorage(newState.cart);
      localStorage.setItem('userCart', JSON.stringify(sanitizedCart));
      break;

    case 'UPDATE_CART_ITEM_QUANTITY':
      newState = {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.itemId
            ? {
                ...item,
                quantity: action.payload.quantity,
                price: item.productPrice * action.payload.quantity
              }
            : item
        )
      };
      
      // Sanitize and save to localStorage
      const sanitizedCartUpdate = sanitizeCartForStorage(newState.cart);
      localStorage.setItem('userCart', JSON.stringify(sanitizedCartUpdate));
      break;

    case 'REMOVE_FROM_CART':
      newState = {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };
      
      if (newState.cart.length > 0) {
        const sanitizedCartRemove = sanitizeCartForStorage(newState.cart);
        localStorage.setItem('userCart', JSON.stringify(sanitizedCartRemove));
      } else {
        localStorage.removeItem('userCart');
      }
      break;

    case 'CLEAR_CART':
      newState = {
        ...state,
        cart: []
      };
      
      localStorage.removeItem('userCart');
      break;

    case 'CREATE_ORDER':
      // Ensure no base64 data in orders either
      const cleanOrderItems = state.cart.map(item => ({
        ...item,
        originalPreviewBase64: null,
        uploadedDesigns: item.uploadedDesigns.map(design => ({
          ...design,
          originalBase64: null
        }))
      }));

      const newOrder = {
        id: Date.now(),
        items: cleanOrderItems,
        total: state.cart.reduce((sum, item) => sum + item.price, 0),
        status: 'confirmed',
        orderDate: new Date().toISOString(),
        shippingAddress: action.payload.shippingAddress,
        customerInfo: action.payload.customerInfo
      };
      
      newState = {
        ...state,
        orders: [...state.orders, newOrder],
        cart: []
      };
      
      // Save orders and clear cart
      localStorage.setItem('userOrders', JSON.stringify(newState.orders));
      localStorage.removeItem('userCart');
      break;

    case 'CLEAR_CUSTOMIZATION':
      newState = {
        ...state,
        customization: initialState.customization
      };
      break;

    default:
      newState = state;
      break;
  }
  
  return newState;
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Optional cleanup on load - ensure no base64 in localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('userCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        let hasBase64 = false;
        
        // Check for base64 data
        parsedCart.forEach(item => {
          if (item.originalPreviewBase64 || 
              item.uploadedDesigns?.some(design => design.originalBase64)) {
            hasBase64 = true;
          }
        });
        
        // Clean up if base64 found
        if (hasBase64) {
          const cleanCart = sanitizeCartForStorage(parsedCart);
          localStorage.setItem('userCart', JSON.stringify(cleanCart));
        }
      } catch (error) {
        console.error('Error cleaning localStorage:', error);
      }
    }
  }, []);

  // Sync localStorage on cart changes
  useEffect(() => {
    if (state.cart.length > 0) {
      const sanitizedCart = sanitizeCartForStorage(state.cart);
      localStorage.setItem('userCart', JSON.stringify(sanitizedCart));
    }
  }, [state.cart]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}