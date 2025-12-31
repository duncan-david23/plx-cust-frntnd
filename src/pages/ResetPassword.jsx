import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import plangex_logo from '../assets/plangeX_logo_white.png';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff,
  ArrowLeft,
  Check,
  AlertCircle,
  Key,
  Sparkles
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [sessionValid, setSessionValid] = useState(true);

  const navigate = useNavigate();

  const checkPasswordStrength = (pwd) => {
    if (!pwd) return '';
    if (pwd.length < 6) return 'weak';
    if (pwd.length < 8) return 'medium';
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) return 'strong';
    return 'medium';
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMsg('Passwords do not match, try again');
      return;
    }

    if (!password || password.length < 6) {
      setMsg('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error(error);
      setMsg('Error: ' + error.message);
    } else {
      setMsg('Password successfully reset! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }

    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setSessionValid(false);
        setMsg('Session expired or invalid reset link.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    });
  }, [navigate]);

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password));
  }, [password]);

  const getStrengthColor = () => {
    switch(passwordStrength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-600';
    }
  };

  const getStrengthText = () => {
    switch(passwordStrength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      default: return '';
    }
  };

  const passwordRequirements = [
    {
      text: "At least 6 characters",
      met: password.length >= 6,
    },
    {
      text: "8+ characters for better security",
      met: password.length >= 8,
    },
    {
      text: "Contains uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      text: "Contains number",
      met: /[0-9]/.test(password),
    },
    {
      text: "Contains special character",
      met: /[^A-Za-z0-9]/.test(password),
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

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
                className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <Key className="w-8 h-8 text-white" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-3xl font-bold text-white mb-2"
              >
                Reset Password
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-300 text-sm sm:text-base"
              >
                Create a new secure password for your account
              </motion.p>
            </div>

            {/* Session Expired Warning */}
            {!sessionValid && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-400 text-sm">{msg}</p>
                </div>
              </motion.div>
            )}

            {/* Success/Error Message */}
            {msg && sessionValid && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-xl border ${
                  msg.includes('successfully') || msg.includes('Redirecting')
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {msg.includes('successfully') || msg.includes('Redirecting') ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <p className="text-sm">{msg}</p>
                </div>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* New Password */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>New Password</span>
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your new password"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl pl-4 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    disabled={!sessionValid}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    disabled={!sessionValid}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Password strength:</span>
                      <span className={`font-medium ${
                        passwordStrength === 'weak' ? 'text-red-400' :
                        passwordStrength === 'medium' ? 'text-yellow-400' :
                        passwordStrength === 'strong' ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {getStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ 
                          width: passwordStrength === 'weak' ? '33%' :
                                  passwordStrength === 'medium' ? '66%' :
                                  passwordStrength === 'strong' ? '100%' : '0%'
                        }}
                        transition={{ duration: 0.3 }}
                        className={`h-2 ${getStrengthColor()} rounded-full`}
                      />
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Confirm Password */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Confirm Password</span>
                </label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl pl-4 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    disabled={!sessionValid}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    disabled={!sessionValid}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Password Requirements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"
              >
                <p className="text-xs font-medium text-gray-300 mb-3">Password requirements:</p>
                <div className="space-y-2">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        req.met ? 'bg-green-500/20' : 'bg-gray-700'
                      }`}>
                        {req.met && <Check className="w-3 h-3 text-green-400" />}
                      </div>
                      <span className={`text-xs ${req.met ? 'text-green-400' : 'text-gray-400'}`}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                type="submit" 
                disabled={loading || !sessionValid}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    <span>Reset Password</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Additional Info */}
            {/* <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center mt-6 pt-6 border-t border-gray-700"
            >
              <p className="text-sm text-gray-400">
                Having trouble?{' '}
                <Link to="/support" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Contact Support
                </Link>
              </p>
            </motion.div> */}
          </div>

          {/* Security Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center space-x-2 text-sm text-gray-400">
              <Shield className="w-4 h-4" />
              <span>Your password is encrypted and securely stored</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;