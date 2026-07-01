import React, { useState, useEffect, useRef } from "react";
import plangex_logo_black from '../assets/PlangeX_logo.png';
import axios from "axios";
import { Crown, Sparkles, ShoppingBag, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ["All", "Hoodie", "Sweatshirt", "Cap", "Jersey", "T-Shirt"];

// ----- helper: whatsapp link with product details -----
const getWhatsappLink = (product) => {
  const phone = product.vendor?.store_phone || product.vendor?.phone || "2338000000000";
  const cleanPhone = phone.toString().replace(/[^0-9+]/g, '');
  let finalPhone = cleanPhone;
  if (!cleanPhone.startsWith('+') && !cleanPhone.startsWith('233')) {
    if (cleanPhone.startsWith('0')) {
      finalPhone = '233' + cleanPhone.substring(1);
    } else {
      finalPhone = '233' + cleanPhone;
    }
  }
  const imageUrl = product.images?.[0] || "";
  const productName = product.name || "Product";
  const price = parseFloat(product.price) || 0;
  const msg = `Hi, I'm interested in your product: ${productName}\nPrice: ₵${price.toFixed(2)}\n\nProduct image: ${imageUrl}\n\nPlease let me know if it's available.`;
  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`;
};

// ----- product card -----
const ProductCard = ({ product, onOpenModal }) => {
  const images = product.images || [];
  const firstImage = images.length > 0 ? images[0] : "https://via.placeholder.com/400x400?text=No+Image";
  
  return (
    <div className="product-card">
      <div className="card-image-wrap" onClick={() => onOpenModal(product)}>
        <img src={firstImage} alt={product.name} className="card-image" />
        {product.featured && (
          <div className="badge-featured">
            <Crown className="crown-icon" size={12} />
            <span>Featured</span>
          </div>
        )}
        <div className="card-overlay">
          <span>Quick View</span>
        </div>
      </div>
      <div className="card-body">
        <div className="card-vendor">{product.vendor?.store_name || product.vendor?.name || 'Unknown Vendor'}</div>
        <div className="card-name">{product.name}</div>
        <div className="card-price-wrapper">
          <span className="card-price">₵{parseFloat(product.price).toFixed(2)}</span>
        </div>
        <button
          className="btn-buy btn-buy-full"
          onClick={(e) => {
            e.stopPropagation();
            window.open(getWhatsappLink(product), "_blank");
          }}
        >
          <ShoppingBag size={14} />
          Buy
        </button>
      </div>
    </div>
  );
};

// ----- modal -----
const Modal = ({ product, onClose }) => {
  const overlayRef = useRef(null);
  const [activeImage, setActiveImage] = useState(0);
  const images = product.images || [];
  const firstImage = images.length > 0 ? images[0] : "https://via.placeholder.com/400x400?text=No+Image";

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="modal-inner">
          <div className="modal-image-side">
            <img
              src={images[activeImage] || firstImage}
              alt={product.name}
              className="modal-image-main"
            />
            {images.length > 1 && (
              <div className="modal-thumbnails">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    className={`modal-thumb ${idx === activeImage ? "active" : ""}`}
                    onClick={() => setActiveImage(idx)}
                    alt={`${product.name} ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="modal-info-side">
            {product.featured && (
              <div className="modal-featured-badge">
                <Crown className="crown-icon" size={14} />
                <span>Featured Product</span>
              </div>
            )}
            <div className="modal-vendor">
              {product.vendor?.store_name || product.vendor?.name || 'Unknown Vendor'} · <span className="modal-category">{product.category || 'General'}</span>
            </div>
            <div className="modal-name">{product.name}</div>
            <div className="modal-description">{product.description || 'No description available'}</div>
            <div className="modal-footer">
              <div className="modal-price-row">
                <span className="modal-price">₵{parseFloat(product.price).toFixed(2)}</span>
                {product.featured && <Sparkles className="sparkle-icon" size={16} />}
              </div>
              <button
                className="btn-buy btn-buy-modal"
                onClick={() => window.open(getWhatsappLink(product), "_blank")}
              >
                <ShoppingBag size={16} />
                Buy · Chat on WhatsApp
              </button>
              <div className="whatsapp-hint">Click to connect with the vendor</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----- MAIN COMPONENT -----
export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sticky, setSticky] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("https://plx-bckend.onrender.com/api/users/all-vendor-products");
      console.log("✅ Products fetched:", response.data);
      if (response.data && response.data.products) {
        setProducts(response.data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("❌ Error fetching products:", error.response?.data || error.message);
      setError("Failed to load products. Please try again.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const featuredProducts = products.filter((p) => p.featured === true);

  const filtered = products.filter((p) => {
    const matchCat = category === "All" || p.category === category;
    const matchSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.vendor?.store_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.vendor?.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }).sort((a, b) => {
    if (sortBy === "price-asc") return parseFloat(a.price) - parseFloat(b.price);
    if (sortBy === "price-desc") return parseFloat(b.price) - parseFloat(a.price);
    return 0;
  });

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 280);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="mt-6 text-[#1a1a1a]/60 text-sm tracking-[0.2em] uppercase">Loading</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-light text-[#1a1a1a] mb-2">Something went wrong</h3>
          <p className="text-[#1a1a1a]/60 mb-6">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-8 py-3 border border-[#1a1a1a]/20 hover:bg-[#1a1a1a] hover:text-white text-[#1a1a1a] text-sm font-light transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          background: #f5f5f0;
          font-family: 'DM Sans', sans-serif;
          color: #1a1a1a;
          line-height: 1.5;
        }

        /* Loading Spinner */
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 2px solid rgba(26,26,26,0.1);
          border-top: 2px solid #1a1a1a;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .min-h-screen { min-height: 100vh; }

        /* ----- HERO SECTION ----- */
        .hero-section {
          background: #1a1a1a;
          padding: 80px 24px 100px;
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .hero-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .hero-section::after {
          content: 'STREETWEAR';
          position: absolute;
          bottom: -20px;
          right: -40px;
          font-family: 'Syne', sans-serif;
          font-size: 140px;
          font-weight: 900;
          color: rgba(255,255,255,0.02);
          letter-spacing: 20px;
          pointer-events: none;
          line-height: 1;
          text-transform: uppercase;
        }
        .hero-content {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .hero-logo {
          margin-bottom: 20px;
        }
        .hero-logo img {
          height: 48px;
          width: auto;
          filter: brightness(0) invert(1);
        }
        .hero-section h1 {
          font-family: 'Syne', sans-serif;
          font-size: 4rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: #ffffff;
          line-height: 1.05;
          margin-bottom: 12px;
        }
        .hero-section h1 span {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-section .sub-text {
          color: rgba(255,255,255,0.5);
          font-size: 1.1rem;
          font-weight: 400;
          max-width: 480px;
          margin-bottom: 32px;
          letter-spacing: 0.3px;
        }
        .hero-tags {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .hero-tag {
          border: 1px solid rgba(255,255,255,0.08);
          padding: 6px 20px;
          border-radius: 60px;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: rgba(255,255,255,0.6);
        }
        .hero-tag.highlight {
          background: rgba(34,197,94,0.1);
          border-color: rgba(34,197,94,0.2);
          color: #22c55e;
        }
        .hero-stats {
          display: flex;
          gap: 48px;
          margin-top: 36px;
        }
        .hero-stats .stat-item {
          text-align: center;
        }
        .hero-stats .stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          color: #ffffff;
        }
        .hero-stats .stat-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: rgba(255,255,255,0.3);
        }

        /* controls */
        .controls {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin: -28px auto 32px;
          padding: 0 24px;
          max-width: 1280px;
          position: relative;
          z-index: 10;
        }
        .search-wrap {
          flex: 1;
          min-width: 200px;
          position: relative;
        }
        .search-wrap input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 1px solid rgba(26,26,26,0.08);
          border-radius: 60px;
          font-size: 0.95rem;
          background: #ffffff;
          color: #1a1a1a;
          outline: none;
          transition: 0.3s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .search-wrap input::placeholder {
          color: rgba(26,26,26,0.3);
        }
        .search-wrap input:focus {
          border-color: rgba(34,197,94,0.3);
          box-shadow: 0 0 0 4px rgba(34,197,94,0.06);
        }
        .search-wrap .icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(26,26,26,0.3);
        }
        .filter-select {
          padding: 14px 20px;
          border: 1px solid rgba(26,26,26,0.08);
          border-radius: 60px;
          background: #ffffff;
          font-size: 0.9rem;
          color: #1a1a1a;
          outline: none;
          cursor: pointer;
          min-width: 140px;
          appearance: none;
          font-weight: 500;
          transition: 0.3s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .filter-select:focus {
          border-color: rgba(34,197,94,0.3);
        }

        /* sticky bar */
        .sticky-bar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(26,26,26,0.06);
          padding: 10px 24px;
          display: flex;
          align-items: center;
          gap: 14px;
          transform: translateY(-100%);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 20px rgba(0,0,0,0.04);
        }
        .sticky-bar.visible { transform: translateY(0); }
        .sticky-bar .sticky-label {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.1rem;
          color: #1a1a1a;
          white-space: nowrap;
          letter-spacing: -0.02em;
        }
        .sticky-bar .sticky-label span {
          color: #22c55e;
        }
        .sticky-search { flex: 1; }
        .sticky-search .search-wrap input {
          padding: 8px 14px 8px 38px;
          font-size: 0.85rem;
          border-radius: 40px;
          background: rgba(26,26,26,0.04);
          border-color: rgba(26,26,26,0.06);
          box-shadow: none;
        }
        .sticky-search .search-wrap .icon {
          left: 12px;
          font-size: 0.85rem;
        }

        /* sections */
        .section {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px 24px 48px;
        }
        .section-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .section-title .crown-icon {
          color: #22c55e;
        }
        .section-count {
          font-size: 0.75rem;
          background: rgba(26,26,26,0.06);
          padding: 4px 14px;
          border-radius: 40px;
          color: rgba(26,26,26,0.5);
          font-weight: 500;
        }
        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(34,197,94,0.2) 0%, transparent 100%);
          margin-bottom: 28px;
          opacity: 0.6;
        }

        /* FEATURED */
        .featured-scroll {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          padding: 4px 4px 16px 4px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: rgba(34,197,94,0.3) rgba(26,26,26,0.05);
        }
        .featured-scroll::-webkit-scrollbar {
          height: 4px;
        }
        .featured-scroll::-webkit-scrollbar-track {
          background: rgba(26,26,26,0.05);
          border-radius: 10px;
        }
        .featured-scroll::-webkit-scrollbar-thumb {
          background: rgba(34,197,94,0.3);
          border-radius: 10px;
        }
        .featured-scroll .product-card {
          flex: 0 0 280px;
          scroll-snap-align: start;
        }
        .featured-scroll .product-card .card-image-wrap {
          border: 2px solid rgba(34,197,94,0.15);
        }

        /* regular grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
        }

        /* card */
        .product-card {
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(26,26,26,0.06);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .product-card:hover {
          transform: translateY(-8px);
          border-color: rgba(34,197,94,0.2);
          box-shadow: 0 20px 40px rgba(0,0,0,0.06);
        }
        .card-image-wrap {
          position: relative;
          aspect-ratio: 1/1;
          overflow: hidden;
          cursor: pointer;
          background: #f5f5f0;
          flex-shrink: 0;
        }
        .card-image {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .product-card:hover .card-image { transform: scale(1.05); }
        
        /* Featured Badge - Bright Green */
        .badge-featured {
          position: absolute;
          top: 12px;
          left: 12px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #ffffff;
          font-size: 0.6rem;
          font-weight: 700;
          padding: 5px 14px;
          border-radius: 40px;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 2;
          box-shadow: 0 2px 12px rgba(34,197,94,0.3);
          text-transform: uppercase;
        }
        .badge-featured .crown-icon {
          color: #ffffff;
        }

        /* Modal Featured Badge */
        .modal-featured-badge {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 5px 16px;
          border-radius: 40px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          width: fit-content;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          box-shadow: 0 2px 12px rgba(34,197,94,0.2);
        }
        .modal-featured-badge .crown-icon {
          color: #ffffff;
        }

        .card-overlay {
          position: absolute;
          inset: 0;
          background: rgba(26,26,26,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .card-overlay span {
          color: #ffffff;
          border: 1px solid rgba(255,255,255,0.15);
          padding: 8px 24px;
          border-radius: 60px;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.5px;
          background: rgba(0,0,0,0.3);
        }
        .card-image-wrap:hover .card-overlay { opacity: 1; }
        .card-body {
          padding: 16px 16px 18px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .card-vendor {
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #22c55e;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .card-name {
          font-size: 0.95rem;
          font-weight: 500;
          color: #1a1a1a;
          line-height: 1.3;
          margin-bottom: 8px;
          flex: 1;
        }
        .card-price-wrapper {
          margin-bottom: 10px;
        }
        .card-price {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 1.2rem;
          color: #1a1a1a;
        }
        .btn-buy {
          padding: 10px 20px;
          background: #1a1a1a;
          border: none;
          border-radius: 60px;
          color: #ffffff;
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-buy:hover { 
          background: #2a2a2a;
          transform: scale(1.02);
        }
        .btn-buy-full {
          width: 100%;
          display: flex;
        }
        .btn-buy-modal {
          padding: 14px 20px;
          font-size: 0.9rem;
          width: 100%;
          border-radius: 60px;
          background: #22c55e;
          color: #ffffff;
        }
        .btn-buy-modal:hover {
          background: #16a34a;
        }

        .empty-state {
          grid-column: 1/-1;
          text-align: center;
          padding: 60px 20px;
          color: rgba(26,26,26,0.3);
        }
        .empty-state span { font-size: 2.8rem; display: block; margin-bottom: 8px; }

        /* modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(12px);
          z-index: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-card {
          position: relative;
          background: #ffffff;
          border-radius: 20px;
          max-width: 820px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.2);
          animation: slideUp 0.3s ease;
          border: 1px solid rgba(26,26,26,0.06);
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .modal-close {
          position: absolute;
          top: 16px; right: 16px;
          z-index: 10;
          width: 36px; height: 36px;
          background: rgba(26,26,26,0.06);
          border: 1px solid rgba(26,26,26,0.08);
          border-radius: 50%;
          color: #1a1a1a;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.3s;
        }
        .modal-close:hover { background: rgba(26,26,26,0.1); }
        .modal-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow-y: auto;
          max-height: 90vh;
        }
        .modal-image-side {
          background: #f5f5f0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px;
        }
        .modal-image-main {
          width: 100%;
          aspect-ratio: 1/1;
          object-fit: cover;
          border-radius: 12px;
          background: #ffffff;
        }
        .modal-thumbnails {
          display: flex;
          gap: 8px;
        }
        .modal-thumb {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: 0.3s;
        }
        .modal-thumb.active { border-color: #22c55e; }
        .modal-thumb:hover { opacity: 0.8; }
        .modal-info-side {
          padding: 32px 28px 28px;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          overflow-y: auto;
        }
        .modal-vendor {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #22c55e;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .modal-category { color: rgba(26,26,26,0.3); }
        .modal-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.2;
          margin-bottom: 8px;
        }
        .modal-description {
          font-size: 0.9rem;
          color: rgba(26,26,26,0.5);
          line-height: 1.6;
          margin: 8px 0 24px;
          flex: 1;
        }
        .modal-footer {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .modal-price-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .modal-price {
          font-family: 'Syne', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a1a;
        }
        .sparkle-icon {
          color: #22c55e;
        }
        .whatsapp-hint {
          font-size: 0.7rem;
          color: rgba(26,26,26,0.2);
          text-align: center;
          margin-top: 4px;
        }

        .footer {
          max-width: 1280px;
          margin: 0 auto;
          padding: 28px 24px;
          border-top: 1px solid rgba(26,26,26,0.06);
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          color: rgba(26,26,26,0.3);
          font-size: 0.75rem;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          color: #1a1a1a;
          font-size: 1.1rem;
        }
        .footer-logo img {
          height: 24px;
          width: auto;
        }

        /* Mobile Responsive */
        @media (max-width: 640px) {
          .hero-section {
            padding: 50px 16px 70px;
          }
          .hero-section h1 {
            font-size: 2.4rem;
          }
          .hero-section .sub-text {
            font-size: 0.95rem;
          }
          .hero-logo img { height: 36px; }
          .hero-stats { gap: 24px; }
          .hero-stats .stat-num { font-size: 1.3rem; }
          .hero-tag { font-size: 0.5rem; padding: 4px 12px; }
          .hero-section::after {
            font-size: 60px;
            bottom: -10px;
            right: -10px;
          }

          .controls {
            flex-direction: column;
            gap: 8px;
            padding: 0 16px;
            margin-top: -20px;
          }
          .filter-select {
            min-width: unset;
            width: 100%;
            padding: 12px 16px;
            font-size: 0.85rem;
          }
          .search-wrap input {
            padding: 12px 14px 12px 40px;
            font-size: 0.85rem;
          }

          .section { padding: 16px 16px 32px; }
          .section-title { font-size: 1.2rem; }

          .featured-scroll .product-card {
            flex: 0 0 200px;
          }
          .featured-scroll {
            gap: 12px;
            padding: 4px 4px 12px 4px;
          }

          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .product-card { border-radius: 12px; }
          .card-body { padding: 12px 12px 14px; }
          .card-name { font-size: 0.85rem; }
          .card-price { font-size: 1rem; }
          .card-vendor { font-size: 0.55rem; }
          .btn-buy {
            padding: 8px 12px;
            font-size: 0.7rem;
          }

          .modal-overlay { padding: 10px; align-items: flex-end; }
          .modal-card {
            max-height: 95vh;
            border-radius: 16px 16px 0 0;
            animation: slideUpMobile 0.3s ease;
          }
          @keyframes slideUpMobile {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .modal-inner {
            grid-template-columns: 1fr;
            max-height: 95vh;
          }
          .modal-image-side {
            padding: 8px;
            max-height: 300px;
          }
          .modal-image-main {
            aspect-ratio: 1/1;
            max-height: 220px;
            border-radius: 8px;
          }
          .modal-thumbnails { justify-content: center; }
          .modal-thumb {
            width: 44px;
            height: 44px;
            border-radius: 6px;
          }
          .modal-info-side {
            padding: 20px 18px 24px;
            max-height: 60vh;
            overflow-y: auto;
          }
          .modal-name { font-size: 1.2rem; }
          .modal-price { font-size: 1.5rem; }
          .modal-description {
            font-size: 0.85rem;
            margin: 4px 0 16px;
          }
          .btn-buy-modal {
            padding: 12px 16px;
            font-size: 0.85rem;
          }
          .modal-close {
            top: 10px;
            right: 10px;
            width: 32px;
            height: 32px;
          }
          .modal-close svg { width: 18px; height: 18px; }

          .sticky-bar {
            padding: 8px 12px;
            gap: 8px;
          }
          .sticky-bar .sticky-label {
            font-size: 0.85rem;
          }
          .sticky-search .search-wrap input {
            padding: 6px 10px 6px 32px;
            font-size: 0.75rem;
            border-radius: 40px;
          }
          .sticky-search .search-wrap .icon {
            left: 10px;
            font-size: 0.7rem;
          }

          .footer {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 20px 16px;
            font-size: 0.7rem;
          }
          .footer-logo img { height: 20px; }
        }
      `}</style>

      {/* STICKY BAR */}
      <div className={`sticky-bar ${sticky ? "visible" : ""}`}>
        <span className="sticky-label">Plange<span>X</span></span>
        <div className="sticky-search search-wrap">
          <Search className="icon" size={16} />
          <input
            placeholder="Search hoodies, caps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-logo">
            <img src={plangex_logo_black} alt="PlangeX" />
          </div>
          <h1>
            streetwear · <span>culture</span>
          </h1>
          <p className="sub-text">Premium streetwear, jerseys, caps & more — direct from independent makers.</p>
          <div className="hero-tags">
            <span className="hero-tag highlight">✦ exclusive drops</span>
            <span className="hero-tag">limited edition</span>
            <span className="hero-tag">sustainable</span>
            <span className="hero-tag">direct trade</span>
          </div>
          <div className="hero-stats">
            {/* <div className="stat-item">
              <div className="stat-num">{products.length}+</div>
              <div className="stat-label">styles</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">
                
                {new Set(products.map(p => p.vendor?.id)).size}
              </div>
              <div className="stat-label">vendors</div>
            </div> */}
            <div className="stat-item">
              <div className="stat-num">4.9★</div>
              <div className="stat-label">community</div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="controls">
        <div className="search-wrap">
          <Search className="icon" size={18} />
          <input
            placeholder="Search hoodies, caps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="default">Sort: Featured</option>
          <option value="price-asc">Price: low→high</option>
          <option value="price-desc">Price: high→low</option>
        </select>
      </div>

      {/* FEATURED */}
      {category === "All" && !search && featuredProducts.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">
              <Crown className="crown-icon" size={22} />
              featured
            </h2>
            <span className="section-count">{featuredProducts.length} items</span>
          </div>
          <div className="section-divider" />
          <div className="featured-scroll">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} onOpenModal={setSelectedProduct} />
            ))}
          </div>
        </div>
      )}

      {/* ALL PRODUCTS */}
      <div className="section" style={{ paddingBottom: 48 }}>
        <div className="section-header">
          <h2 className="section-title">all threads</h2>
          <span className="section-count">{filtered.length} items</span>
        </div>
        <div className="section-divider" />
        <div className="products-grid">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <span>🔍</span>
              <p>No pieces found for "{search || category}"</p>
              <p style={{ fontSize: "0.8rem", marginTop: 4, opacity: 0.5 }}>
                try a different style or keyword
              </p>
            </div>
          ) : (
            filtered.map((p) => (
              <ProductCard key={p.id} product={p} onOpenModal={setSelectedProduct} />
            ))
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <div className="footer-logo">
          <img src={plangex_logo_black} alt="PlangeX" />
        </div>
        <span>© 2026 · fashion with purpose</span>
      </div>

      {/* MODAL */}
      {selectedProduct && (
        <Modal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </>
  );
}