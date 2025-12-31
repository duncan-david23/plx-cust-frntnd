import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import * as htmlToImage from 'html-to-image';
import { designTemplates } from '../data/designsData';
import axios from 'axios';
import {supabase} from '../lib/supabaseClient'
import { 
  Upload, 
  Move, 
  RotateCw, 
  ZoomIn, 
  ZoomOut,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Layers,
  Palette,
  Type,
  Sparkles,
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Ruler,
  Check,
  X,
  Image,
  Loader2
} from 'lucide-react';

const API_BASE_URL = 'https://plx-bckend.onrender.com/api/users';

const ProductCustomizationPage = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  
  // Use data directly from context
  const { customization } = state;
  const { selectedProduct, uploadedDesigns = [], activeDesign } = customization;
  
  const [showGrid, setShowGrid] = useState(true);
  const [productSize, setProductSize] = useState(customization.productSize || 'M');
  const [activeTab, setActiveTab] = useState('upload');
  const [editingText, setEditingText] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef(null);
  const productRef = useRef(null);
  const canvasRef = useRef(null);
  const textInputRef = useRef(null);

  // Use product from context
  const product = selectedProduct || {
    name: "No Shirt avalable",
    price: 0.00,
    image: "https://st3.depositphotos.com/9998432/19048/v/450/depositphotos_190483894-stock-illustration-default-placeholder-fitness-trainer-in.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"]
  };

  // Update context when product size changes
  useEffect(() => {
    dispatch({
      type: 'UPDATE_CUSTOMIZATION',
      payload: {
        productSize
      }
    });
  }, [productSize, dispatch]);

  // Get active design data
  const getActiveDesign = useCallback(() => {
    return uploadedDesigns.find(design => design.id === activeDesign) || null;
  }, [activeDesign, uploadedDesigns]);

  // Function to upload image to Cloudinary via backend
  const uploadImageToCloudinary = async (file) => {
    try {
      
       const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session.access_token;
      
      const formData = new FormData();
      formData.append('product_image', file);

      const response = await axios.post(
        `${API_BASE_URL}/upload-image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      );

      if (response.status === 200) {
        return response.data; // Cloudinary URL
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Function to upload base64 image (for preview) to Cloudinary
  const uploadBase64ToCloudinary = async (base64Data, fileName) => {
    try {
       const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session.access_token;
      
      // Convert base64 to blob
      const blob = await fetch(base64Data).then(res => res.blob());
      const file = new File([blob], fileName, { type: 'image/png' });

      const formData = new FormData();
      formData.append('product_image', file);

      const response = await axios.post(
        `${API_BASE_URL}/upload-image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      );

      if (response.status === 200) {
        return response.data; // Cloudinary URL
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading base64 image:', error);
      throw error;
    }
  };

  // Handle file upload with Cloudinary
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileIndex = i + 1;

        // Update progress for this file
        setUploadProgress(Math.round((fileIndex - 1) / files.length * 100));

        try {
          // Upload to Cloudinary via backend
          const cloudinaryUrl = await uploadImageToCloudinary(file);

          const newDesign = {
            id: Date.now() + fileIndex,
            name: file.name.replace(/\.[^/.]+$/, ""),
            type: file.type.startsWith("image/") ? file.type : "image/svg",
            url: cloudinaryUrl, // Cloudinary URL instead of base64
            originalBase64: null, // We don't store base64 anymore
            cloudinaryUrl: cloudinaryUrl, // Store Cloudinary URL separately
            uploadDate: new Date(),
            size: file.size,
            visible: true,
            position: { x: 0, y: 0 },
            scale: 1,
            rotation: 0,
            opacity: 1,
            isText: false,
          };

          // Update context
          dispatch({
            type: "ADD_DESIGN",
            payload: newDesign,
          });

        } catch (uploadError) {
          console.error(`Failed to upload file ${file.name}:`, uploadError);
          
          // Fallback to base64 if upload fails
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = reader.result;

            const newDesign = {
              id: Date.now() + fileIndex,
              name: file.name.replace(/\.[^/.]+$/, ""),
              type: file.type.startsWith("image/") ? file.type : "image/svg",
              url: base64Data,
              originalBase64: base64Data,
              cloudinaryUrl: null,
              uploadDate: new Date(),
              size: file.size,
              visible: true,
              position: { x: 0, y: 0 },
              scale: 1,
              rotation: 0,
              opacity: 1,
              isText: false,
            };

            dispatch({
              type: "ADD_DESIGN",
              payload: newDesign,
            });
          };
          reader.readAsDataURL(file);
        }
      }

      // Final progress update
      setUploadProgress(100);
      
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Some files failed to upload. They have been saved locally.');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }

    event.target.value = "";
  };

  // Update design property
  const updateDesignProperty = useCallback((designId, property, value) => {
    dispatch({
      type: 'UPDATE_DESIGN',
      payload: {
        id: designId,
        updates: { [property]: value }
      }
    });
  }, [dispatch]);

  // Handle wheel zoom for images
  const handleWheel = useCallback((event) => {
    if (activeDesign) {
      event.preventDefault();
      const activeDesignData = getActiveDesign();
      if (!activeDesignData || activeDesignData.isText) return;

      const scaleChange = event.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.1, Math.min(5, activeDesignData.scale * scaleChange));
      updateDesignProperty(activeDesign, 'scale', newScale);
    }
  }, [activeDesign, getActiveDesign, updateDesignProperty]);

  // Rotate design
  const rotateDesign = useCallback(() => {
    if (activeDesign) {
      const activeDesignData = getActiveDesign();
      if (!activeDesignData) return;

      const newRotation = (activeDesignData.rotation + 15) % 360;
      updateDesignProperty(activeDesign, 'rotation', newRotation);
    }
  }, [activeDesign, getActiveDesign, updateDesignProperty]);

  // Reset design
  const resetDesign = useCallback(() => {
    if (activeDesign) {
      updateDesignProperty(activeDesign, 'position', { x: 0, y: 0 });
      updateDesignProperty(activeDesign, 'scale', 1);
      updateDesignProperty(activeDesign, 'rotation', 0);
      updateDesignProperty(activeDesign, 'opacity', 1);
    }
  }, [activeDesign, updateDesignProperty]);

  // Remove design
  const removeDesign = useCallback((designId) => {
    dispatch({
      type: 'REMOVE_DESIGN',
      payload: designId
    });
  }, [dispatch]);

  // Toggle design visibility
  const toggleDesignVisibility = useCallback((designId) => {
    const design = uploadedDesigns.find(d => d.id === designId);
    if (design) {
      updateDesignProperty(designId, 'visible', !design.visible);
    }
  }, [uploadedDesigns, updateDesignProperty]);

  // Add text design
  const addTextDesign = useCallback(() => {
    const newTextDesign = {
      id: Date.now(),
      name: 'Custom Text',
      type: 'text/plain',
      url: null,
      text: 'Your Text Here',
      fontSize: 24,
      fontFamily: 'Arial, sans-serif',
      color: '#000000',
      uploadDate: new Date(),
      visible: true,
      position: { x: 0, y: 0 },
      scale: 1,
      rotation: 0,
      opacity: 1,
      isText: true
    };

    dispatch({
      type: 'ADD_DESIGN',
      payload: newTextDesign
    });
    
    setEditingText(newTextDesign.id);
  }, [dispatch]);

  // Update text content
  const updateTextContent = useCallback((designId, newText) => {
    updateDesignProperty(designId, 'text', newText);
  }, [updateDesignProperty]);

  // Start editing text
  const startTextEditing = useCallback((designId) => {
    setEditingText(designId);
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 100);
  }, []);

  // Save text edits
  const saveTextEdit = useCallback(() => {
    setEditingText(null);
  }, []);

  // Set active design
  const setActiveDesign = useCallback((designId) => {
    dispatch({
      type: 'SET_ACTIVE_DESIGN',
      payload: designId
    });
  }, [dispatch]);

  // Capture preview image
  const capturePreviewImage = async () => {
    if (!productRef.current) return null;
    
    try {
      const dataUrl = await htmlToImage.toPng(productRef.current, {
        filter: (node) => {
          return !node.classList?.contains('grid-overlay');
        },
        quality: 1,
        pixelRatio: 2,
      });
      return dataUrl;
    } catch (err) {
      console.error('Preview capture failed:', err);
      return null;
    }
  };

  // Download preview
