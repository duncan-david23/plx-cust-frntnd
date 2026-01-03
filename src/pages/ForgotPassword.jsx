import React, { useState } from 'react';
import { motion } from 'framer-motion';
import plangex_logo from '../assets/PlangeX_logo_white.png'; 
import { 
  Mail, 
  Key, 
  ArrowLeft,
  Shield,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Send
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMsg('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setMsg('Please enter a valid email format');
      toast.error('Please enter a valid email format');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://plangex.netlify.app/reset-password',
    });

    if (error) {
      console.error('Error:', error.message);
      setMsg('Error: ' + error.message);
      toast.error('Error: ' + error.message);
    } else {
      setMsg('Reset email sent! Check your inbox.');
      toast.success('Reset email sent! Check your inbox.');
      setEmailSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      {/* Toaster for notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
        }}
      />

      {/* Navigation */}
      <nav className="relative z-50 px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/login')}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Login</span>
          </motion.button>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
             <img src={plangex_logo} alt="Plangex Logo" className="w-[90px] h-[25px]" />
          </motion.div>
        </div>
      </nav>

      <div className="relative z-10 min-h-[80vh] flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-gray-700 p-6 sm:p-8 shadow-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                  emailSent 
                    ? 'bg-gradient-to-br from-green-600 to-emerald-600' 
                    : 'bg-gradient-to-br from-blue-600 to-blue-800'
                }`}
              >
                {emailSent ? (
                  <CheckCircle className="w-8 h-8 text-white" />
                ) : (
                  <Key className="w-8 h-8 text-white" />
                )}
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-3xl font-bold text-white mb-2"
              >
                {emailSent ? 'Check Your Email' : 'Forgot Password'}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-300 text-sm sm:text-base"
              >
                {emailSent 
                  ? 'We sent a password reset link to your email'
                  : "Enter your email and we'll send you a reset link"}
              </motion.p>
            </div>

            {/* Message Alert */}
            {msg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mb-6 p-4 rounded-xl border ${
                  msg.includes('sent') || emailSent
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {msg.includes('sent') || emailSent ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <p className={`text-sm ${
                    msg.includes('sent') || emailSent ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {msg}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Form or Success Message */}
            {!emailSent ? (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Email Address</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (msg) setMsg('');
                      }}
                      placeholder="Enter your email address"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending Reset Link...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </motion.button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-6"
              >
                {/* Email Sent Success Message */}
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Check Your Inbox</h3>
                      <p className="text-sm text-gray-300">
                        We've sent a password reset link to <strong className="text-white">{email}</strong>. 
                        The link will expire in 24 hours.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Actions */}
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setEmailSent(false);
                      setMsg('');
                    }}
                    className="w-full bg-gray-700/50 border border-gray-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-700 transition-all duration-200"
                  >
                    Try Another Email
                  </button>
                  
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                  >
                    Back to Login
                  </button>
                </div>
              </motion.div>
            )}

            {/* Additional Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-gray-400">
                Remember your password?{' '}
                <Link 
                  to="/login" 
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Back to Login
                </Link>
              </p>
            </motion.div>

            {/* Security Note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700"
            >
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-300 mb-1">Security Note</p>
                  <p className="text-xs text-gray-400">
                    The reset link will expire after 24 hours for your protection. 
                    Didn't receive the email? Check your spam folder.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center mt-6"
          >
            <p className="text-xs text-gray-500">
              Need help?{' '}
              <a 
                href="/support" 
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Contact our support team
              </a>
            </p>
          </motion.div> */}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;