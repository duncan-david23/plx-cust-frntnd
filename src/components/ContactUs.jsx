import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  UserIcon,
  EnvelopeOpenIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    // Get user data from localStorage
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email') || localStorage.getItem('userEmail');
    
    if (storedUsername) {
      setFormData(prev => ({
        ...prev,
        name: storedUsername,
        email: storedEmail || ''
      }));
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'message') {
      setCharCount(value.length);
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Replace with your actual backend endpoint
      const response = await axios.post('https://your-backend-api.com/contact', {
        ...formData,
        timestamp: new Date().toISOString(),
        userId: localStorage.getItem('userId') || null
      });
      
      if (response.status === 200 || response.status === 201) {
        setSubmitStatus('success');
        setSubmitMessage('Your message has been sent successfully!');
        
        // Clear form but keep user info
        setFormData({
          name: localStorage.getItem('username') || '',
          email: localStorage.getItem('email') || localStorage.getItem('userEmail') || '',
          subject: '',
          message: ''
        });
        setCharCount(0);
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(error.response?.data?.message || 'Failed to send message. Please try again later.');
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <MapPinIcon className="w-6 h-6" />,
      title: "Visit Our Office",
      details: ["123 Business Street", "Suite 100, New York, NY 10001"],
      description: "Feel free to visit us during business hours"
    },
    {
      icon: <PhoneIcon className="w-6 h-6" />,
      title: "Call Us",
      details: ["+1 (555) 123-4567", "+1 (555) 987-6543"],
      description: "Mon - Fri, 9:00 AM - 6:00 PM EST"
    },
    {
      icon: <EnvelopeIcon className="w-6 h-6" />,
      title: "Email Us",
      details: ["support@company.com", "sales@company.com"],
      description: "We respond within 24 hours"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-6">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions or need assistance? We're here to help! Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {contactInfo.map((info, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                      {info.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-600 mb-1">{detail}</p>
                    ))}
                    <p className="text-sm text-gray-500 mt-2">{info.description}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <ClockIcon className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Response Time</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-indigo-100">Average Response</span>
                  <span className="font-semibold">Within 4 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-100">Support Hours</span>
                  <span className="font-semibold">24/7 Available</span>
                </div>
                <div className="pt-4 border-t border-indigo-400">
                  <p className="text-sm text-indigo-200">
                    Our support team is always ready to assist you with any questions or concerns.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <EnvelopeOpenIcon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
                </div>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible. All fields marked with * are required.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Status Messages */}
                {submitStatus && (
                  <div className={`rounded-xl p-4 border ${
                    submitStatus === 'success' 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center space-x-3">
                      {submitStatus === 'success' ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
                      )}
                      <p className="font-medium">{submitMessage}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-1">
                        <UserIcon className="w-4 h-4" />
                        <span>Full Name *</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.name 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                      } focus:outline-none focus:ring-2 transition-colors`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-1">
                        <EnvelopeIcon className="w-4 h-4" />
                        <span>Email Address *</span>
                      </div>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.email 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                      } focus:outline-none focus:ring-2 transition-colors`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Subject Field */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.subject 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    } focus:outline-none focus:ring-2 transition-colors`}
                    placeholder="What is this regarding?"
                  />
                  {errors.subject && (
                    <p className="mt-2 text-sm text-red-600">{errors.subject}</p>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.message 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    } focus:outline-none focus:ring-2 transition-colors resize-none`}
                    placeholder="Please provide details about your inquiry..."
                  />
                  <div className="flex justify-between items-center mt-2">
                    {errors.message ? (
                      <p className="text-sm text-red-600">{errors.message}</p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Minimum 10 characters required
                      </p>
                    )}
                    <p className={`text-sm ${
                      charCount < 10 ? 'text-gray-500' : 'text-green-600'
                    }`}>
                      {charCount} characters
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                  
                  <p className="text-sm text-gray-500 mt-4 text-center md:text-left">
                    By submitting this form, you agree to our privacy policy. We'll never share your information.
                  </p>
                </div>
              </form>

              {/* Additional Info */}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;