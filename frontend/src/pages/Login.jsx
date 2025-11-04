import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff, Loader2, ArrowLeft, Shield, Zap, Users } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex">
      {/* Left Side - Form */}
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
                <div className="p-4 bg-gradient-to-br from-[#3282B8] to-[#52DE97] rounded-2xl shadow-lg">
                  <img
                    src="/plagiasure.png"
                    alt="PlagiaSure Logo"
                    className="h-12 w-12"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#52DE97] rounded-full animate-pulse"></div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to access your AI detection dashboard
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3282B8] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Enter your email address"
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
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3282B8] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
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
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#3282B8] to-[#52DE97] text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Sign In
                  </div>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-[#3282B8] hover:text-[#2D4B7C] transition-colors duration-200"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Features (Hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-[#2D4B7C] via-[#3282B8] to-[#3AB795] relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-48 translate-x-48 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#52DE97] rounded-full blur-2xl translate-y-40 -translate-x-40 animate-float"></div>
          <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-white opacity-40 rounded-full animate-ping"></div>
          <div className="absolute top-1/4 right-1/2 w-6 h-6 bg-[#52DE97] opacity-50 rounded-full animate-bounce"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-12">
          <div className="max-w-md">
            <h3 className="text-3xl font-bold text-white mb-6">
              Advanced AI Detection Platform
            </h3>
            <p className="text-white text-opacity-90 text-lg mb-8">
              Join thousands of educators using our cutting-edge technology to maintain academic integrity.
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Zap className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Lightning Fast Analysis</h4>
                  <p className="text-white text-opacity-80 text-sm">Get comprehensive reports in seconds with our advanced AI algorithms.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Shield className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Secure & Private</h4>
                  <p className="text-white text-opacity-80 text-sm">Your documents are processed securely with enterprise-grade encryption.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Users className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Trusted by Educators</h4>
                  <p className="text-white text-opacity-80 text-sm">Used by leading institutions worldwide for academic integrity.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
