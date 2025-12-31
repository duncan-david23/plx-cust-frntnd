import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
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

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_CURRENT_PRODUCT':
      return {
        ...state,
        currentProduct: action.payload
      };

    case 'START_CUSTOMIZATION':
      return {
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

    case 'UPDATE_CUSTOMIZATION':
      return {
        ...state,
        customization: {
          ...state.customization,
          ...action.payload
        }
      };

    case 'ADD_DESIGN':
      const newDesigns = [...state.customization.uploadedDesigns, action.payload];
      return {
        ...state,
        customization: {
          ...state.customization,
          uploadedDesigns: newDesigns,
          activeDesign: action.payload.id
        }
      };

    case 'UPDATE_DESIGN':
      return {
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

    case 'REMOVE_DESIGN':
      const filteredDesigns = state.customization.uploadedDesigns.filter(
        design => design.id !== action.payload
      );
      return {
        ...state,
        customization: {
          ...state.customization,
          uploadedDesigns: filteredDesigns,
          activeDesign: state.customization.activeDesign === action.payload 
            ? filteredDesigns[0]?.id || null
            : state.customization.activeDesign
        }
      };

    case 'SET_ACTIVE_DESIGN':
      return {
        ...state,
        customization: {
          ...state.customization,
          activeDesign: action.payload
        }
      };

    case 'ADD_TO_CART':
      // Prepare design data for storage with Cloudinary support
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

        // Add appropriate URL based on design type and availability
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
          return {
            ...designData,
            text: null,
            fontSize: null,
            fontFamily: null,
            color: null,
            url: design.url, // Could be base64 or Cloudinary URL
            cloudinaryUrl: design.cloudinaryUrl || null,
            originalBase64: design.originalBase64 || null
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
        previewImage: action.payload?.previewImage || null, // Cloudinary URL for preview
        originalPreviewBase64: action.payload?.originalPreviewBase64 || null, // Base64 fallback
        uploadedDesigns: designsForCart, // Store all design data with Cloudinary URLs
        uploadedDesignsCount: state.customization.uploadedDesigns.length,
        price: state.customization.selectedProduct.price * state.customization.quantity,
        timestamp: new Date().toISOString(),
        // Keep original product reference for navigation if needed
        originalProduct: {
          id: state.customization.selectedProduct.id,
          category: state.customization.selectedProduct.category,
          image: state.customization.selectedProduct.image
        }
      };
      
      return {
        ...state,
        cart: [...state.cart, cartItem],
        customization: initialState.customization
      };

    case 'UPDATE_CART_ITEM_QUANTITY':
      return {
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

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };

    // ✅ ADD THIS NEW ACTION TO CLEAR THE CART
    case 'CLEAR_CART':
      return {
        ...state,
        cart: [] // Simply empty the cart array
      };

    case 'CREATE_ORDER':
      const newOrder = {
        id: Date.now(),
        items: state.cart.map(item => ({
          ...item,
          // Make sure designs are included in the order with Cloudinary URLs
          uploadedDesigns: item.uploadedDesigns.map(design => ({
            ...design,
            // For images: prioritize Cloudinary URL, fallback to base64
            imageUrl: design.cloudinaryUrl || design.url || null,
            isCloudinary: !!design.cloudinaryUrl,
            // For text: include all text properties
            textProperties: design.isText ? {
              text: design.text,
              fontSize: design.fontSize,
              fontFamily: design.fontFamily,
              color: design.color
            } : null
          }))
        })),
        total: state.cart.reduce((sum, item) => sum + item.price, 0),
        status: 'confirmed',
        orderDate: new Date().toISOString(),
        shippingAddress: action.payload.shippingAddress,
        customerInfo: action.payload.customerInfo
      };
      return {
        ...state,
        orders: [...state.orders, newOrder],
        cart: [] // This already clears cart in CREATE_ORDER action
      };

    case 'CLEAR_CUSTOMIZATION':
      return {
        ...state,
        customization: initialState.customization
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

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