import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Loader2, ArrowLeft, Shield, Zap, Users, CheckCircle } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    role: 'teacher'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const result = await signup(
      formData.email, 
      formData.password, 
      formData.schoolName, 
      formData.role
    );
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex">
      {/* Left Side - Features (Hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-[#3AB795] via-[#52DE97] to-[#3282B8] relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-48 -translate-x-48 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#2D4B7C] rounded-full blur-2xl translate-y-40 translate-x-40 animate-float"></div>
          <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-white opacity-40 rounded-full animate-ping"></div>
          <div className="absolute top-1/4 left-1/2 w-6 h-6 bg-[#2D4B7C] opacity-50 rounded-full animate-bounce"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-12">
          <div className="max-w-md">
            <h3 className="text-3xl font-bold text-white mb-6">
              Join the Future of Education
            </h3>
            <p className="text-white text-opacity-90 text-lg mb-8">
              Become part of a community dedicated to maintaining academic integrity with cutting-edge AI technology.
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Instant Setup</h4>
                  <p className="text-white text-opacity-80 text-sm">Get started immediately with our streamlined onboarding process.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Zap className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Powerful Analytics</h4>
                  <p className="text-white text-opacity-80 text-sm">Access detailed reports and insights to improve academic outcomes.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Users className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Community Support</h4>
                  <p className="text-white text-opacity-80 text-sm">Join a network of educators committed to academic excellence.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Back to Home Button */}
          <div className="flex justify-start">
            <Link
              to="/"
              className="inline-flex items-center text-[#3282B8] hover:text-[#2D4B7C] font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-[#52DE97] to-[#3AB795] rounded-2xl shadow-lg">
                  <img
                    src="/plagiasure.png"
                    alt="PlagiaSure Logo"
                    className="h-12 w-12"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#3282B8] rounded-full animate-pulse"></div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h2>
            <p className="text-gray-600">
              Join PlagiaSure for advanced AI & plagiarism detection
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-red-500 mr-2" />
                    {error}
                  </div>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#52DE97] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label
                    htmlFor="schoolName"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    School/Institution Name
                  </label>
                  <input
                    id="schoolName"
                    name="schoolName"
                    type="text"
                    required
                    value={formData.schoolName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#52DE97] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Enter your school or institution name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#52DE97] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#52DE97] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#52DE97] to-[#3AB795] text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Create Account
                  </div>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#52DE97] hover:text-[#3AB795] transition-colors duration-200"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;