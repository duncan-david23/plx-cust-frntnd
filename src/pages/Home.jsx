import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import plangex_logo from '../assets/PlangeX_logo_white.png'; 
import plangex_logo_black from '../assets/PlangeX_logo.png'; 
import { 
  ArrowRight, 
  Sparkles, 
  Shirt, 
  Upload, 
  Move, 
  ZoomIn, 
  RotateCw, 
  Truck, 
  Shield,
  Star,
  ChevronDown,
  X,
  Play,
  Smartphone,
  Palette,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import mockupImage from '../assets/mockup.png'
import mockupImage2 from '../assets/sweatshirt_mockup.png'

const CustomProductPlatform = () => {
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const navigate = useNavigate();

  const features = [
    {
      icon: <Upload className="w-6 h-6" />,
      title: "Upload Your Design",
      description: "Drag and drop your artwork, logo, or design in any format"
    },
    {
      icon: <Move className="w-6 h-6" />,
      title: "Drag & Position",
      description: "Intuitively place your design exactly where you want it"
    },
    {
      icon: <ZoomIn className="w-6 h-6" />,
      title: "Resize & Scale",
      description: "Perfect the size and proportions of your design"
    },
    {
      icon: <RotateCw className="w-6 h-6" />,
      title: "Rotate & Adjust",
      description: "Fine-tune every aspect of your custom product"
    }
  ];

  const products = [
    { 
      name: "T-Shirts", 
      image: "https://res.cloudinary.com/dxu2myqmz/image/upload/v1764583512/tshirt_black_1-side_zgnwvq.jpg",
      category: "apparel"
    },
    { 
      name: "Hoodies", 
      image: "https://res.cloudinary.com/dxu2myqmz/image/upload/v1764583511/white_hoodie_1-side_rjcjrn.jpg",
      category: "apparel"
    },
    { 
      name: "Baseball Caps", 
      image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&h=300&fit=crop&auto=format",
      category: "accessories"
    },
    { 
      name: "Jerseys", 
      image: "https://images.footballfanatics.com/manchester-united/manchester-united-adidas-third-shirt-2025-26-kids-with-mbeumo-19-printing_ss5_p-203336844+u-d3baabbebhct5vbqooee+v-wq6xckl63rv4fifchlw1.jpg?_hv=2&w=600",
      category: "apparel"
    },
    // { 
    //   name: "Tote Bags", 
    //   image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop&auto=format",
    //   category: "accessories"
    // },
    // { 
    //   name: "Mugs", 
    //   image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop&auto=format",
    //   category: "drinkware"
    // },
    // { 
    //   name: "Phone Cases", 
    //   image: "https://images.unsplash.com/photo-1601593346740-925612772716?w=300&h=300&fit=crop&auto=format",
    //   category: "accessories"
    // },
    // { 
    //   name: "Notebooks", 
    //   image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop&auto=format",
    //   category: "stationery"
    // }
  ];

  const faqs = [
    {
      question: "What file formats do you accept for designs?",
      answer: "We accept PNG and SVG files. For best results, we recommend vector files (SVG) or high-resolution PNG files (300 DPI). To obtain a PNG image, you can use https://www.remove.bg/"
    },
    {
      question: "How long does delivery take?",
      answer: "Production and delivery takes 3-4 business days, depending on your location and item quantity. "
    },
    {
      question: "Can I see a mockup before ordering?",
      answer: "Yes! Our real-time preview shows exactly how your final product will look. You can examine every detail before placing your order."
    },
    {
      question: "What's your return policy?",
      answer: "We offer 30-day returns for defective items. Since products are custom-made, we cannot accept returns for design changes or personal preferences."
    },
    // {
    //   question: "Do you offer bulk ordering discounts?",
    //   answer: "Absolutely! We provide significant discounts for orders of 25+ items. Contact our sales team for custom pricing on large orders."
    // }
  ];

  const testimonials = [
    {
      name: "Sarah Jones",
      role: "Small Business Owner",
      content: "The design tool is incredibly intuitive. My team created branded merchandise in minutes!",
      rating: 5
    },
    {
      name: "Mike Acheampong",
      role: "Event Coordinator",
      content: "Perfect for our company retreat. The preview feature saved us from costly mistakes.",
      rating: 5
    },
    {
      name: "Emily Davis",
      role: "Content Creator",
      content: "Love the quality! My custom hoodies look exactly like the digital mockup.",
      rating: 5
    }
  ];

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="relative z-50 px-4 sm:px-6 py-4 bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <img src={plangex_logo} alt="Plangex Logo" className="w-[90px] h-[25px]" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4 sm:space-x-6"
            
          >
            <button className="text-gray-400 hover:text-gray-200 transition-colors hidden sm:block" onClick={() => navigate('/login')}>
              Login
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-full font-semibold text-sm sm:text-base shadow-sm hover:shadow transition-shadow"
            onClick={() => navigate('/register')}
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section - Dark background */}
      <section className="relative px-4 sm:px-6 py-12 md:py-16 lg:py-20 overflow-hidden bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left order-2 lg:order-1"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-gray-800 rounded-full px-4 py-2 mb-6"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-200">No design experience needed</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
              >
                Create Custom
                <span className="text-blue-400 block sm:inline">
                  {" "}Products{" "}
                </span>
                Like Magic
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed"
              >
                Design, preview, and order custom merchandise with our intuitive drag-and-drop platform. See exactly how your creation will look before it's printed.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-full font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-shadow"
                  onClick={()=> navigate('/login')}
                >
                  <span>Start Creating</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-800 text-gray-200 px-6 sm:px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-700 transition-colors border border-gray-700"
                >
                  Watch Demo
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-10 flex items-center justify-center lg:justify-start space-x-2 text-gray-400"
              >
                <span className="text-sm">SCROLL DOWN FOR MORE</span>
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Content - Mockup Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative order-1 lg:order-2 mb-8 lg:mb-0"
            >
              <div className="relative">
                {/* White shadow effect using multiple box-shadows */}
                <div className="relative rounded-2xl overflow-hidden"
                  style={{
                    boxShadow: '0 25px 50px -12px rgba(255, 255, 255, 0.15), 0 10px 30px -15px rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <img
                    src={mockupImage2}
                    alt="Professional T-Shirt Mockup"
                    className="w-full h-auto rounded-2xl"
                    loading="lazy"
                  />
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-3 -left-3 bg-blue-600 rounded-xl p-3 shadow-lg"
                >
                  <Shirt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.div>
                
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-3 -right-3 bg-white rounded-xl p-3 shadow-lg"
                >
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Design Made Simple
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to create professional custom products
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="bg-gray-900 w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="px-4 sm:px-6 py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Canvas
            </h2>
            <p className="text-lg text-gray-600">
              From apparel to accessories, we've got you covered
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -3 }}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200">
                  <div className="relative h-36 sm:h-40 overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-gray-800">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {product.category}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="px-4 sm:px-6 py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              See It In Action
            </h2>
            <p className="text-lg text-gray-600">
              Watch how easy it is to create custom products
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden shadow-lg mx-auto bg-white border border-gray-200"
          >
            <div className="bg-gray-100 aspect-video flex items-center justify-center relative">
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleVideo}
                  className="bg-gray-900 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow mb-3"
                >
                  <Play className="w-6 h-6 text-white ml-0.5" />
                </motion.button>
                <p className="text-gray-700">Click to play demo</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 sm:px-6 py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by Creators
            </h2>
            <p className="text-lg text-gray-600">
              See what our customers are saying
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 sm:px-6 py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about creating custom products
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
                >
                  <span className="text-left pr-4">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: activeFAQ === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {activeFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-gray-600">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-200"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Create Something Amazing?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who trust us with their custom products
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-900 text-white px-8 md:px-12 py-4 rounded-full font-semibold text-lg inline-flex items-center space-x-2 shadow-sm hover:shadow transition-shadow"
              onClick={()=> navigate('/login')}
            >
              <span>Start Designing Now</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center items-center space-x-2 mb-6">
            <img src={plangex_logo_black} alt="Plangex Logo" className="w-[90px] h-[30px]" />
          </div>
          
          <p className="text-gray-600 mb-6">
            Making custom product creation accessible to everyone
          </p>
          
          <div className="flex justify-center space-x-6 text-gray-500 text-sm flex-wrap">
            {/* <a href="#" className="hover:text-gray-900 transition-colors mb-2">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors mb-2">Terms</a>
            <a href="#" className="hover:text-gray-900 transition-colors mb-2">Contact</a>
            <a href="#" className="hover:text-gray-900 transition-colors mb-2">Support</a> */}
            <p>Copyright © {new Date().getFullYear()} Plangex. All rights reserved.</p>
          </div>

          <div className="mt-6 sm:hidden flex items-center justify-center space-x-2 text-gray-400 text-xs">
            <Smartphone className="w-4 h-4" />
            <span>Optimized for mobile experience</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomProductPlatform;