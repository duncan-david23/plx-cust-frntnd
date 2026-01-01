import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import plangex_logo from '../assets/PlangeX_logo_white.png'; 
import { 
  ArrowRight, 
  Sparkles, 
  Eye, 
  EyeOff,
  Mail,
  Lock,
  User,
  Shield,
  Check,
  ArrowLeft
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [msg, setMsg] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const features = [
    {
      icon: <Sparkles className="w-5 h-5 text-white" />,
      text: "Real-time design preview"
    },
    {
      icon: <Shield className="w-5 h-5 text-white" />,
      text: "Secure cloud storage"
    },
    {
      icon: <Check className="w-5 h-5 text-white" />,
      text: "Professional quality"
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle registration logic here

    if(formData.password !== formData.confirmPassword){
            setMsg('Passwords do not match')
              return;
            }
            
  
    try {
      setIsLoading(true);
      const { data, error} = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      });
  
      if (error) {
            console.log(error);
            setMsg(error.message);
            return;
        }

        console.log(data.user);
        setMsg('User has been successfully registered');
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', formData.fullName);
    //     console.log(data.user.id,  data.user.email, formData.fullName, formData.referralCode);

    //   const { data: { session } } = await supabase.auth.getSession()
    //   const accessToken = session?.access_token
     

    //        const response = await axios.post(`https://agi-backend.onrender.com/api/users/create-profile`,{userId:data.user.id, fullName:formData.fullName, email:formData.email, referralCode:formData.referralCode}, {
    //         headers: { Authorization: `Bearer ${accessToken}` },
    //       });
    //       const result = response.data;
    //       console.log('User profile created:', result);

       
  
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing in:', error);
      setMsg( 'An error occurred during sign up, please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Simplified Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/5 rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
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
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 max-w-7xl mx-auto w-full items-center">
          {/* Left Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-md">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-gray-700 p-6 sm:p-8 shadow-xl">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl sm:text-3xl font-bold text-white mb-2"
                  >
                    Create Account
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-300 text-sm sm:text-base"
                  >
                    Join thousands of creators
                  </motion.p>
                </div>

                {/* Already have account link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center mb-6"
                >
                  <span className="text-gray-300 text-sm">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Sign In
                    </Link>
                  </span>
                </motion.div>
                 {msg && 
                  <p className='px-[8px] py-[4px] text-sm rounded-lg mb-[10px] bg-gray-500 text-center text-white'>{msg}</p>
                }

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="relative"
                  >
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl sm:rounded-2xl pl-12 pr-4 py-3 sm:py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </motion.div>

                  {/* Email */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="relative"
                  >
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl sm:rounded-2xl pl-12 pr-4 py-3 sm:py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </motion.div>

                  {/* Password */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="relative"
                  >
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl sm:rounded-2xl pl-12 pr-12 py-3 sm:py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </motion.div>

                  {/* Confirm Password */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="relative"
                  >
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl sm:rounded-2xl pl-12 pr-12 py-3 sm:py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold shadow hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Features */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="max-w-lg">
              {/* Logo */}
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>

                  <p className="text-gray-300">Custom Product Platform</p>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-6 mb-8">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Everything you need to create amazing custom products
                </h3>
                
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center space-x-4 text-gray-200"
                  >
                    <div className="w-10 h-10 bg-gray-800/50 rounded-xl flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <span className="text-lg">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-700"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-gray-300 text-sm">Creators</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">50K+</div>
                  <div className="text-gray-300 text-sm">Designs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">99%</div>
                  <div className="text-gray-300 text-sm">Satisfaction</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;