const downloadPreview = async () => {
  try {
    // Wait a short moment to ensure all layers/rendering are ready
    await new Promise((resolve) => setTimeout(resolve, 300)); // 300ms delay

    const previewImage = await capturePreviewImage(); // returns base64 or data URL

    if (!previewImage) {
      alert('Error generating preview image');
      return;
    }

    // Convert base64/data URL to Blob
    const res = await fetch(previewImage);
    const blob = await res.blob();

    // Create temporary URL and download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom-${product.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();

    // Cleanup
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    alert('Something went wrong generating the image');
  }
};











  // Upload preview to Cloudinary and add to cart
  const handleAddToCart = useCallback(async () => {
    if (uploadedDesigns.length === 0) {
      alert('Please add at least one design before adding to cart');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Capture the preview image
      const previewImage = await capturePreviewImage();
      
      if (!previewImage) {
        alert('Error capturing preview image. Please try again.');
        setUploading(false);
        return;
      }

      setUploadProgress(30);

      // Upload preview to Cloudinary
      let cloudinaryPreviewUrl = null;
      try {
        const fileName = `preview-${product.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
        cloudinaryPreviewUrl = await uploadBase64ToCloudinary(previewImage, fileName);
        setUploadProgress(70);
      } catch (uploadError) {
        console.error('Failed to process image:', uploadError);
        // Continue with base64 if upload fails
      }

      // Prepare design data with Cloudinary URLs
      const designsForCart = uploadedDesigns.map(design => {
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
            url: design.url, // Local base64 or Cloudinary URL
            cloudinaryUrl: design.cloudinaryUrl || null,
            originalBase64: design.originalBase64 || null
          };
        }
      });

      setUploadProgress(90);

      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          previewImage: cloudinaryPreviewUrl || previewImage, // Prefer Cloudinary URL
          originalPreviewBase64: cloudinaryPreviewUrl ? null : previewImage, // Store base64 only if needed
          uploadedDesigns: designsForCart
        }
      });

      setUploadProgress(100);

      setTimeout(() => {
        navigate('/cart');
      }, 500);

    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding item to cart. Please try again.');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  }, [uploadedDesigns, dispatch, navigate, product.name]);

  // Design Controls Component
  const DesignControls = () => {
    const activeDesignData = getActiveDesign();



    

    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2 text-sm sm:text-base">
          <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Design Controls</span>
        </h3>

        {activeDesignData ? (
          <div className="space-y-3 sm:space-y-4">
            {/* Active Design Info */}
            <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-200">
              <p className="text-xs sm:text-sm font-medium text-blue-900 truncate">
                Editing: {activeDesignData.name}
              </p>
              <p className="text-[10px] sm:text-xs text-blue-700 mt-1">
                {activeDesignData.isText ? 'Text Design' : 'Image Design'}
              </p>
              {!activeDesignData.isText && activeDesignData.cloudinaryUrl && (
                <p className="text-[10px] sm:text-xs text-green-700 mt-1">
                  ✓ Process Image
                </p>
              )}
            </div>

            {/* Text Editing for Text Designs */}
            

            {/* Position Controls */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                Position (X: {activeDesignData.position.x}, Y: {activeDesignData.position.y})
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '← Left', delta: { x: -10, y: 0 } },
                  { label: 'Right →', delta: { x: 10, y: 0 } },
                  { label: '↑ Up', delta: { x: 0, y: -10 } },
                  { label: '↓ Down', delta: { x: 0, y: 10 } }
                ].map((button, index) => (
                  <button
                    key={index}
                    onClick={() => updateDesignProperty(activeDesignData.id, 'position', {
                      x: activeDesignData.position.x + button.delta.x,
                      y: activeDesignData.position.y + button.delta.y
                    })}
                    className="p-2  text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors active:bg-gray-100"
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scale Controls */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                Scale: {Math.round(activeDesignData.scale * 100)}%
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => updateDesignProperty(activeDesignData.id, 'scale', Math.max(0.1, activeDesignData.scale - 0.1))}
                  className="flex-1 bg-amber-500 text-white p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center active:bg-gray-100"
                >
                  <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => updateDesignProperty(activeDesignData.id, 'scale', 1)}
                  className="flex-1 bg-blue-500 text-white p-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors active:bg-gray-100"
                >
                  Reset
                </button>
                <button
                  onClick={() => updateDesignProperty(activeDesignData.id, 'scale', Math.min(5, activeDesignData.scale + 0.1))}
                  className="flex-1 bg-purple-500 text-white p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center active:bg-gray-100"
                >
                  <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Rotation & Opacity */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                  Rotation: {activeDesignData.rotation}°
                </label>
                <button
                  onClick={rotateDesign}
                  className="w-full bg-green-500 text-white p-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1 sm:space-x-2 active:bg-gray-100"
                >
                  <RotateCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Rotate 15°</span>
                </button>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                  Opacity: {Math.round(activeDesignData.opacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={activeDesignData.opacity}
                  onChange={(e) => updateDesignProperty(activeDesignData.id, 'opacity', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-3 sm:pt-4 border-t">
              <button
                onClick={resetDesign}
                className="p-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors active:bg-gray-100"
              >
                Reset All
              </button>
              <button
                onClick={() => removeDesign(activeDesignData.id)}
                className="p-2 text-xs sm:text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center space-x-1 sm:space-x-2 active:bg-red-100"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4 text-sm">
            Select a design to customize
          </p>
        )}
      </div>
    );
  };

  // Design Upload Component
  const DesignUpload = () => (
    <div className="bg-gray-200 text-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 h-auto sm:h-[600px] overflow-y-auto">
      <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2 text-sm sm:text-base">
        <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Upload Your Design</span>
      </h3>

      {uploading && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Processing Image...</span>
            <span className="text-sm font-medium text-blue-700">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            Processing image. Please wait...
          </p>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="py-4">
              <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-gray-700 mx-auto mb-4 animate-spin" />
              <p className="text-sm sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">
                Processing image...
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                {uploadProgress}% complete
              </p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-4" />
              <p className="text-sm sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">
                Drop your design here or click to browse
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Supports PNG, JPG, SVG, PDF (Max 10MB)
              </p>
              <p className="text-xs text-green-600 mt-2">
                ✓ Images are automatically processed for best quality
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.svg,.pdf"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {/* Add Text Button */}
        {/* <button
          onClick={addTextDesign}
          disabled={uploading}
          className={`w-full p-3 sm:p-4 border-2 border-dashed rounded-xl sm:rounded-2xl flex items-center justify-center space-x-2 text-sm sm:text-base transition-colors ${
            uploading 
              ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
              : 'border-gray-300 hover:border-gray-400 text-gray-700'
          }`}
        >
          <Type className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Add Custom Text</span>
        </button> */}

        {/* Design Templates */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Design Templates</h4>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {designTemplates.map(template => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  if (uploading) return;
                  const newDesign = {
                    id: Date.now(),
                    name: template.name,
                    type: 'image/jpeg',
                    url: template.image,
                    cloudinaryUrl: template.image, // Templates already have URLs
                    uploadDate: new Date(),
                    visible: true,
                    position: { x: 0, y: 0 },
                    scale: 1,
                    rotation: 0,
                    opacity: 1,
                    isText: false
                  };
                  
                  dispatch({
                    type: 'ADD_DESIGN',
                    payload: newDesign
                  });
                }}
              >
                <img
                  src={template.image}
                  alt={template.name}
                  className="w-full h-20 object-cover"
                />
                <p className="text-xs text-gray-600 p-2 text-center">
                  {template.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Design Library Component
  const DesignLibrary = () => (
    <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
      <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2 text-sm sm:text-base">
        <Image className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Your Designs ({uploadedDesigns.length})</span>
      </h3>

      <div className="space-y-2 sm:space-y-3 max-h-[50vh] sm:max-h-80 overflow-y-auto">
        {uploadedDesigns.map(design => (
          <div
            key={design.id}
            className={`p-3 border rounded-lg cursor-pointer transition-all ${
              activeDesign === design.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setActiveDesign(design.id)}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                {design.isText ? (
                  <Type className="w-6 h-6 text-gray-400" />
                ) : (
                  <img
                    src={design.url}
                    alt={design.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {design.name}
                  </p>
                  {!design.isText && design.cloudinaryUrl && (
                    <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                      ✓ Processed
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {design.isText ? 'Text Design' : 'Image Design'}
                </p>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDesignVisibility(design.id);
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  {design.visible ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {design.isText && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startTextEditing(design.id);
                    }}
                    className="p-1 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Type className="w-4 h-4 text-blue-600" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDesign(design.id);
                  }}
                  className="p-1 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {uploadedDesigns.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No designs uploaded yet
          </p>
        )}
      </div>
    </div>
  );

  // Clean up object URLs
  useEffect(() => {
    return () => {
      uploadedDesigns.forEach(design => {
        if (design.url && design.url.startsWith('blob:')) {
          URL.revokeObjectURL(design.url);
        }
      });
    };
  }, [uploadedDesigns]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hidden canvas for download */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <button 
                onClick={() => navigate('/products')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                disabled={uploading}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl font-semibold text-gray-900 truncate">Customize Product</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{product.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <motion.button
                whileHover={{ scale: uploading ? 1 : 1.05 }}
                whileTap={{ scale: uploading ? 1 : 0.95 }}
                onClick={handleAddToCart}
                disabled={uploading || uploadedDesigns.length === 0}
                className={`px-3 sm:px-6 py-2 rounded-lg font-semibold flex items-center space-x-1 sm:space-x-2 text-xs sm:text-base transition-colors ${
                  uploading || uploadedDesigns.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Processing...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span className="hidden sm:inline">Add to Cart</span>
                    <span className="sm:hidden">Add</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {uploading && (
        <div className="fixed top-20 left-0 right-0 z-50 px-4">
          <div className="max-w-7xl mx-auto bg-blue-500 text-white p-3 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <div>
                  <p className="font-medium">Processing image...</p>
                  <p className="text-sm opacity-90">{uploadProgress}% complete</p>
                </div>
              </div>
              <div className="w-32 bg-blue-300 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Left Sidebar - Design Tools */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6 order-2 lg:order-1">
            {/* Product Configuration */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Product Details</h3>
              
              {/* Size Selection */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                  Size
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setProductSize(size)}
                      disabled={uploading}
                      className={`py-2 px-3 border rounded-lg text-center transition-all ${
                        productSize === size
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Design Tabs */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200">
                {[
                  { id: 'upload', label: 'Upload', icon: Upload },
                  { id: 'library', label: 'Library', icon: Image },
                  { id: 'controls', label: 'Controls', icon: Move }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => !uploading && setActiveTab(tab.id)}
                    disabled={uploading}
                    className={`flex-1 py-2 sm:py-3 text-xs sm:text-sm font-medium flex items-center justify-center space-x-1 sm:space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-3 sm:p-4 max-h-[60vh] sm:max-h-none overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'upload' && <DesignUpload />}
                    {activeTab === 'library' && <DesignLibrary />}
                    {activeTab === 'controls' && <DesignControls />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Main Content - Product Preview */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Live Preview</h2>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    disabled={uploading}
                    className={`p-2 rounded-lg transition-colors ${
                      showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                    } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Toggle Grid"
                  >
                    <Ruler className="w-4 h-4" />
                  </button>
                  <motion.button
                    whileHover={{ scale: uploading ? 1 : 1.05 }}
                    whileTap={{ scale: uploading ? 1 : 0.95 }}
                    onClick={downloadPreview}
                    disabled={uploading || uploadedDesigns.length === 0}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold flex items-center space-x-1 sm:space-x-2 transition-colors text-xs sm:text-sm ${
                      uploading || uploadedDesigns.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {uploading ? (
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    <span className="hidden sm:inline">
                      {uploading ? 'Uploading...' : 'Download Preview'}
                    </span>
                    <span className="sm:hidden">
                      {uploading ? '...' : 'Download'}
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* Product Preview Area */}
              <div 
                ref={productRef}
                className="relative bg-gray-900 text-white rounded-2xl p-8 min-h-[600px] flex items-center justify-center"
                onWheel={handleWheel}
              >
                {/* Product Base */}
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-[500px] h-[500px] object-contain"
                  />

                  {/* Design Grid Overlay */}
                  {showGrid && (
                    <div className="absolute inset-0 pointer-events-none grid-overlay">
                      {/* Center Lines */}
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-red-500/30 transform -translate-y-1/2"></div>
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-500/30 transform -translate-x-1/2"></div>
                      
                      {/* Safe Zone */}
                      <div className="absolute inset-8 border-2 border-green-500/30 rounded-lg"></div>
                      
                      {/* Grid Pattern */}
                      <div className="absolute inset-0 opacity-10" 
                        style={{
                          backgroundImage: `
                            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                          `,
                          backgroundSize: '20px 20px'
                        }}
                      ></div>
                    </div>
                  )}

                  {/* Uploaded Designs */}
                  <AnimatePresence>
                    {uploadedDesigns.map(design => design.visible && (
                      <motion.div
                        key={design.id}
                        className="absolute top-0 left-0"
                        style={{
                          transform: `translate(${design.position.x}px, ${design.position.y}px) scale(${design.scale}) rotate(${design.rotation}deg)`,
                          opacity: design.opacity,
                          transformOrigin: 'center'
                        }}
                        drag={!uploading}
                        dragMomentum={false}
                        onDrag={(event, info) => {
                          if (!uploading) {
                            updateDesignProperty(design.id, 'position', {
                              x: design.position.x + info.delta.x,
                              y: design.position.y + info.delta.y
                            });
                          }
                        }}
                        whileHover={{ scale: uploading ? 1 : 1.02 }}
                        whileTap={{ scale: uploading ? 1 : 0.98 }}
                      >
                        {design.isText ? (
                          <div 
                            className="px-4 py-2 min-w-[120px] text-center"
                            style={{ 
                              color: design.color,
                              fontSize: `${design.fontSize}px`,
                              fontFamily: design.fontFamily,
                              background: 'transparent',
                              fontWeight: 'bold',
                              border: 'none',
                              textShadow: 'none'
                            }}
                            onClick={() => !uploading && startTextEditing(design.id)}
                          >
                            {editingText === design.id ? (
                              <input
                                ref={textInputRef}
                                type="text"
                                value={design.text}
                                onChange={(e) => !uploading && updateTextContent(design.id, e.target.value)}
                                onBlur={saveTextEdit}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !uploading) {
                                    saveTextEdit();
                                  }
                                }}
                                className="bg-transparent border-none outline-none text-center w-full"
                                style={{ 
                                  color: design.color,
                                  fontSize: `${design.fontSize}px`,
                                  fontFamily: design.fontFamily,
                                  fontWeight: 'bold',
                                  background: 'transparent'
                                }}
                                autoFocus
                                disabled={uploading}
                              />
                            ) : (
                              design.text
                            )}
                          </div>
                        ) : (
                          <img
                            src={design.url}
                            alt={design.name}
                            className="max-w-xs max-h-48 object-contain"
                            draggable="false"
                            style={{
                              transform: `scale(${design.scale}) rotate(${design.rotation}deg)`,
                              transformOrigin: 'center'
                            }}
                          />
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Empty State */}
                {uploadedDesigns.length === 0 && (
                  <div className="text-center text-gray-500">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Add your first design</p>
                    <p className="text-sm">Upload an image or choose from templates</p>
                  </div>
                )}

               
              </div>

              {/* Design Stats */}
              <div className="mt-4 sm:mt-6 grid grid-cols-4 gap-2 sm:gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{uploadedDesigns.length}</p>
                  <p className="text-[10px] sm:text-xs text-gray-600">Designs</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {getActiveDesign() ? Math.round(getActiveDesign().scale * 100) : 0}%
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600">Scale</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {getActiveDesign() ? getActiveDesign().rotation : 0}°
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600">Rotation</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {getActiveDesign() ? Math.round(getActiveDesign().opacity * 100) : 0}%
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600">Opacity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCustomizationPage;