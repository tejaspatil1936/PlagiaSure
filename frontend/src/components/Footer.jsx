import { Link } from "react-router-dom";
import { Mail, Shield, FileText, Heart, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#2D4B7C] via-[#3282B8] to-[#3AB795] relative overflow-hidden mt-auto">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-32 translate-x-32 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#52DE97] rounded-full blur-2xl translate-y-24 -translate-x-24 animate-float"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Brand Section */}
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm border border-white border-opacity-30 shadow-lg">
                    <img
                      src="/plagiasure.png"
                      alt="PlagiaSure Logo"
                      className="h-8 w-8"
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#52DE97] rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">PlagiaSure</h3>
                  <p className="text-white text-opacity-90 text-sm font-medium">
                    AI Detection Suite
                  </p>
                </div>
              </div>
              <p className="text-white text-opacity-80 text-sm leading-relaxed max-w-md">
                Advanced AI and plagiarism detection platform trusted by
                educators worldwide. Maintain academic integrity with
                cutting-edge technology and comprehensive analysis.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Quick Links
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/privacy"
                    className="text-white text-opacity-80 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                  >
                    <Shield className="h-3 w-3 mr-2 opacity-60 group-hover:opacity-100" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-white text-opacity-80 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                  >
                    <FileText className="h-3 w-3 mr-2 opacity-60 group-hover:opacity-100" />
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/refund"
                    className="text-white text-opacity-80 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                  >
                    <Shield className="h-3 w-3 mr-2 opacity-60 group-hover:opacity-100" />
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-white text-opacity-80 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                  >
                    <Mail className="h-3 w-3 mr-2 opacity-60 group-hover:opacity-100" />
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white border-opacity-20 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center text-white text-opacity-80 text-sm">
              <span>© 2025 PlagiaSure. All rights reserved.</span>
              <span className="mx-2">•</span>
              <span className="flex items-center">
                Made with <Heart className="h-4 w-4 mx-1 text-red-400" /> for
                Education
              </span>
            </div>

            <div className="flex items-center space-x-6 text-xs text-white text-opacity-70">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>System Status: Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-3 w-3" />
                <span>API Status: Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Free APIs Attribution */}
        <div className="border-t border-white border-opacity-10 py-4">
          <div className="text-center">
            <p className="text-xs text-white text-opacity-60 mb-2">
              <span className="font-medium">Free Research APIs:</span>{" "}
              DuckDuckGo, Semantic Scholar, CrossRef, arXiv
            </p>
            <p className="text-xs text-white text-opacity-50">
              Supporting open research and academic integrity through
              collaborative technology
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
