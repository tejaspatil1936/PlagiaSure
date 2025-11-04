import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";

const PolicyLayout = ({ title, lastUpdated, children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center text-[#3282B8] hover:text-[#2D4B7C] transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to PlagiaSure
            </Link>
            <div className="flex items-center space-x-3">
              <img
                src="/plagiasure.png"
                alt="PlagiaSure Logo"
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-[#2D4B7C]">PlagiaSure</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
            {lastUpdated && (
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Last updated: {lastUpdated}</span>
              </div>
            )}
          </div>
          
          <div className="prose prose-lg max-w-none">
            {children}
          </div>
        </div>
      </main>

      {/* Footer with Policy Links */}
      <footer className="bg-[#2D4B7C] text-white py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Policy Pages</h3>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link to="/privacy" className="hover:text-gray-300 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-gray-300 transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/refund" className="hover:text-gray-300 transition-colors">
                Cancellation & Refund
              </Link>
              <Link to="/contact" className="hover:text-gray-300 transition-colors">
                Contact Us
              </Link>
              <Link to="/shipping" className="hover:text-gray-300 transition-colors">
                Shipping Policy
              </Link>
            </div>
            <div className="mt-6 pt-6 border-t border-white/20 text-center text-white/60">
              <p>&copy; 2025 PlagiaSure. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PolicyLayout;